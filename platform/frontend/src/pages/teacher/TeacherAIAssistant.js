import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiMic, FiMicOff, FiSend, FiUser, FiMessageSquare } from 'react-icons/fi';

const TeacherAIAssistant = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchStudents();
    initSpeechRecognition();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/users?role=student');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Speech recognition error. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { type: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const response = await api.post('/performance/ai-query', {
        query,
        student_id: selectedStudent || undefined
      });

      const aiMessage = { type: 'ai', text: response.data.response };
      setMessages(prev => [...prev, aiMessage]);

      // Text-to-speech for AI response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response.data.response);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      toast.error('Failed to get AI response');
      const errorMessage = { type: 'ai', text: 'Sorry, I encountered an error processing your request. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickQueries = [
    "What's the attendance rate this month?",
    "Who has the lowest attendance?",
    "Show me performance summary",
    "Which students need attention?",
    "What's the class average score?"
  ];

  return (
    <div style={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-body" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiMessageSquare size={24} color="var(--primary-color)" />
              <span style={{ fontWeight: '600' }}>AI Teaching Assistant</span>
            </div>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: 'var(--radius)', 
                border: '1px solid var(--border-color)',
                minWidth: '200px'
              }}
            >
              <option value="">All Students (General Query)</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.class_id || 'No Class'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Queries */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {quickQueries.map((q, i) => (
          <button
            key={i}
            className="btn btn-secondary btn-sm"
            onClick={() => setQuery(q)}
            style={{ fontSize: '0.75rem' }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {messages.length === 0 ? (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}>
              <FiMessageSquare size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>AI Teaching Assistant</p>
              <p style={{ fontSize: '0.875rem' }}>Ask questions about student performance, attendance, or get insights</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                🎤 Use voice input for hands-free queries
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                  gap: '0.75rem'
                }}
              >
                {msg.type === 'ai' && (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--primary-color)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    🤖
                  </div>
                )}
                <div style={{
                  maxWidth: '70%',
                  padding: '0.875rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  background: msg.type === 'user' ? 'var(--primary-color)' : 'var(--background)',
                  color: msg.type === 'user' ? 'white' : 'var(--text-primary)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}
                </div>
                {msg.type === 'user' && (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--secondary-color)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FiUser />
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--primary-color)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                🤖
              </div>
              <div style={{
                padding: '0.875rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--background)'
              }}>
                <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} style={{ 
          borderTop: '1px solid var(--border-color)', 
          padding: '1rem',
          display: 'flex',
          gap: '0.75rem'
        }}>
          <button
            type="button"
            onClick={toggleListening}
            className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'}`}
            style={{ padding: '0.75rem' }}
          >
            {isListening ? <FiMicOff size={20} /> : <FiMic size={20} />}
          </button>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isListening ? 'Listening...' : 'Ask about student performance, attendance...'}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              fontSize: '1rem'
            }}
            disabled={loading || isListening}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !query.trim()}
          >
            <FiSend size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherAIAssistant;
