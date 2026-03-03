import TaskManager from '@components/TaskManager';
import './TasksPage.css';

function TasksPage() {
  return (
    <div className="tasks-page">
      <div className="tasks-page-header">
        <h1 className="page-title">Task Manager</h1>
        <p className="page-subtitle">Organize and track your tasks</p>
      </div>
      
      <div className="tasks-page-content">
        <TaskManager />
      </div>
    </div>
  );
}

export default TasksPage;
