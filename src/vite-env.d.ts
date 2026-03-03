/// <reference types="vite/client" />

interface ElectronAPI {
  // Tasks
  getTasks: () => Promise<Task[]>;
  getTaskById: (id: string) => Promise<Task>;
  createTask: (task: { title: string; description?: string }) => Promise<Task>;
  updateTask: (task: {
    id: string;
    title: string;
    description?: string;
    status?: string;
  }) => Promise<Task>;
  deleteTask: (id: string) => Promise<{ success: boolean }>;
  setActiveTask: (id: string) => Promise<Task>;
  getActiveTask: () => Promise<Task | undefined>;

  // Pomodoro
  startPomodoro: () => Promise<PomodoroSession>;
  pausePomodoro: () => Promise<PomodoroSession>;
  resetPomodoro: () => Promise<{ success: boolean }>;
  getCurrentSession: () => Promise<PomodoroSession | null>;
  getPomodoroSettings: () => Promise<Record<string, string>>;
  updatePomodoroSettings: (settings: Record<string, string>) => Promise<{ success: boolean }>;
  getPomodoroHistory: (options?: { limit?: number; type?: string }) => Promise<PomodoroSession[]>;

  // Dashboard
  getDashboardStats: () => Promise<DashboardStats>;
  getTodayStats: () => Promise<DailyStats>;

  // Settings
  getSetting: (key: string) => Promise<{ value: string } | undefined>;
  setSetting: (key: string, value: string) => Promise<{ success: boolean }>;
  getAllSettings: () => Promise<Record<string, string>>;

  // App
  minimizeWindow: () => Promise<{ success: boolean }>;
  maximizeWindow: () => Promise<{ success: boolean }>;
  closeWindow: () => Promise<{ success: boolean }>;
  getVersion: () => Promise<string>;

  // Event listeners
  onSessionStarted: (callback: (session: PomodoroSession) => void) => () => void;
  onSessionComplete: (callback: (data: { type: string }) => void) => () => void;
  onPomodoroTick: (
    callback: (data: { remaining: number; isRunning: boolean }) => void
  ) => () => void;
  onNotification: (callback: (data: { title: string; body: string }) => void) => () => void;
  removeAllListeners: () => void;
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

interface PomodoroSession {
  id: string;
  taskId: string | null;
  type: 'focus' | 'short_break' | 'long_break';
  duration: number;
  remaining: number;
  isRunning: boolean;
  startTime: number;
}

interface DashboardStats {
  totalFocusSessions: number;
  totalFocusMinutes: number;
  completedTasks: number;
  totalTasks: number;
}

interface DailyStats {
  id: string;
  date: string;
  focusSessions: number;
  totalFocusMinutes: number;
  completedTasks: number;
}

interface Window {
  electronAPI: ElectronAPI;
}
