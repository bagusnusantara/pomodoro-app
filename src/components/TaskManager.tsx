import { useState, useEffect } from 'react';
import { useTasks } from '@hooks/useTasks';
import './TaskManager.css';

interface TaskFormData {
  title: string;
  description: string;
}

function TaskManager() {
  const { tasks, createTask, updateTask, deleteTask, setActiveTask, refreshTasks } = useTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({ title: '', description: '' });
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    try {
      if (editingTask) {
        await updateTask({
          id: editingTask,
          title: formData.title,
          description: formData.description,
        });
      } else {
        await createTask({
          title: formData.title,
          description: formData.description,
        });
      }
      
      setFormData({ title: '', description: '' });
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleEdit = (task: typeof tasks[0]) => {
    setFormData({
      title: task.title,
      description: task.description || '',
    });
    setEditingTask(task.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await setActiveTask(id);
    } catch (error) {
      console.error('Failed to set active task:', error);
    }
  };

  const handleComplete = async (task: typeof tasks[0]) => {
    try {
      await updateTask({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status === 'completed' ? 'pending' : 'completed',
      });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status !== 'completed';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const pendingTasks = filteredTasks.filter(t => t.status !== 'completed');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  return (
    <div className="task-manager">
      <div className="task-header">
        <h2 className="task-title">Tasks</h2>
        <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
          + Add Task
        </button>
      </div>

      <div className="task-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {isFormOpen && (
        <div className="task-form-overlay">
          <form className="task-form" onSubmit={handleSubmit}>
            <h3>{editingTask ? 'Edit Task' : 'New Task'}</h3>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description (optional)"
                rows={3}
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingTask(null);
                  setFormData({ title: '', description: '' });
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="task-list">
        {pendingTasks.length > 0 && (
          <div className="task-section">
            <h4 className="section-title">Pending</h4>
            {pendingTasks.map(task => (
              <div
                key={task.id}
                className={`task-item ${task.status === 'in_progress' ? 'active' : ''}`}
              >
                <div className="task-content">
                  <h5 className="task-name">{task.title}</h5>
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  <div className="task-meta">
                    <span className="task-pomodoros">🍅 {task.pomodoro_count}</span>
                    <span className="task-date">
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="task-actions">
                  {task.status !== 'completed' && (
                    <>
                      <button
                        className="action-btn"
                        onClick={() => handleSetActive(task.id)}
                        title="Set as active"
                      >
                        {task.status === 'in_progress' ? '🎯' : '○'}
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => handleComplete(task)}
                        title="Mark as complete"
                      >
                        ✓
                      </button>
                    </>
                  )}
                  <button
                    className="action-btn"
                    onClick={() => handleEdit(task)}
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(task.id)}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="task-section">
            <h4 className="section-title">Completed</h4>
            {completedTasks.map(task => (
              <div key={task.id} className="task-item completed">
                <div className="task-content">
                  <h5 className="task-name">{task.title}</h5>
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  <div className="task-meta">
                    <span className="task-pomodoros">🍅 {task.pomodoro_count}</span>
                    <span className="task-date">
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="task-actions">
                  <button
                    className="action-btn"
                    onClick={() => handleComplete(task)}
                    title="Mark as incomplete"
                  >
                    ↩
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => handleEdit(task)}
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(task.id)}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredTasks.length === 0 && (
          <div className="task-empty">
            <p className="text-secondary">No tasks yet. Create your first task to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskManager;
