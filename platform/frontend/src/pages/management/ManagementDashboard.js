import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiUsers, FiUserCheck, FiBook, FiTrendingUp } from 'react-icons/fi';

const ManagementDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    activeUsers: 0,
    classDistribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/users/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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
          Management Dashboard 📊
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Overview of your educational platform
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
              <FiUserCheck size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.totalTeachers}</div>
          <div className="stat-label">Total Teachers</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon warning">
              <FiBook size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.activeUsers}</div>
          <div className="stat-label">Active Users</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon danger">
              <FiTrendingUp size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.classDistribution?.length || 0}</div>
          <div className="stat-label">Total Classes</div>
        </div>
      </div>

      {/* Class Distribution */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Students by Class</h3>
        </div>
        <div className="card-body">
          {stats.classDistribution?.length === 0 ? (
            <div className="empty-state">
              <p>No class data available</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
              {stats.classDistribution?.map((cls) => (
                <div 
                  key={cls._id || 'unassigned'} 
                  style={{
                    padding: '1.25rem',
                    background: 'var(--background)',
                    borderRadius: 'var(--radius)',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                    {cls.count}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {cls._id || 'Unassigned'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagementDashboard;
