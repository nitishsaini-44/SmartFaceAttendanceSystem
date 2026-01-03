import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiCalendar, FiTrendingUp, FiAward, FiBookOpen } from 'react-icons/fi';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    attendance: { percentage: 0, present: 0, absent: 0, total: 0 },
    performance: { avgPercentage: 0, totalQuizzes: 0 }
  });
  const [recentPerformance, setRecentPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [attendanceRes, performanceRes, recentRes] = await Promise.all([
        api.get('/attendance/stats'),
        api.get('/performance/stats'),
        api.get('/performance?limit=5')
      ]);

      setStats({
        attendance: attendanceRes.data,
        performance: performanceRes.data.overall || { avgPercentage: 0, totalQuizzes: 0 }
      });
      setRecentPerformance(recentRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
          Welcome back, {user?.name}! 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Class: {user?.class_id || 'Not assigned'} | Here's your overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon primary">
              <FiCalendar size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.attendance.percentage}%</div>
          <div className="stat-label">Attendance Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon success">
              <FiTrendingUp size={24} />
            </div>
          </div>
          <div className="stat-value">{Math.round(stats.performance.avgPercentage || 0)}%</div>
          <div className="stat-label">Average Score</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon warning">
              <FiAward size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.performance.totalQuizzes || 0}</div>
          <div className="stat-label">Quizzes Completed</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon danger">
              <FiBookOpen size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.attendance.present || 0}</div>
          <div className="stat-label">Days Present</div>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Quiz Performance</h3>
        </div>
        <div className="card-body">
          {recentPerformance.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <p className="empty-state-text">No quiz attempts yet</p>
              <p style={{ fontSize: '0.875rem' }}>Complete quizzes to see your performance here</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Topic</th>
                    <th>Score</th>
                    <th>Date</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPerformance.map((perf) => (
                    <tr key={perf._id}>
                      <td>{perf.subject}</td>
                      <td>{perf.quiz_topic || '-'}</td>
                      <td>
                        <span className={`badge ${perf.percentage >= 70 ? 'badge-success' : perf.percentage >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                          {perf.score}/{perf.total_marks} ({perf.percentage}%)
                        </span>
                      </td>
                      <td>{new Date(perf.date).toLocaleDateString()}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {perf.ai_feedback || '-'}
                      </td>
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

export default StudentDashboard;
