const { app, BrowserWindow, ipcMain, Notification, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { initDatabase, getDatabase, closeDatabase } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// Keep a global reference of the window object
let mainWindow = null;
let tray = null;
let currentSession = null;
let sessionTimer = null;

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
    },
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  // Load the app
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create system tray
  createTray();
}

/**
 * Create system tray icon
 */
function createTray() {
  const iconPath = path.join(__dirname, '..', 'build', 'icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  const trayIcon = icon.resize({ width: 16, height: 16 });

  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show PomoTask',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: 'Start Focus Session',
      click: () => {
        handleStartPomodoro();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('PomoTask - Pomodoro Timer');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
      }
    }
  });
}

/**
 * Send notification
 */
function sendNotification(title, body) {
  if (Notification.isSupported()) {
    new Notification({ title, body, icon: path.join(__dirname, '..', 'build', 'icon.png') }).show();
  }
  
  // Also send to renderer
  if (mainWindow) {
    mainWindow.webContents.send('notification', { title, body });
  }
}

/**
 * Handle starting a pomodoro session
 */
function handleStartPomodoro() {
  const db = getDatabase();
  
  // Get settings
  const settings = db.prepare('SELECT key, value FROM settings').all();
  const settingsMap = {};
  settings.forEach(s => { settingsMap[s.key] = s.value; });
  
  const focusDuration = parseInt(settingsMap.focus_duration || '25') * 60 * 1000;
  
  // Get active task
  const activeTask = db.prepare('SELECT * FROM tasks WHERE status = ?').get('in_progress');
  
  // Create session
  const sessionId = uuidv4();
  currentSession = {
    id: sessionId,
    taskId: activeTask?.id || null,
    type: 'focus',
    duration: focusDuration,
    remaining: focusDuration,
    isRunning: true,
    startTime: Date.now(),
  };
  
  // Update task status if exists
  if (activeTask) {
    db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run('in_progress', activeTask.id);
  }
  
  if (mainWindow) {
    mainWindow.webContents.send('pomodoro:sessionStarted', currentSession);
  }
  
  // Start timer
  startSessionTimer();
}

/**
 * Start the session timer
 */
function startSessionTimer() {
  if (sessionTimer) {
    clearInterval(sessionTimer);
  }
  
  sessionTimer = setInterval(() => {
    if (!currentSession || !currentSession.isRunning) return;
    
    currentSession.remaining -= 1000;
    
    if (mainWindow) {
      mainWindow.webContents.send('pomodoro:tick', {
        remaining: currentSession.remaining,
        isRunning: currentSession.isRunning,
      });
    }
    
    if (currentSession.remaining <= 0) {
      completeSession();
    }
  }, 1000);
}

/**
 * Complete the current session
 */
