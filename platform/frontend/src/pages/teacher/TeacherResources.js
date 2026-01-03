import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiUpload, FiFile, FiBook, FiFileText, FiTrash2, FiPlay, FiLoader } from 'react-icons/fi';

const TeacherResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    type: 'curriculum',
    class_id: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Computer Science', 'Social Science'];

  useEffect(() => {
    fetchResources();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes?all=true');
      if (res.data && res.data.length > 0) {
        setClasses(res.data);
      } else {
        // Fallback classes if none exist
        setClasses([
          { _id: '9-A', name: 'Class 9-A' },
          { _id: '9-B', name: 'Class 9-B' },
          { _id: '10-A', name: 'Class 10-A' },
          { _id: '10-B', name: 'Class 10-B' },
          { _id: '11-A', name: 'Class 11-A' },
          { _id: '11-B', name: 'Class 11-B' },
          { _id: '12-A', name: 'Class 12-A' },
          { _id: '12-B', name: 'Class 12-B' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      // Fallback classes if API fails
      setClasses([
        { _id: '9-A', name: 'Class 9-A' },
        { _id: '9-B', name: 'Class 9-B' },
        { _id: '10-A', name: 'Class 10-A' },
        { _id: '10-B', name: 'Class 10-B' },
        { _id: '11-A', name: 'Class 11-A' },
        { _id: '11-B', name: 'Class 11-B' },
        { _id: '12-A', name: 'Class 12-A' },
        { _id: '12-B', name: 'Class 12-B' }
      ]);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await api.get('/resources');
      setResources(response.data);
    } catch (error) {
      toast.error('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast.error('Please select a PDF file');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('file', selectedFile);
    data.append('title', formData.title);
    data.append('subject', formData.subject);
    data.append('description', formData.description);
    data.append('type', formData.type);
    data.append('class_id', formData.class_id);

    try {
      await api.post('/resources/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Resource uploaded successfully!');
      setShowUploadModal(false);
      setFormData({ title: '', subject: '', description: '', type: 'curriculum', class_id: '' });
      setSelectedFile(null);
      fetchResources();
    } catch (error) {
      toast.error('Failed to upload resource');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateQuiz = async (resourceId) => {
    setGenerating(resourceId);
    try {
      const response = await api.post(`/resources/${resourceId}/generate-quiz`, {
        numQuestions: 5,
        difficulty: 'medium'
      });
      toast.success('Quiz generated! Students can now take this quiz.');
      console.log('Generated Quiz:', response.data);
    } catch (error) {
      toast.error('Failed to generate quiz');
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateLessonPlan = async (resourceId) => {
    setGenerating(resourceId + '-lesson');
    try {
      const response = await api.post(`/resources/${resourceId}/generate-lesson-plan`, {
        duration: '45 minutes',
        grade_level: '10th'
      });
      toast.success('Lesson plan generated!');
      fetchResources();
      console.log('Generated Lesson Plan:', response.data);
    } catch (error) {
      toast.error('Failed to generate lesson plan');
    } finally {
      setGenerating(null);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      await api.delete(`/resources/${resourceId}`);
      toast.success('Resource deleted');
      fetchResources();
    } catch (error) {
      toast.error('Failed to delete resource');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading resources...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Teaching Resources</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Upload curriculum PDFs to generate quizzes and lesson plans using AI
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
          <FiUpload /> Upload Resource
        </button>
      </div>

      {/* Resources Grid */}
      {resources.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <p className="empty-state-text">No resources uploaded yet</p>
              <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
                <FiUpload /> Upload Your First Resource
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {resources.map((resource) => (
            <div key={resource._id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius)',
                    background: 'rgba(79, 70, 229, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {resource.type === 'curriculum' ? <FiFile size={24} color="var(--primary-color)" /> :
                     resource.type === 'lesson_plan' ? <FiBook size={24} color="var(--secondary-color)" /> :
                     <FiFileText size={24} color="var(--warning-color)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{resource.title}</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-primary">{resource.subject}</span>
                      <span className="badge badge-success">{resource.type}</span>
                      {resource.class_id && <span className="badge badge-warning">{resource.class_id}</span>}
                    </div>
                  </div>
                </div>

                {resource.description && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {resource.description}
                  </p>
                )}

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Uploaded: {new Date(resource.upload_date).toLocaleDateString()}
                </div>

                {resource.type === 'curriculum' && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleGenerateQuiz(resource._id)}
                      disabled={generating === resource._id}
                    >
                      {generating === resource._id ? <FiLoader className="spinning" /> : <FiPlay />}
                      Generate Quiz
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleGenerateLessonPlan(resource._id)}
                      disabled={generating === resource._id + '-lesson'}
                    >
                      {generating === resource._id + '-lesson' ? <FiLoader className="spinning" /> : <FiBook />}
                      Lesson Plan
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)' }}
                      onClick={() => handleDelete(resource._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Resource</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Chapter 5 - Thermodynamics"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Class</label>
                    <select
                      value={formData.class_id}
                      onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    >
                      <option value="">Select Class</option>
                      {classes.map(cls => (
                        <option key={cls._id} value={cls._id}>
                          {cls.name || `Class ${cls._id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description (Optional)</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the content"
                  />
                </div>

                <div className="form-group">
                  <label>PDF File</label>
                  <div 
                    className="file-upload"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".pdf"
                      onChange={handleFileSelect}
                    />
                    <div className="file-upload-icon">📄</div>
                    <p className="file-upload-text">
                      {selectedFile ? selectedFile.name : 'Click to select a PDF file'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherResources;
