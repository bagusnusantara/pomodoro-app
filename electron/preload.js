const { contextBridge, ipcRenderer } = require('electron');

/**
 * Secure Preload Script
 * 
 * This script exposes a limited API to the renderer process
 * while keeping Node.js and Electron APIs isolated.
 */

// Valid channels for invoke (request-response)
const INVOKE_CHANNELS = new Set([
  'tasks:getAll',
  'tasks:getById',
  'tasks:create',
  'tasks:update',
  'tasks:delete',
  'tasks:setActive',
  'tasks:getActive',
  'pomodoro:start',
  'pomodoro:pause',
  'pomodoro:reset',
  'pomodoro:getCurrent',
  'pomodoro:getSettings',
  'pomodoro:updateSettings',
  'pomodoro:getHistory',
  'dashboard:getStats',
  'dashboard:getTodayStats',
  'settings:get',
  'settings:set',
  'settings:getAll',
  'app:minimize',
  'app:maximize',
  'app:close',
  'app:getVersion',
]);

// Valid channels for send (one-way)
const SEND_CHANNELS = new Set([
  'subscribe',
]);

// Valid channels for on (listening)
const ON_CHANNELS = new Set([
  'pomodoro:sessionStarted',
  'pomodoro:sessionComplete',
  'pomodoro:tick',
  'notification',
]);

/**
 * Validate channel for invoke operations
 */
function validateInvokeChannel(channel) {
  if (!INVOKE_CHANNELS.has(channel)) {
    throw new Error(`Invalid invoke channel: ${channel}`);
  }
}

/**
 * Validate channel for send operations
 */
function validateSendChannel(channel) {
  if (!SEND_CHANNELS.has(channel)) {
    throw new Error(`Invalid send channel: ${channel}`);
  }
}

/**
 * Validate channel for on operations
 */
