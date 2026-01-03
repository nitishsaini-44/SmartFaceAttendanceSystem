import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiCalendar, FiCheck, FiX, FiClock } from 'react-icons/fi';

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchAttendance();
  }, [filter]);

  const fetchAttendance = async () => {
    try {
      const startDate = `${filter.year}-${String(filter.month).padStart(2, '0')}-01`;
      const endDate = `${filter.year}-${String(filter.month).padStart(2, '0')}-31`;

      const [attendanceRes, statsRes] = await Promise.all([
        api.get(`/attendance?startDate=${startDate}&endDate=${endDate}`),
        api.get(`/attendance/stats?month=${filter.month}&year=${filter.year}`)
      ]);

      setAttendance(attendanceRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present':
        return <FiCheck color="#059669" />;
      case 'Absent':
        return <FiX color="#DC2626" />;
      case 'Late':
        return <FiClock color="#D97706" />;
      default:
        return null;
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading attendance...</p>
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
              <FiCalendar size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.percentage}%</div>
          <div className="stat-label">Attendance Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon success">
              <FiCheck size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.present}</div>
          <div className="stat-label">Days Present</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon danger">
              <FiX size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.absent}</div>
          <div className="stat-label">Days Absent</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon warning">
              <FiClock size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.late}</div>
          <div className="stat-label">Days Late</div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Attendance Records</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              value={filter.month}
              onChange={(e) => setFilter({ ...filter, month: parseInt(e.target.value) })}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
            <select
              value={filter.year}
              onChange={(e) => setFilter({ ...filter, year: parseInt(e.target.value) })}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}
            >
              {[2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="card-body">
          {attendance.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <p className="empty-state-text">No attendance records for this period</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => {
                    const date = new Date(record.date);
                    return (
                      <tr key={record._id}>
                        <td>{record.date}</td>
                        <td>{date.toLocaleDateString('en-US', { weekday: 'long' })}</td>
                        <td>
                          <span className={`badge ${
                            record.status === 'Present' ? 'badge-success' :
                            record.status === 'Late' ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {getStatusIcon(record.status)}
                            <span style={{ marginLeft: '0.25rem' }}>{record.status}</span>
                          </span>
                        </td>
                        <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
