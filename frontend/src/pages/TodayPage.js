import React, { useState, useEffect, useCallback } from 'react';
import { getTodayData, toggleCompletion, completeExtraTask, USERS } from '../services/dataService';

function TodayPage() {
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTodayData = useCallback(async () => {
    try {
      const data = await getTodayData();
      setTodayData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayData();
  }, [fetchTodayData]);

  const handleToggleCompletion = async (taskType, taskId, userId) => {
    try {
      await toggleCompletion(taskType, taskId, userId);
      fetchTodayData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCompleteExtraTask = async (taskId, userId) => {
    try {
      await completeExtraTask(taskId, userId);
      fetchTodayData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading today's tasks...</div>;
  }

  if (error) {
    return <div className="card" style={{ color: '#ef4444' }}>Error: {error}</div>;
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderTaskSection = (title, tasks, taskType, badgeClass) => {
    if (tasks.length === 0) return null;

    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="section-header">
          <span className="section-title">{title}</span>
          <span className={`section-badge ${badgeClass}`}>{tasks.length}</span>
        </div>

        {tasks.map(task => (
          <div key={task.id} className="task-item">
            <div style={{ flex: 1 }}>
              <span className="task-title">{task.title}</span>
              {taskType === 'weekly' && task.days_of_week && (
                <div className="days-display">
                  {task.days_of_week.split(',').map(day => (
                    <span key={day} className="day-tag">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(day) - 1]}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {taskType === 'extra' ? (
              <div className="checkbox-group">
                {USERS.map(user => (
                  <button
                    key={user.id}
                    className={`btn btn-sm ${user.id === 1 ? 'btn-primary' : ''}`}
                    style={user.id === 2 ? { backgroundColor: '#ec4899', color: 'white' } : {}}
                    onClick={() => handleCompleteExtraTask(task.id, user.id)}
                  >
                    {user.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="checkbox-group">
                {USERS.map(user => {
                  const isCompleted = task.completed_by_users?.includes(user.id);
                  return (
                    <label key={user.id} className={`user-checkbox ${user.id === 1 ? 'vlad' : 'maayan'}`}>
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => handleToggleCompletion(taskType, task.id, user.id)}
                      />
                      <span className="user-label">{user.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const hasTasks = todayData.daily_tasks.length > 0 ||
                   todayData.weekly_tasks.length > 0 ||
                   todayData.extra_tasks.length > 0;

  return (
    <div>
      {/* Today's date header */}
      <div className="today-header">
        <div className="today-date">{formatDate(todayData.date)}</div>
        <div className="today-day">{todayData.day_name}</div>
      </div>

      {!hasTasks ? (
        <div className="card empty-state">
          <p>No tasks for today! Enjoy your free time.</p>
        </div>
      ) : (
        <>
          {renderTaskSection('Daily Tasks', todayData.daily_tasks, 'daily', 'daily')}
          {renderTaskSection('Weekly Tasks', todayData.weekly_tasks, 'weekly', 'weekly')}
          {renderTaskSection('Extra Tasks', todayData.extra_tasks, 'extra', 'extra')}
        </>
      )}
    </div>
  );
}

export default TodayPage;
