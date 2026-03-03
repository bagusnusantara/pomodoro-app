import '@testing-library/jest-dom';

// Mock Electron API for tests
global.window = Object.create(window);
global.window.electronAPI = {
  getTasks: vi.fn(() => Promise.resolve([])),
  getTaskById: vi.fn(() => Promise.resolve(null)),
  createTask: vi.fn(() => Promise.resolve({})),
  updateTask: vi.fn(() => Promise.resolve({})),
  deleteTask: vi.fn(() => Promise.resolve({ success: true })),
  setActiveTask: vi.fn(() => Promise.resolve({})),
  getActiveTask: vi.fn(() => Promise.resolve(null)),
  startPomodoro: vi.fn(() => Promise.resolve({})),
  pausePomodoro: vi.fn(() => Promise.resolve({})),
  resetPomodoro: vi.fn(() => Promise.resolve({ success: true })),
  getCurrentSession: vi.fn(() => Promise.resolve(null)),
  getPomodoroSettings: vi.fn(() => Promise.resolve({})),
  updatePomodoroSettings: vi.fn(() => Promise.resolve({ success: true })),
  getPomodoroHistory: vi.fn(() => Promise.resolve([])),
  getDashboardStats: vi.fn(() => Promise.resolve({})),
  getTodayStats: vi.fn(() => Promise.resolve({})),
  getSetting: vi.fn(() => Promise.resolve(null)),
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
