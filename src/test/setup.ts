import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Electron API for tests
const mockTask = {
  id: 'test-id',
  title: 'Test Task',
  description: 'Test Description',
  status: 'pending' as const,
  pomodoro_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockSession = {
  id: 'session-id',
  taskId: null,
  type: 'focus' as const,
  duration: 25 * 60 * 1000,
  remaining: 25 * 60 * 1000,
  isRunning: false,
  startTime: Date.now(),
};

const mockStats = {
  totalFocusSessions: 0,
  totalFocusMinutes: 0,
  completedTasks: 0,
  totalTasks: 0,
};

const mockDailyStats = {
  id: 'stats-id',
  date: new Date().toISOString().split('T')[0],
  focusSessions: 0,
  totalFocusMinutes: 0,
  completedTasks: 0,
};

global.window = Object.create(window);
global.window.electronAPI = {
  getTasks: vi.fn(() => Promise.resolve([])),
  getTaskById: vi.fn(() => Promise.resolve(mockTask)),
  createTask: vi.fn(() => Promise.resolve(mockTask)),
  updateTask: vi.fn(() => Promise.resolve(mockTask)),
  deleteTask: vi.fn(() => Promise.resolve({ success: true })),
  setActiveTask: vi.fn(() => Promise.resolve(mockTask)),
  getActiveTask: vi.fn(() => Promise.resolve(mockTask)),
  startPomodoro: vi.fn(() => Promise.resolve(mockSession)),
  pausePomodoro: vi.fn(() => Promise.resolve(mockSession)),
  resetPomodoro: vi.fn(() => Promise.resolve({ success: true })),
  getCurrentSession: vi.fn(() => Promise.resolve(mockSession)),
  getPomodoroSettings: vi.fn(() => Promise.resolve({})),
  updatePomodoroSettings: vi.fn(() => Promise.resolve({ success: true })),
  getPomodoroHistory: vi.fn(() => Promise.resolve([])),
  getDashboardStats: vi.fn(() => Promise.resolve(mockStats)),
  getTodayStats: vi.fn(() => Promise.resolve(mockDailyStats)),
  getSetting: vi.fn(() => Promise.resolve({ value: '' })),
  setSetting: vi.fn(() => Promise.resolve({ success: true })),
  getAllSettings: vi.fn(() => Promise.resolve({})),
  minimizeWindow: vi.fn(() => Promise.resolve({ success: true })),
  maximizeWindow: vi.fn(() => Promise.resolve({ success: true })),
  closeWindow: vi.fn(() => Promise.resolve({ success: true })),
  getVersion: vi.fn(() => Promise.resolve('1.0.0')),
  onSessionStarted: vi.fn(() => () => {}),
  onSessionComplete: vi.fn(() => () => {}),
  onPomodoroTick: vi.fn(() => () => {}),
  onNotification: vi.fn(() => () => {}),
  removeAllListeners: vi.fn(),
};
