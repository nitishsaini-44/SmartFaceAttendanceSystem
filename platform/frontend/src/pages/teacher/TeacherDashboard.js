import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiUsers, FiCalendar, FiBook, FiTrendingUp } from 'react-icons/fi';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalResources: 0,
    todayAttendance: 0,
    avgPerformance: 0
  });
  const [recentResources, setRecentResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, resourcesRes] = await Promise.all([
        api.get('/users?role=student'),
        api.get('/resources')
      ]);

      setStats({
        totalStudents: usersRes.data.length,
        totalResources: resourcesRes.data.length,
        todayAttendance: 0,
        avgPerformance: 75
      });
      setRecentResources(resourcesRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Welcome, {user?.name}! 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Subject: {user?.subject || 'Not assigned'} | Here's your class overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon primary">
              <FiUsers size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon success">
              <FiBook size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.totalResources}</div>
          <div className="stat-label">Resources Uploaded</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon warning">
              <FiCalendar size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.todayAttendance}%</div>
          <div className="stat-label">Today's Attendance</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon danger">
              <FiTrendingUp size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.avgPerformance}%</div>
          <div className="stat-label">Avg. Class Performance</div>
        </div>
      </div>

      {/* Recent Resources */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Resources</h3>
        </div>
        <div className="card-body">
          {recentResources.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <p className="empty-state-text">No resources uploaded yet</p>
              <p style={{ fontSize: '0.875rem' }}>Upload curriculum PDFs to create quizzes and lesson plans</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>Class</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentResources.map((resource) => (
                    <tr key={resource._id}>
                      <td>{resource.title}</td>
                      <td>{resource.subject}</td>
                      <td>
                        <span className="badge badge-primary">{resource.type}</span>
                      </td>
                      <td>{resource.class_id || '-'}</td>
                      <td>{new Date(resource.upload_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
