const Performance = require('../models/Performance');
const User = require('../models/User');
const { generateContent } = require('../services/geminiService');

// @desc    Get performance records
// @route   GET /api/performance
// @access  Private
const getPerformance = async (req, res) => {
  try {
    const { student_id, subject, startDate, endDate } = req.query;
    let query = {};

    // Students can only see their own performance
    if (req.user.role === 'student') {
      query.student_id = req.user._id;
    } else if (student_id) {
      query.student_id = student_id;
    }

    if (subject) query.subject = subject;

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const performance = await Performance.find(query)
      .populate('student_id', 'name email class_id')
      .populate('resource_id', 'title subject')
      .sort({ date: -1 });

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Submit quiz answers and calculate score
// @route   POST /api/performance/submit-quiz
// @access  Private (Student)
const submitQuiz = async (req, res) => {
  try {
    const { resource_id, quiz_topic, subject, answers, questions } = req.body;
    // answers: [{question_id, student_answer}]
    // questions: [{id, question, correct_answer}]

    let score = 0;
    const totalMarks = questions.length;
    const detailedAnswers = [];

    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.question_id);
      const isCorrect = question && question.correct_answer === answer.student_answer;
      
      if (isCorrect) score++;

      detailedAnswers.push({
        question: question?.question || '',
        student_answer: answer.student_answer,
        correct_answer: question?.correct_answer || '',
        is_correct: isCorrect
      });
    }

    // Generate AI feedback
    const percentage = Math.round((score / totalMarks) * 100);
    let ai_feedback = '';

    try {
      const feedbackPrompt = `A student scored ${score}/${totalMarks} (${percentage}%) on a quiz about ${quiz_topic || subject}. 
      The following questions were answered incorrectly:
      ${detailedAnswers.filter(a => !a.is_correct).map(a => `- ${a.question}`).join('\n')}
      
      Provide brief, encouraging feedback (2-3 sentences) focusing on areas for improvement.`;

      ai_feedback = await generateContent(feedbackPrompt, { maxTokens: 150 });
    } catch (aiError) {
      console.error('AI feedback error:', aiError);
      ai_feedback = percentage >= 70 ? 'Good job! Keep up the good work.' : 'Keep practicing, you\'re making progress!';
    }

    const performance = await Performance.create({
      student_id: req.user._id,
      resource_id,
      quiz_topic,
      subject,
      score,
      total_marks: totalMarks,
      answers: detailedAnswers,
      ai_feedback
    });

    res.status(201).json(performance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get performance statistics
// @route   GET /api/performance/stats
// @access  Private
const getPerformanceStats = async (req, res) => {
  try {
    const { student_id, class_id } = req.query;
    let matchQuery = {};

    if (req.user.role === 'student') {
      matchQuery.student_id = req.user._id;
    } else if (student_id) {
      matchQuery.student_id = student_id;
    }

    // Overall stats
    const overallStats = await Performance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          avgPercentage: { $avg: '$percentage' },
          totalScore: { $sum: '$score' },
          totalMarks: { $sum: '$total_marks' }
        }
      }
    ]);

    // Subject-wise stats
    const subjectStats = await Performance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$subject',
          quizCount: { $sum: 1 },
          avgPercentage: { $avg: '$percentage' },
          highestScore: { $max: '$percentage' },
          lowestScore: { $min: '$percentage' }
        }
      },
      { $sort: { avgPercentage: -1 } }
    ]);

    // Recent performance trend (last 10)
    const recentTrend = await Performance.find(matchQuery)
      .select('subject percentage date quiz_topic')
      .sort({ date: -1 })
      .limit(10);

    res.json({
      overall: overallStats[0] || { totalQuizzes: 0, avgPercentage: 0 },
      bySubject: subjectStats,
      recentTrend
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    AI Chat for performance/attendance queries (Voice-enabled)
// @route   POST /api/performance/ai-query
// @access  Private (Teacher/Management)
const aiQuery = async (req, res) => {
  try {
    const { query, student_id, class_id } = req.body;

    // Gather relevant data based on query context
    let context = '';

    if (student_id) {
      const student = await User.findById(student_id).select('name class_id');
      const PerformanceModel = require('../models/Performance');
      const Attendance = require('../models/Attendance');

      const performances = await PerformanceModel.find({ student_id }).sort({ date: -1 }).limit(10);
      const attendanceStats = await Attendance.aggregate([
        { $match: { 'records.student': student_id } },
        { $unwind: '$records' },
        { $match: { 'records.student': student_id } },
        { $group: { _id: '$records.status', count: { $sum: 1 } } }
      ]);

      context = `
Student: ${student?.name || 'Unknown'} (Class: ${student?.class_id || 'N/A'})

Recent Quiz Performance:
${performances.map(p => `- ${p.subject}: ${p.score}/${p.total_marks} (${p.percentage}%) on ${p.date.toDateString()}`).join('\n')}

Attendance Summary:
${attendanceStats.map(a => `- ${a._id}: ${a.count} days`).join('\n')}
`;
    } else if (class_id) {
      // Get class-wide data
      const students = await User.find({ class_id, role: 'student' }).select('name');
      context = `Class ${class_id} has ${students.length} students.`;
    }

    const prompt = `You are an educational AI assistant helping teachers analyze student data.

Context:
${context}

Teacher's Question: ${query}

Provide a helpful, concise response based on the data. If specific data isn't available, mention that.`;

    const response = await generateContent(prompt, { temperature: 0.7 });

    res.json({
      response: response,
      context_used: context ? true : false
    });
  } catch (error) {
    console.error('AI query error:', error);
    res.status(500).json({ message: 'Error processing query', error: error.message });
  }
};

module.exports = {
  getPerformance,
  submitQuiz,
  getPerformanceStats,
  aiQuery
};
