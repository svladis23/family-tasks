import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = '/api';

// Work week: Sunday-Thursday (1-5), Weekend: Friday-Saturday (6-7)
const DAYS = [
  { value: 1, label: 'Sun', fullName: 'Sunday' },
  { value: 2, label: 'Mon', fullName: 'Monday' },
  { value: 3, label: 'Tue', fullName: 'Tuesday' },
  { value: 4, label: 'Wed', fullName: 'Wednesday' },
  { value: 5, label: 'Thu', fullName: 'Thursday' }
];

function WeeklyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDays, setFormDays] = useState([]);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/weekly-tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
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
    setEditingTask(null);
    setFormTitle('');
    setFormDays([]);
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDays(task.days_of_week.split(',').map(d => parseInt(d)));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormTitle('');
    setFormDays([]);
  };

  const handleDayToggle = (dayValue) => {
    setFormDays(prev =>
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue].sort((a, b) => a - b)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      setError('Title is required');
      return;
    }

    if (formDays.length === 0) {
      setError('At least one day must be selected');
      return;
    }

    try {
      const url = editingTask
        ? `${API_BASE}/weekly-tasks/${editingTask.id}`
        : `${API_BASE}/weekly-tasks`;

      const response = await fetch(url, {
        method: editingTask ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          days_of_week: formDays.join(',')
        })
      });

      if (!response.ok) throw new Error('Failed to save task');

      closeModal();
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (task) => {
    try {
      const response = await fetch(`${API_BASE}/weekly-tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !task.active })
      });

      if (!response.ok) throw new Error('Failed to update task');

      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`${API_BASE}/weekly-tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete task');

      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const getDayLabels = (daysString) => {
    const days = daysString.split(',').map(d => parseInt(d));
    return days.map(d => DAYS.find(day => day.value === d)?.label).filter(Boolean);
  };

  if (loading) {
    return <div className="loading">Loading weekly tasks...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Weekly Tasks</h1>
            <p className="page-subtitle">Recurring tasks on specific days of the week</p>
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
          <p>No weekly tasks yet. Add your first one!</p>
        </div>
      ) : (
        <div className="card">
          {tasks.map(task => (
            <div key={task.id} className="task-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
              <div className="flex items-center justify-between">
                <span className={`task-title ${!task.active ? 'completed' : ''}`}>
                  {task.title}
                </span>
                <span className={`status-badge ${task.active ? 'active' : 'inactive'}`}>
                  {task.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="days-display">
                  {getDayLabels(task.days_of_week).map(day => (
                    <span key={day} className="day-tag">{day}</span>
                  ))}
                </div>

                <div className="action-buttons">
                  <button
                    className={`btn btn-sm ${task.active ? 'btn-secondary' : 'btn-success'}`}
                    onClick={() => handleToggleActive(task)}
                  >
                    {task.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => openEditModal(task)}
                  >
                    Edit
                  </button>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingTask ? 'Edit Weekly Task' : 'Add Weekly Task'}
              </h2>
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
                  placeholder="e.g., Take out trash"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Days of Week</label>
                <div className="days-grid">
                  {DAYS.map(day => (
                    <label
                      key={day.value}
                      className={`day-checkbox ${formDays.includes(day.value) ? 'selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={formDays.includes(day.value)}
                        onChange={() => handleDayToggle(day.value)}
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeeklyTasksPage;
