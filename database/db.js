const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let db = null;

/**
 * Get the database path based on the environment
 */
function getDatabasePath() {
  if (process.env.NODE_ENV === 'development') {
    return path.join(__dirname, '..', 'data', 'pomotask.db');
  }
  return path.join(app.getPath('userData'), 'pomotask.db');
}

/**
 * Initialize the database and create tables if they don't exist
 */
function initDatabase() {
  const dbPath = getDatabasePath();
  
  // Ensure the directory exists
  const fs = require('fs');
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create tables
  createTables();
  
  return db;
}

/**
 * Create all database tables
 */
function createTables() {
  // Tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed')),
      pomodoro_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Pomodoro sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id TEXT PRIMARY KEY,
      task_id TEXT,
      type TEXT NOT NULL CHECK(type IN ('focus', 'short_break', 'long_break')),
      duration INTEGER NOT NULL,
      completed_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
    )
  `);

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Daily stats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_stats (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      focus_sessions INTEGER DEFAULT 0,
      total_focus_minutes INTEGER DEFAULT 0,
      completed_tasks INTEGER DEFAULT 0
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
    CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_task_id ON pomodoro_sessions(task_id);
    CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_completed_at ON pomodoro_sessions(completed_at);
    CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
  `);

  // Insert default settings if not exists
  const defaultSettings = [
    { key: 'focus_duration', value: '25' },
    { key: 'short_break_duration', value: '5' },
    { key: 'long_break_duration', value: '15' },
    { key: 'auto_start_breaks', value: 'false' },
    { key: 'auto_start_pomodoros', value: 'false' },
    { key: 'long_break_interval', value: '4' },
    { key: 'notifications_enabled', value: 'true' },
    { key: 'dark_mode', value: 'true' },
  ];

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
  `);

  for (const setting of defaultSettings) {
    insertSetting.run(setting.key, setting.value);
  }
}

/**
 * Get the database instance
 */
function getDatabase() {
  if (!db) {
    initDatabase();
  }
  return db;
}

/**
 * Close the database connection
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase,
};
