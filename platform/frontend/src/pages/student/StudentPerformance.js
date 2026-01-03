import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiTrendingUp, FiAward, FiTarget, FiBookOpen } from 'react-icons/fi';

const StudentPerformance = () => {
  const [stats, setStats] = useState({
    overall: { avgPercentage: 0, totalQuizzes: 0 },
    bySubject: [],
    recentTrend: []
  });
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const [statsRes, perfRes] = await Promise.all([
        api.get('/performance/stats'),
        api.get('/performance')
      ]);

      setStats(statsRes.data);
      setPerformance(perfRes.data);
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'badge-success';
    if (percentage >= 60) return 'badge-warning';
    return 'badge-danger';
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading performance...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon primary">
              <FiTrendingUp size={24} />
            </div>
          </div>
          <div className="stat-value">{Math.round(stats.overall?.avgPercentage || 0)}%</div>
          <div className="stat-label">Average Score</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon success">
              <FiAward size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.overall?.totalQuizzes || 0}</div>
          <div className="stat-label">Total Quizzes</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon warning">
              <FiTarget size={24} />
            </div>
          </div>
          <div className="stat-value">
            {stats.bySubject?.[0]?._id || '-'}
          </div>
          <div className="stat-label">Best Subject</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon danger">
              <FiBookOpen size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.bySubject?.length || 0}</div>
          <div className="stat-label">Subjects Covered</div>
        </div>
      </div>

      {/* Subject-wise Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Subject-wise Performance</h3>
          </div>
          <div className="card-body">
            {stats.bySubject?.length === 0 ? (
              <div className="empty-state">
                <p>No subject data available</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {stats.bySubject?.map((subject) => (
                  <div key={subject._id} style={{ 
                    padding: '1rem', 
                    background: 'var(--background)', 
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{subject._id || 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {subject.quizCount} quizzes
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${getScoreColor(subject.avgPercentage)}`}>
                        {Math.round(subject.avgPercentage)}% avg
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Best: {Math.round(subject.highestScore)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Trend */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Trend</h3>
          </div>
          <div className="card-body">
            {stats.recentTrend?.length === 0 ? (
              <div className="empty-state">
                <p>No recent quizzes</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.recentTrend?.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'var(--background)',
                    borderRadius: 'var(--radius)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                        {item.quiz_topic || item.subject}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`badge ${getScoreColor(item.percentage)}`}>
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Performance Records */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Quiz Records</h3>
        </div>
        <div className="card-body">
          {performance.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p className="empty-state-text">No performance records yet</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Topic</th>
                    <th>Score</th>
                    <th>AI Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.map((record) => (
                    <tr key={record._id}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.subject}</td>
                      <td>{record.quiz_topic || '-'}</td>
                      <td>
                        <span className={`badge ${getScoreColor(record.percentage)}`}>
                          {record.score}/{record.total_marks} ({record.percentage}%)
                        </span>
                      </td>
                      <td style={{ maxWidth: '250px' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {record.ai_feedback || 'No feedback'}
                        </p>
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

export default StudentPerformance;
