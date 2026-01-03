const Resource = require('../models/Resource');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { generateJSON, generateContent } = require('../services/geminiService');

// @desc    Upload curriculum/resource
// @route   POST /api/resources/upload
// @access  Private (Teacher)
const uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const { subject, title, description, type, class_id } = req.body;

    // Extract text from PDF
    const pdfPath = req.file.path;
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(dataBuffer);
    const extractedText = pdfData.text;

    const resource = await Resource.create({
      teacher_id: req.user._id,
      subject,
      title,
      description,
      type: type || 'curriculum',
      file_path: req.file.path,
      file_name: req.file.originalname,
      extracted_text: extractedText,
      class_id
    });

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res) => {
  try {
    const { subject, type, class_id, teacher_id } = req.query;
    let query = {};

    if (subject) query.subject = subject;
    if (type) query.type = type;
    if (class_id) query.class_id = class_id;
    
    if (req.user.role === 'teacher') {
      query.teacher_id = req.user._id;
    } else if (teacher_id) {
      query.teacher_id = teacher_id;
    }

    const resources = await Resource.find(query)
      .populate('teacher_id', 'name email subject')
      .sort({ upload_date: -1 });

    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('teacher_id', 'name email subject');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Generate quiz from curriculum using Gemini AI
// @route   POST /api/resources/:id/generate-quiz
// @access  Private (Teacher)
const generateQuiz = async (req, res) => {
  try {
    const { numQuestions = 5, difficulty = 'medium' } = req.body;
    
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (!resource.extracted_text) {
      return res.status(400).json({ message: 'No text content available to generate quiz' });
    }

    const prompt = `Based on the following educational content, generate ${numQuestions} multiple choice questions with ${difficulty} difficulty level. 
    
Content:
${resource.extracted_text.substring(0, 8000)}

Please generate a JSON response with the following structure:
{
  "quiz_title": "Quiz on [Topic]",
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correct_answer": "A",
      "explanation": "Brief explanation"
    }
  ]
}`;

    const quizContent = await generateJSON(prompt, { temperature: 0.7 });

    res.json({
      resource_id: resource._id,
      subject: resource.subject,
      ...quizContent
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ message: 'Error generating quiz', error: error.message });
  }
};

// @desc    Generate lesson plan from curriculum using Gemini AI
// @route   POST /api/resources/:id/generate-lesson-plan
// @access  Private (Teacher)
const generateLessonPlan = async (req, res) => {
  try {
    const { duration = '45 minutes', grade_level = '10th' } = req.body;
    
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (!resource.extracted_text) {
      return res.status(400).json({ message: 'No text content available' });
    }

    const prompt = `Based on the following curriculum content, create a detailed lesson plan for ${grade_level} grade students with a duration of ${duration}.

Content:
${resource.extracted_text.substring(0, 8000)}

Please create a comprehensive lesson plan in JSON format with:
{
  "title": "Lesson title",
  "subject": "${resource.subject}",
  "grade_level": "${grade_level}",
  "duration": "${duration}",
  "learning_objectives": ["objective 1", "objective 2"],
  "materials_needed": ["material 1", "material 2"],
  "lesson_outline": [
    {
      "phase": "Introduction",
      "duration": "5 minutes",
      "activities": ["Activity description"],
      "teacher_notes": "Notes for teacher"
    }
  ],
  "assessment_methods": ["method 1", "method 2"],
  "homework": "Homework assignment description"
}`;

    const lessonPlan = await generateJSON(prompt, { temperature: 0.7 });

    // Save as a new resource of type lesson_plan
    const savedPlan = await Resource.create({
      teacher_id: req.user._id,
      subject: resource.subject,
      title: `Lesson Plan: ${lessonPlan.title}`,
      type: 'lesson_plan',
      class_id: resource.class_id,
      generated_content: JSON.stringify(lessonPlan)
    });

    res.json({
      resource_id: savedPlan._id,
      ...lessonPlan
    });
  } catch (error) {
    console.error('Lesson plan generation error:', error);
    res.status(500).json({ message: 'Error generating lesson plan', error: error.message });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Teacher)
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check ownership
    if (resource.teacher_id.toString() !== req.user._id.toString() && req.user.role !== 'management') {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    // Delete file if exists
    if (resource.file_path && fs.existsSync(resource.file_path)) {
      fs.unlinkSync(resource.file_path);
    }

    await resource.deleteOne();
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  uploadResource,
  getResources,
  getResource,
  generateQuiz,
  generateLessonPlan,
  deleteResource
};
