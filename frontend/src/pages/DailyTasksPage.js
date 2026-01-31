import React, { useState, useEffect, useCallback } from 'react';
import { getDailyTasks, createDailyTask, updateDailyTask, deleteDailyTask } from '../services/dataService';

function DailyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formTitle, setFormTitle] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const data = await getDailyTasks();
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
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormTitle('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      setError('Title is required');
      return;
    }

    try {
      if (editingTask) {
        await updateDailyTask(editingTask.id, { title: formTitle.trim() });
      } else {
        await createDailyTask(formTitle.trim());
      }

      closeModal();
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (task) => {
    try {
      await updateDailyTask(task.id, { active: !task.active });
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteDailyTask(taskId);
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading daily tasks...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Daily Tasks</h1>
            <p className="page-subtitle">Recurring tasks that appear every day</p>
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
          <p>No daily tasks yet. Add your first one!</p>
        </div>
      ) : (
        <div className="card">
          {tasks.map(task => (
            <div key={task.id} className="task-item">
              <div style={{ flex: 1 }}>
                <span className={`task-title ${!task.active ? 'completed' : ''}`}>
                  {task.title}
                </span>
                <span className={`status-badge ${task.active ? 'active' : 'inactive'}`} style={{ marginLeft: '0.5rem' }}>
                  {task.active ? 'Active' : 'Inactive'}
                </span>
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
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingTask ? 'Edit Daily Task' : 'Add Daily Task'}
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
                  placeholder="e.g., Wash dishes"
                  autoFocus
                />
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

export default DailyTasksPage;
