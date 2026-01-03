import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiClock, FiCheckCircle, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

const StudentQuiz = () => {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    generateQuiz();
  }, [resourceId]);

  const generateQuiz = async () => {
    try {
      const response = await api.post(`/resources/${resourceId}/generate-quiz`, {
        numQuestions: 5,
        difficulty: 'medium'
      });
      setQuiz(response.data);
    } catch (error) {
      toast.error('Failed to generate quiz');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      toast.warning('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const answerArray = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: parseInt(questionId),
        student_answer: answer
      }));

      const response = await api.post('/performance/submit-quiz', {
        resource_id: resourceId,
        quiz_topic: quiz.quiz_title,
        subject: quiz.subject,
        answers: answerArray,
        questions: quiz.questions
      });

      setResult(response.data);
      toast.success('Quiz submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Generating your quiz...</p>
      </div>
    );
  }

  if (result) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card">
          <div className="card-header" style={{ textAlign: 'center', background: 'var(--primary-color)', color: 'white' }}>
            <h3 className="card-title">Quiz Complete! 🎉</h3>
          </div>
          <div className="card-body" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {result.percentage >= 80 ? '🏆' : result.percentage >= 60 ? '👍' : '💪'}
            </div>
            <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--primary-color)' }}>
              {result.score}/{result.total_marks}
            </div>
            <div style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {result.percentage}% Score
            </div>
            
            <div style={{ 
              background: 'var(--background)', 
              padding: '1.5rem', 
              borderRadius: 'var(--radius)',
              textAlign: 'left',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ marginBottom: '0.5rem' }}>AI Feedback:</h4>
              <p style={{ color: 'var(--text-secondary)' }}>{result.ai_feedback}</p>
            </div>

            <button 
              className="btn btn-primary"
              onClick={() => navigate('/student/performance')}
            >
              View All Performance
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz?.questions?.[currentQuestion];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{quiz?.quiz_title}</h3>
          <span className="badge badge-primary">
            Question {currentQuestion + 1} of {quiz?.questions?.length}
          </span>
        </div>
        <div className="card-body">
          {/* Progress Bar */}
          <div style={{ 
            height: '4px', 
            background: 'var(--border-color)', 
            borderRadius: '2px',
            marginBottom: '2rem',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${((currentQuestion + 1) / quiz?.questions?.length) * 100}%`,
              background: 'var(--primary-color)',
              transition: 'width 0.3s'
            }} />
          </div>

          {/* Question */}
          <h4 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
            {question?.question}
          </h4>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {question?.options?.map((option, index) => {
              const optionLetter = option.charAt(0);
              const isSelected = answers[question.id] === optionLetter;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(question.id, optionLetter)}
                  style={{
                    padding: '1rem',
                    border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius)',
                    background: isSelected ? 'rgba(79, 70, 229, 0.1)' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isSelected ? 'var(--primary-color)' : 'var(--background)',
                    color: isSelected ? 'white' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}>
                    {optionLetter}
                  </span>
                  {option.substring(3)}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              disabled={currentQuestion === 0}
            >
              <FiArrowLeft /> Previous
            </button>

            {currentQuestion === quiz?.questions?.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'} <FiCheckCircle />
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentQuestion(prev => prev + 1)}
              >
                Next <FiArrowRight />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuiz;
