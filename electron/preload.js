const { contextBridge, ipcRenderer } = require('electron');

/**
 * Secure Preload Script
 * 
 * This script exposes a limited API to the renderer process
 * while keeping Node.js and Electron APIs isolated.
 */

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // === TASKS ===
  
  getTasks: () => ipcRenderer.invoke('tasks:getAll'),
  
  getTaskById: (id) => ipcRenderer.invoke('tasks:getById', id),
  
  createTask: (task) => ipcRenderer.invoke('tasks:create', task),
  
  updateTask: (task) => ipcRenderer.invoke('tasks:update', task),
  
  deleteTask: (id) => ipcRenderer.invoke('tasks:delete', id),
  
  setActiveTask: (id) => ipcRenderer.invoke('tasks:setActive', id),
  
  getActiveTask: () => ipcRenderer.invoke('tasks:getActive'),
  
  // === POMODORO ===
  
  startPomodoro: () => ipcRenderer.invoke('pomodoro:start'),
  
  pausePomodoro: () => ipcRenderer.invoke('pomodoro:pause'),
  
  resetPomodoro: () => ipcRenderer.invoke('pomodoro:reset'),
  
  getCurrentSession: () => ipcRenderer.invoke('pomodoro:getCurrent'),
  
  getPomodoroSettings: () => ipcRenderer.invoke('pomodoro:getSettings'),
  
  updatePomodoroSettings: (settings) => ipcRenderer.invoke('pomodoro:updateSettings', settings),
  
  getPomodoroHistory: (options) => ipcRenderer.invoke('pomodoro:getHistory', options),
  
  // === DASHBOARD ===
  
  getDashboardStats: () => ipcRenderer.invoke('dashboard:getStats'),
  
  getTodayStats: () => ipcRenderer.invoke('dashboard:getTodayStats'),
  
  // === SETTINGS ===
  
  getSetting: (key) => ipcRenderer.invoke('settings:get', key),
  
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  
  getAllSettings: () => ipcRenderer.invoke('settings:getAll'),
  
  // === APP ===
  
  minimizeWindow: () => ipcRenderer.invoke('app:minimize'),
  
  maximizeWindow: () => ipcRenderer.invoke('app:maximize'),
  
  closeWindow: () => ipcRenderer.invoke('app:close'),
  
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  
  // === EVENT LISTENERS ===
  
  onSessionStarted: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('pomodoro:sessionStarted', subscription);
    return () => {
      ipcRenderer.removeListener('pomodoro:sessionStarted', subscription);
    };
  },
  
  onSessionComplete: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('pomodoro:sessionComplete', subscription);
    return () => {
      ipcRenderer.removeListener('pomodoro:sessionComplete', subscription);
    };
  },
  
  onPomodoroTick: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('pomodoro:tick', subscription);
    return () => {
      ipcRenderer.removeListener('pomodoro:tick', subscription);
    };
  },
  
  onNotification: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('notification', subscription);
    return () => {
      ipcRenderer.removeListener('notification', subscription);
    };
  },
  
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('pomodoro:sessionStarted');
    ipcRenderer.removeAllListeners('pomodoro:sessionComplete');
    ipcRenderer.removeAllListeners('pomodoro:tick');
    ipcRenderer.removeAllListeners('notification');
  },
});

console.log('[Preload] Electron API exposed to renderer');
