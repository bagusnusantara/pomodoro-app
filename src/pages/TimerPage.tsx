import Timer from '@components/Timer';
import TaskManager from '@components/TaskManager';
import './TimerPage.css';

function TimerPage() {
  return (
    <div className="timer-page">
      <div className="timer-page-header">
        <h1 className="page-title">Pomodoro Timer</h1>
        <p className="page-subtitle">Stay focused and productive</p>
      </div>

      <div className="timer-page-content">
        <div className="timer-section">
          <Timer />
        </div>

        <div className="tasks-section">
          <TaskManager />
        </div>
      </div>
    </div>
  );
}

export default TimerPage;
