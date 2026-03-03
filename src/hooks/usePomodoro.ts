import { useState, useEffect, useCallback, useRef } from 'react';

interface PomodoroSession {
  id: string;
  taskId: string | null;
  type: 'focus' | 'short_break' | 'long_break';
  duration: number;
  remaining: number;
  isRunning: boolean;
  startTime: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  pomodoro_count: number;
  created_at: string;
  updated_at: string;
}

export function usePomodoro() {
  const [session, setSession] = useState<PomodoroSession | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60 * 1000);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Load settings and active task on mount
  useEffect(() => {
    const init = async () => {
      try {
        const [loadedSettings, loadedTask] = await Promise.all([
          window.electronAPI.getPomodoroSettings(),
          window.electronAPI.getActiveTask(),
        ]);
        setSettings(loadedSettings);
        setActiveTask(loadedTask || null);

        // Set initial time based on settings
        const focusDuration = parseInt(loadedSettings.focus_duration || '25') * 60 * 1000;
        setTimeRemaining(focusDuration);
      } catch (error) {
        console.error('Failed to initialize pomodoro:', error);
      }
    };

    init();
  }, []);

  // Subscribe to pomodoro tick events
  useEffect(() => {
    if (window.electronAPI) {
      unsubscribeRef.current = window.electronAPI.onPomodoroTick((data) => {
        setTimeRemaining(data.remaining);
        setIsRunning(data.isRunning);
      });

      const unsubscribeSessionStarted = window.electronAPI.onSessionStarted((newSession) => {
        setSession(newSession);
        setTimeRemaining(newSession.remaining);
        setIsRunning(newSession.isRunning);
      });

      const unsubscribeSessionComplete = window.electronAPI.onSessionComplete((data) => {
        // Session completed, refresh active task
        refreshActiveTask();
        
        // Reset session state
        setSession(null);
        setIsRunning(false);
        
        // Reload settings for next session
        window.electronAPI.getPomodoroSettings().then(setSettings);
      });

      return () => {
        unsubscribeRef.current?.();
        unsubscribeSessionStarted();
        unsubscribeSessionComplete();
      };
    }
  }, []);

  const refreshActiveTask = useCallback(async () => {
    try {
      const task = await window.electronAPI.getActiveTask();
      setActiveTask(task || null);
    } catch (error) {
      console.error('Failed to refresh active task:', error);
    }
  }, []);

  const startSession = useCallback(async () => {
    try {
      if (session) {
        // Resume existing session
        await window.electronAPI.startPomodoro();
      } else {
        // Start new session
        const newSession = await window.electronAPI.startPomodoro();
        setSession(newSession);
        setTimeRemaining(newSession.remaining);
        setIsRunning(true);
        await refreshActiveTask();
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  }, [session, refreshActiveTask]);

  const pauseSession = useCallback(async () => {
    try {
      await window.electronAPI.pausePomodoro();
      setIsRunning(false);
    } catch (error) {
      console.error('Failed to pause session:', error);
    }
  }, []);

  const resetSession = useCallback(async () => {
    try {
      await window.electronAPI.resetPomodoro();
      setSession(null);
      setIsRunning(false);
      
      // Reset time based on settings
      const focusDuration = parseInt(settings.focus_duration || '25') * 60 * 1000;
      setTimeRemaining(focusDuration);
    } catch (error) {
      console.error('Failed to reset session:', error);
    }
  }, [settings]);

  const skipSession = useCallback(async () => {
    try {
      await window.electronAPI.resetPomodoro();
      setSession(null);
      setIsRunning(false);
      
      // If we were in a focus session, start a break
      // This is handled by the main process when session completes
      const focusDuration = parseInt(settings.focus_duration || '25') * 60 * 1000;
      setTimeRemaining(focusDuration);
    } catch (error) {
      console.error('Failed to skip session:', error);
    }
  }, [settings]);

  const updateSettings = useCallback(async (newSettings: Record<string, string>) => {
    try {
      await window.electronAPI.updatePomodoroSettings(newSettings);
      setSettings(newSettings);
      
      // Update time remaining if no session is active
      if (!session) {
        const focusDuration = parseInt(newSettings.focus_duration || '25') * 60 * 1000;
        setTimeRemaining(focusDuration);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  }, [session]);

  return {
    session,
    isRunning,
    timeRemaining,
    activeTask,
    settings,
    startSession,
    pauseSession,
    resetSession,
    skipSession,
    updateSettings,
    refreshActiveTask,
  };
}