function validateOnChannel(channel) {
  if (!ON_CHANNELS.has(channel)) {
    throw new Error(`Invalid on channel: ${channel}`);
  }
}

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // === TASKS ===
  
  /**
   * Get all tasks
   */
  getTasks: () => ipcRenderer.invoke('tasks:getAll'),
  
  /**
   * Get a task by ID
   */
  getTaskById: (id) => {
    validateInvokeChannel('tasks:getById');
    return ipcRenderer.invoke('tasks:getById', id);
  },
  
  /**
   * Create a new task
   */
  createTask: (task) => {
    validateInvokeChannel('tasks:create');
    return ipcRenderer.invoke('tasks:create', task);
  },
  
  /**
   * Update an existing task
   */
  updateTask: (task) => {
    validateInvokeChannel('tasks:update');
    return ipcRenderer.invoke('tasks:update', task);
  },
  
  /**
   * Delete a task
   */
  deleteTask: (id) => {
    validateInvokeChannel('tasks:delete');
    return ipcRenderer.invoke('tasks:delete', id);
  },
  
  /**
   * Set a task as active
   */
  setActiveTask: (id) => {
    validateInvokeChannel('tasks:setActive');
    return ipcRenderer.invoke('tasks:setActive', id);
  },
  
  /**
   * Get the active task
   */
  getActiveTask: () => {
    validateInvokeChannel('tasks:getActive');
    return ipcRenderer.invoke('tasks:getActive');
  },
  
  // === POMODORO ===
  
  /**
   * Start a pomodoro session
   */
  startPomodoro: () => {
    validateInvokeChannel('pomodoro:start');
    return ipcRenderer.invoke('pomodoro:start');
  },
  
  /**
   * Pause the current session
   */
  pausePomodoro: () => {
    validateInvokeChannel('pomodoro:pause');
    return ipcRenderer.invoke('pomodoro:pause');
  },
  
  /**
   * Reset the current session
   */
  resetPomodoro: () => {
    validateInvokeChannel('pomodoro:reset');
    return ipcRenderer.invoke('pomodoro:reset');
  },
  
  /**
   * Get the current session
   */
  getCurrentSession: () => {
    validateInvokeChannel('pomodoro:getCurrent');
    return ipcRenderer.invoke('pomodoro:getCurrent');
  },
  
  /**
   * Get pomodoro settings
   */
  getPomodoroSettings: () => {
    validateInvokeChannel('pomodoro:getSettings');
    return ipcRenderer.invoke('pomodoro:getSettings');
  },
  
  /**
   * Update pomodoro settings
   */
  updatePomodoroSettings: (settings) => {
    validateInvokeChannel('pomodoro:updateSettings');
    return ipcRenderer.invoke('pomodoro:updateSettings', settings);
  },
  
  /**
   * Get pomodoro history
   */
  getPomodoroHistory: (options) => {
    validateInvokeChannel('pomodoro:getHistory');
    return ipcRenderer.invoke('pomodoro:getHistory', options);
  },
  
  // === DASHBOARD ===
  
  /**
   * Get overall stats
   */
  getDashboardStats: () => {
    validateInvokeChannel('dashboard:getStats');
    return ipcRenderer.invoke('dashboard:getStats');
  },
  
  /**
   * Get today's stats
   */
  getTodayStats: () => {
    validateInvokeChannel('dashboard:getTodayStats');
    return ipcRenderer.invoke('dashboard:getTodayStats');
  },
  
  // === SETTINGS ===
  
  /**
   * Get a setting by key
   */
  getSetting: (key) => {
    validateInvokeChannel('settings:get');
    return ipcRenderer.invoke('settings:get', key);
  },
  
  /**
   * Set a setting
   */
  setSetting: (key, value) => {
    validateInvokeChannel('settings:set');
    return ipcRenderer.invoke('settings:set', key, value);
  },
  
  /**
   * Get all settings
   */
  getAllSettings: () => {
    validateInvokeChannel('settings:getAll');
    return ipcRenderer.invoke('settings:getAll');
  },
  
  // === APP ===
  
  /**
   * Minimize the window
   */
  minimizeWindow: () => {
    validateInvokeChannel('app:minimize');
    return ipcRenderer.invoke('app:minimize');
  },
  
  /**
   * Maximize/unmaximize the window
   */
  maximizeWindow: () => {
    validateInvokeChannel('app:maximize');
    return ipcRenderer.invoke('app:maximize');
  },
  
  /**
   * Close the window
   */
  closeWindow: () => {
    validateInvokeChannel('app:close');
    return ipcRenderer.invoke('app:close');
  },
  
  /**
   * Get app version
   */
  getVersion: () => {
    validateInvokeChannel('app:getVersion');
    return ipcRenderer.invoke('app:getVersion');
  },
  
  // === EVENT LISTENERS ===
  
  /**
   * Listen for pomodoro session started event
   */
  onSessionStarted: (callback) => {
    validateOnChannel('pomodoro:sessionStarted');
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('pomodoro:sessionStarted', subscription);
    return () => {
      ipcRenderer.removeListener('pomodoro:sessionStarted', subscription);
    };
  },
  
  /**
   * Listen for pomodoro session complete event
   */
  onSessionComplete: (callback) => {
    validateOnChannel('pomodoro:sessionComplete');
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('pomodoro:sessionComplete', subscription);
    return () => {
      ipcRenderer.removeListener('pomodoro:sessionComplete', subscription);
    };
  },
  
  /**
   * Listen for pomodoro tick event
   */
  onPomodoroTick: (callback) => {
    validateOnChannel('pomodoro:tick');
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('pomodoro:tick', subscription);
    return () => {
      ipcRenderer.removeListener('pomodoro:tick', subscription);
    };
  },
  
  /**
   * Listen for notification event
   */
  onNotification: (callback) => {
    validateOnChannel('notification');
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('notification', subscription);
    return () => {
      ipcRenderer.removeListener('notification', subscription);
    };
  },
  
  /**
   * Remove all listeners (cleanup)
   */
  removeAllListeners: () => {
    ON_CHANNELS.forEach(channel => {
      ipcRenderer.removeAllListeners(channel);
    });
  },
});

// Log for debugging (remove in production)
console.log('[Preload] Electron API exposed to renderer');