function completeSession() {
  if (!currentSession) return;
  
  const db = getDatabase();
  
  // Save session to database
  const sessionRecord = {
    id: uuidv4(),
    task_id: currentSession.taskId,
    type: currentSession.type,
    duration: currentSession.duration / 60000, // Convert to minutes
  };
  
  db.prepare(`
    INSERT INTO pomodoro_sessions (id, task_id, type, duration, completed_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).run(sessionRecord.id, sessionRecord.task_id, sessionRecord.type, sessionRecord.duration);
  
  // Increment pomodoro count for task if focus session
  if (currentSession.type === 'focus' && currentSession.taskId) {
    db.prepare(`
      UPDATE tasks SET pomodoro_count = pomodoro_count + 1, updated_at = datetime('now')
      WHERE id = ?
    `).run(currentSession.taskId);
  }
  
  // Update daily stats
  updateDailyStats(currentSession.type, currentSession.duration / 60000);
  
  // Send notification
  if (currentSession.type === 'focus') {
    sendNotification('Focus Session Complete!', 'Time for a break. Great work!');
    
    // Auto start break if enabled
    const autoStartBreaks = db.prepare('SELECT value FROM settings WHERE key = ?').get('auto_start_breaks');
    if (autoStartBreaks?.value === 'true') {
      startBreak();
    } else {
      currentSession = null;
      if (mainWindow) {
        mainWindow.webContents.send('pomodoro:sessionComplete', { type: 'focus' });
      }
    }
  } else {
    sendNotification('Break Complete!', 'Ready to focus again?');
    
    // Auto start pomodoro if enabled
    const autoStartPomodoros = db.prepare('SELECT value FROM settings WHERE key = ?').get('auto_start_pomodoros');
    if (autoStartPomodoros?.value === 'true') {
      handleStartPomodoro();
    } else {
      currentSession = null;
      if (mainWindow) {
        mainWindow.webContents.send('pomodoro:sessionComplete', { type: currentSession.type });
      }
    }
  }
  
  if (sessionTimer) {
    clearInterval(sessionTimer);
    sessionTimer = null;
  }
}

/**
 * Start a break session
 */
function startBreak() {
  const db = getDatabase();
  
  // Get settings
  const settings = db.prepare('SELECT key, value FROM settings').all();
  const settingsMap = {};
  settings.forEach(s => { settingsMap[s.key] = s.value; });
  
  // Determine break type based on completed sessions
  const today = new Date().toISOString().split('T')[0];
  const sessionCount = db.prepare(`
    SELECT COUNT(*) as count FROM pomodoro_sessions 
    WHERE type = 'focus' AND date(completed_at) = ?
  `).get(today);
  
  const longBreakInterval = parseInt(settingsMap.long_break_interval || '4');
  const isLongBreak = sessionCount.count > 0 && sessionCount.count % longBreakInterval === 0;
  
  const breakDuration = isLongBreak 
    ? parseInt(settingsMap.long_break_duration || '15') * 60 * 1000
    : parseInt(settingsMap.short_break_duration || '5') * 60 * 1000;
  
  const breakType = isLongBreak ? 'long_break' : 'short_break';
  
  currentSession = {
    ...currentSession,
    type: breakType,
    duration: breakDuration,
    remaining: breakDuration,
    isRunning: true,
    startTime: Date.now(),
  };
  
  if (mainWindow) {
    mainWindow.webContents.send('pomodoro:sessionStarted', currentSession);
  }
  
  startSessionTimer();
}

/**
 * Update daily stats
 */
function updateDailyStats(type, durationMinutes) {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const todayId = uuidv4();
  
  // Check if today's stats exist
  const existing = db.prepare('SELECT * FROM daily_stats WHERE date = ?').get(today);
  
  if (existing) {
    if (type === 'focus') {
      db.prepare(`
        UPDATE daily_stats 
        SET focus_sessions = focus_sessions + 1,
            total_focus_minutes = total_focus_minutes + ?
        WHERE date = ?
      `).run(Math.round(durationMinutes), today);
    }
  } else {
    db.prepare(`
      INSERT INTO daily_stats (id, date, focus_sessions, total_focus_minutes, completed_tasks)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      todayId,
      today,
      type === 'focus' ? 1 : 0,
      type === 'focus' ? Math.round(durationMinutes) : 0,
      0
    );
  }
}

/**
 * Setup IPC handlers
 */
