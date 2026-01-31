import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = '/api';

function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (error) {
    return <div className="card" style={{ color: '#ef4444' }}>Error: {error}</div>;
  }

  const getUserName = (userId) => {
    const user = analytics.users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  const renderStatSection = (title, data, periodLabel) => {
    const vlad = data.stats[1] || { count: 0, percentage: 0 };
    const maayan = data.stats[2] || { count: 0, percentage: 0 };
    const winner = data.winner;
    const total = data.total;

    return (
      <div className="stat-card">
        <div className="stat-title">{title}</div>

        {total === 0 ? (
          <div className="empty-state" style={{ padding: '1rem' }}>
            No tasks completed {periodLabel}
          </div>
        ) : (
          <>
            <div className="stat-row">
              <span className="stat-label vlad">Vlad</span>
              <div className="progress-bar">
                <div
                  className="progress-fill vlad"
                  style={{ width: `${vlad.percentage}%` }}
                />
              </div>
              <span className="stat-value">{vlad.percentage}%</span>
            </div>

            <div className="stat-row">
              <span className="stat-label maayan">Maayan</span>
              <div className="progress-bar">
                <div
                  className="progress-fill maayan"
                  style={{ width: `${maayan.percentage}%` }}
                />
              </div>
              <span className="stat-value">{maayan.percentage}%</span>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray">
                Total: {total} task{total !== 1 ? 's' : ''} completed
              </span>

              {winner ? (
                <div className="winner-badge">
                  Winner: {getUserName(winner)}
                </div>
              ) : total > 0 ? (
                <div className="winner-badge" style={{ backgroundColor: '#e5e7eb', color: '#6b7280' }}>
                  It's a tie!
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Task completion statistics</p>
      </div>

      {renderStatSection('This Week', analytics.this_week, 'this week')}
      {renderStatSection('This Month', analytics.this_month, 'this month')}
      {renderStatSection('All Time', analytics.all_time, 'yet')}

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <span className="card-title">How It Works</span>
        </div>
        <div className="text-sm text-gray">
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>This Week:</strong> Tasks completed in the last 7 days
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>This Month:</strong> Tasks completed in the last 30 days
          </p>
          <p>
            <strong>All Time:</strong> All tasks ever completed
          </p>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
