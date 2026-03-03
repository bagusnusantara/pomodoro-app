import { useState, useEffect, useCallback } from 'react';
import { usePomodoro } from '@hooks/usePomodoro';
import './Timer.css';

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function Timer() {
  const {
    session,
    isRunning,
    timeRemaining,
    activeTask,
    startSession,
    pauseSession,
    resetSession,
    skipSession,
  } = usePomodoro();

  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (session && session.duration > 0) {
      const newProgress = (timeRemaining / session.duration) * 100;
      setProgress(newProgress);
    } else {
      setProgress(100);
    }
  }, [timeRemaining, session]);

  const handleStartPause = useCallback(() => {
    if (isRunning) {
      pauseSession();
    } else {
      startSession();
    }
  }, [isRunning, startSession, pauseSession]);

  const handleReset = useCallback(() => {
    resetSession();
  }, [resetSession]);

  const handleSkip = useCallback(() => {
    skipSession();
  }, [skipSession]);

  const getSessionTypeColor = () => {
    if (!session) return 'var(--color-focus)';
    switch (session.type) {
      case 'focus':
        return 'var(--color-focus)';
      case 'short_break':
        return 'var(--color-short-break)';
      case 'long_break':
        return 'var(--color-long-break)';
      default:
        return 'var(--color-focus)';
    }
  };

  const getSessionTypeLabel = () => {
    if (!session) return 'Ready to Focus';
    switch (session.type) {
      case 'focus':
        return 'Focus Time';
      case 'short_break':
        return 'Short Break';
      case 'long_break':
        return 'Long Break';
      default:
        return 'Focus Time';
    }
  };

  const primaryColor = getSessionTypeColor();

  return (
    <div className="timer-container">
      <div className="timer-card">
        <div className="session-info">
          <span className="session-type" style={{ color: primaryColor }}>
            {getSessionTypeLabel()}
          </span>
          {activeTask && (
            <span className="active-task">
              📌 {activeTask.title}
            </span>
          )}
        </div>

        <div className="timer-display">
          <svg className="timer-ring" viewBox="0 0 300 300">
            <circle
              className="timer-ring-bg"
              cx="150"
              cy="150"
              r="130"
              fill="none"
              stroke="var(--bg-tertiary)"
              strokeWidth="12"
            />
            <circle
              className="timer-ring-progress"
              cx="150"
              cy="150"
              r="130"
              fill="none"
              stroke={primaryColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 130}
              strokeDashoffset={2 * Math.PI * 130 * (1 - progress / 100)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
              transform="rotate(-90 150 150)"
            />
          </svg>
          <div className="timer-time">{formatTime(timeRemaining)}</div>
        </div>

        <div className="timer-controls">
          <button
            className="control-btn control-btn-secondary"
            onClick={handleReset}
            title="Reset"
          >
            ↺
          </button>
          <button
            className="control-btn control-btn-primary"
            onClick={handleStartPause}
            style={{ backgroundColor: primaryColor }}
          >
            {isRunning ? '⏸ Pause' : '▶ Start'}
          </button>
          {session && (
            <button
              className="control-btn control-btn-secondary"
              onClick={handleSkip}
              title="Skip"
            >
              ⏭
            </button>
          )}
        </div>

        {!session && (
          <div className="timer-hint">
            <p className="text-secondary">Select a task to start focusing, or start without a task</p>
          </div>
        )}
      </div>

      <div className="session-stats">
        <div className="stat-item">
          <span className="stat-value">{activeTask?.pomodoro_count || 0}</span>
          <span className="stat-label">Pomodoros</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">{activeTask ? 'In Progress' : 'No Task'}</span>
          <span className="stat-label">Status</span>
        </div>
      </div>
    </div>
  );
}

export default Timer;