function setupIPCHandlers() {
  const db = () => getDatabase();

  // === TASKS ===
  ipcMain.handle('tasks:getAll', async () => {
    return db().prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
  });

  ipcMain.handle('tasks:getById', async (event, id) => {
    return db().prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  });

  ipcMain.handle('tasks:create', async (event, { title, description }) => {
    const id = uuidv4();
    db().prepare(`
      INSERT INTO tasks (id, title, description, status, pomodoro_count, created_at, updated_at)
      VALUES (?, ?, ?, 'pending', 0, datetime('now'), datetime('now'))
    `).run(id, title, description || '');
    return db().prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  });

  ipcMain.handle('tasks:update', async (event, { id, title, description, status }) => {
    db().prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(title, description, status, id);
    return db().prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  });

  ipcMain.handle('tasks:delete', async (event, id) => {
    db().prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return { success: true };
  });

  ipcMain.handle('tasks:setActive', async (event, id) => {
    db().prepare("UPDATE tasks SET status = 'pending' WHERE status = 'in_progress'").run();
    db().prepare("UPDATE tasks SET status = 'in_progress' WHERE id = ?").run(id);
    return db().prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  });

  ipcMain.handle('tasks:getActive', async () => {
    return db().prepare("SELECT * FROM tasks WHERE status = 'in_progress'").get();
  });

  // === POMODORO ===
  ipcMain.handle('pomodoro:start', async () => {
    handleStartPomodoro();
    return currentSession;
  });

  ipcMain.handle('pomodoro:pause', async () => {
    if (currentSession) {
      currentSession.isRunning = false;
      if (sessionTimer) {
        clearInterval(sessionTimer);
        sessionTimer = null;
      }
    }
    return currentSession;
  });

  ipcMain.handle('pomodoro:reset', async () => {
    if (sessionTimer) {
      clearInterval(sessionTimer);
      sessionTimer = null;
    }
    currentSession = null;
    return { success: true };
  });

  ipcMain.handle('pomodoro:getCurrent', async () => {
    return currentSession;
  });

  ipcMain.handle('pomodoro:getSettings', async () => {
    const settings = db().prepare('SELECT key, value FROM settings').all();
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    return result;
  });

  ipcMain.handle('pomodoro:updateSettings', async (event, settings) => {
    const updateStmt = db().prepare('UPDATE settings SET value = ? WHERE key = ?');
    for (const [key, value] of Object.entries(settings)) {
      updateStmt.run(String(value), key);
    }
    return { success: true };
  });

  ipcMain.handle('pomodoro:getHistory', async (event, { limit = 30, type } = {}) => {
    let query = 'SELECT * FROM pomodoro_sessions';
    const params = [];
    
    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY completed_at DESC';
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }
    
    return db().prepare(query).all(...params);
  });

  // === DASHBOARD ===
  ipcMain.handle('dashboard:getStats', async () => {
    const totalSessions = db().prepare('SELECT COUNT(*) as count FROM pomodoro_sessions WHERE type = ?').get('focus');
    const totalMinutes = db().prepare('SELECT COALESCE(SUM(duration), 0) as total FROM pomodoro_sessions WHERE type = ?').get('focus');
    const completedTasks = db().prepare('SELECT COUNT(*) as count FROM tasks WHERE status = ?').get('completed');
    const totalTasks = db().prepare('SELECT COUNT(*) as count FROM tasks').get();
    
    return {
      totalFocusSessions: totalSessions.count,
      totalFocusMinutes: Math.round(totalMinutes.total),
      completedTasks: completedTasks.count,
      totalTasks: totalTasks.count,
    };
  });

  ipcMain.handle('dashboard:getTodayStats', async () => {
    const today = new Date().toISOString().split('T')[0];
    const todayStats = db().prepare('SELECT * FROM daily_stats WHERE date = ?').get(today);
    
    if (!todayStats) {
      return {
        date: today,
        focusSessions: 0,
        totalFocusMinutes: 0,
        completedTasks: 0,
      };
    }
    
    return todayStats;
  });

  // === SETTINGS ===
  ipcMain.handle('settings:get', async (event, key) => {
    return db().prepare('SELECT value FROM settings WHERE key = ?').get(key);
  });

  ipcMain.handle('settings:set', async (event, key, value) => {
    db().prepare('UPDATE settings SET value = ? WHERE key = ?').run(String(value), key);
    return { success: true };
  });

  ipcMain.handle('settings:getAll', async () => {
    const settings = db().prepare('SELECT key, value FROM settings').all();
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    return result;
  });

  // === APP ===
  ipcMain.handle('app:minimize', async () => {
    if (mainWindow) mainWindow.minimize();
    return { success: true };
  });

  ipcMain.handle('app:maximize', async () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
    return { success: true };
  });

  ipcMain.handle('app:close', async () => {
    if (mainWindow) mainWindow.close();
    return { success: true };
  });

  ipcMain.handle('app:getVersion', async () => {
    return app.getVersion();
  });
}

/**
 * App lifecycle events
 */
app.whenReady().then(async () => {
  try {
    console.log('[Main] Initializing app...');
    initDatabase();
    console.log('[Main] Database initialized');
    setupIPCHandlers();
    console.log('[Main] IPC handlers registered');
    createWindow();
    console.log('[Main] Window created');
  } catch (error) {
    console.error('[Main] Failed to initialize:', error);
    throw error;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    closeDatabase();
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (sessionTimer) {
    clearInterval(sessionTimer);
  }
  closeDatabase();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
