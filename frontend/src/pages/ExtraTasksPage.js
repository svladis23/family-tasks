import React, { useState, useEffect, useCallback } from 'react';
import { getExtraTasks, createExtraTask, completeExtraTask, deleteExtraTask, USERS } from '../services/dataService';

function ExtraTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDueDate, setFormDueDate] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const data = await getExtraTasks(true);
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const openAddModal = () => {
    setFormTitle('');
    // Default to today's date
    const today = new Date().toISOString().split('T')[0];
    setFormDueDate(today);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormTitle('');
    setFormDueDate('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      setError('Title is required');
      return;
    }

    if (!formDueDate) {
      setError('Due date is required');
      return;
    }

    try {
      await createExtraTask(formTitle.trim(), formDueDate);
      closeModal();
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleComplete = async (taskId, userId) => {
    try {
      await completeExtraTask(taskId, userId);
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteExtraTask(taskId);
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr + 'T00:00:00');
    return dueDate < today;
  };

  const isToday = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  if (loading) {
    return <div className="loading">Loading extra tasks...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Extra Tasks</h1>
            <p className="page-subtitle">One-time tasks with due dates</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add Task
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ color: '#ef4444', marginBottom: '1rem' }}>
          Error: {error}
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="card empty-state">
          <p>No pending extra tasks. Add one for special to-dos!</p>
        </div>
      ) : (
        <div className="card">
          {tasks.map(task => (
            <div key={task.id} className="task-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
              <div className="flex items-center justify-between">
                <span className="task-title">{task.title}</span>
                <span
                  className="type-badge"
                  style={{
                    backgroundColor: isOverdue(task.dueDate) ? '#fee2e2' : isToday(task.dueDate) ? '#dcfce7' : '#f3f4f6',
                    color: isOverdue(task.dueDate) ? '#991b1b' : isToday(task.dueDate) ? '#166534' : '#374151'
                  }}
                >
                  {isOverdue(task.dueDate) ? 'Overdue' : isToday(task.dueDate) ? 'Today' : formatDate(task.dueDate)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray">
                  Due: {formatDate(task.dueDate)}
                </span>

                <div className="action-buttons">
                  {USERS.map(user => (
                    <button
                      key={user.id}
                      className={`btn btn-sm ${user.id === 1 ? 'btn-primary' : ''}`}
                      style={user.id === 2 ? { backgroundColor: '#ec4899', color: 'white' } : {}}
                      onClick={() => handleComplete(task.id, user.id)}
                      title={`Mark as done by ${user.name}`}
                    >
                      {user.name}
                    </button>
                  ))}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Extra Task</h2>
              <button className="btn-icon" onClick={closeModal}>X</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g., Fix bathroom sink"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formDueDate}
                  onChange={e => setFormDueDate(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExtraTasksPage;
