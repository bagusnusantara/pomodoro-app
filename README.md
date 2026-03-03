# PomoTask

A production-ready Electron desktop application combining a Pomodoro Timer with Task Management. Built with modern technologies and best practices for security, performance, and maintainability.

![PomoTask](./build/icon.png)

## Features

### 🍅 Pomodoro Timer
- **Focus Sessions**: Default 25-minute focused work sessions
- **Short Breaks**: 5-minute breaks between focus sessions
- **Long Breaks**: 15-minute breaks after every 4 focus sessions
- **Configurable Durations**: Customize all timer durations
- **Auto-Switch**: Automatically transition between sessions
- **Desktop Notifications**: Get notified when sessions end
- **Session Persistence**: Current session state is saved

### 📋 Task Manager
- Create, edit, and delete tasks
- Mark tasks as complete
- Set active task for focus sessions
- Track pomodoro count per task
- Filter by status (All, Pending, Completed)

### 📊 Dashboard
- Today's completed pomodoros
- Total completed tasks
- Focus time visualization with charts
- Weekly progress tracking
- Dark mode support

### 🔒 Security
- Context isolation enabled
- Node integration disabled
- Secure IPC communication with channel validation
- Preload script with exposed safe APIs

## Tech Stack

- **Electron** (v29) - Desktop application framework
- **React** (v18) - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **SQLite** (better-sqlite3) - Local database
- **Chart.js** - Data visualization
- **electron-builder** - Packaging and distribution

## Project Structure

```
pomotask/
├── .github/
│   └── workflows/
│       └── release.yml          # GitHub Actions CI/CD
├── build/
│   └── entitlements.mac.plist   # macOS signing entitlements
├── database/
│   └── db.js                    # SQLite database setup
├── electron/
│   ├── main.js                  # Electron main process
│   └── preload.js               # Secure preload script
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx        # Dashboard component
│   │   ├── Dashboard.css
│   │   ├── Layout.tsx           # App layout with sidebar
│   │   ├── Layout.css
│   │   ├── TaskManager.tsx      # Task management
│   │   ├── TaskManager.css
│   │   ├── Timer.tsx            # Pomodoro timer
│   │   └── Timer.css
│   ├── hooks/
│   │   ├── useDashboard.ts      # Dashboard state
│   │   ├── usePomodoro.ts       # Timer state
│   │   ├── useTasks.ts          # Task state
│   │   └── useTheme.ts          # Theme management
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── TasksPage.tsx
│   │   └── TimerPage.tsx
│   ├── services/
│   │   ├── notificationService.ts
│   │   ├── storageService.ts
│   │   ├── timerService.ts
│   │   └── index.ts
│   ├── test/
│   │   ├── setup.ts             # Test configuration
│   │   └── timerService.test.ts # Unit tests
│   ├── App.tsx                  # Root component
│   ├── index.css                # Global styles
│   ├── main.tsx                 # Entry point
│   └── vite-env.d.ts            # TypeScript declarations
├── .eslintrc.cjs                # ESLint config
├── .gitignore
├── .prettierrc                  # Prettier config
├── electron-builder.json        # Build config
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.js
└── vitest.config.ts
```

## Prerequisites

- **Node.js** 20 or higher
- **npm** or **yarn**
- **Git**

## Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/pomotask.git
cd pomotask
```

### Install Dependencies

```bash
npm install
```

## Development

### Run in Development Mode

```bash
npm run electron:dev
```

This will:
1. Start the Vite development server
2. Launch the Electron app with hot reload

### Run Frontend Only (Web)

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Building

### Build for Production

```bash
npm run build
```

### Build Electron Installer

```bash
npm run electron:build
```

This creates installers in the `release/` directory:
- **Windows**: `.exe` (NSIS installer) and portable `.exe`
- **macOS**: `.dmg` and `.zip`
- **Linux**: `.AppImage` and `.deb`

### Build Without Packaging

```bash
npm run electron:pack
```

Creates unpacked application in `release/` directory.

## Creating a Release

### 1. Update Version

Update the version in `package.json`:

```json
{
  "version": "1.0.0"
}
```

### 2. Create Git Tag

```bash
git add .
git commit -m "Release v1.0.0"
git tag v1.0.0
git push origin main --tags
```

### 3. GitHub Actions Build

Pushing a tag triggers the CI/CD pipeline:
- Builds for Windows, macOS, and Linux
- Runs linting and tests
- Creates GitHub Release with artifacts

### Manual Release Steps

1. Build the application:
   ```bash
   npm run electron:build
   ```

2. Create a GitHub Release manually:
   - Go to Releases page
   - Click "Create a new release"
   - Tag version: `v1.0.0`
   - Upload files from `release/` folder

## Configuration

### Timer Settings

Configure in Settings page or modify defaults in `database/db.js`:

| Setting | Default | Description |
|---------|---------|-------------|
| Focus Duration | 25 min | Length of focus sessions |
| Short Break | 5 min | Length of short breaks |
| Long Break | 15 min | Length of long breaks |
| Long Break Interval | 4 | Sessions before long break |
| Auto-start Breaks | false | Auto-start breaks |
| Auto-start Pomodoros | false | Auto-start focus sessions |
| Notifications | true | Desktop notifications |

### macOS Code Signing

For macOS distribution, set these environment variables:

```bash
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="your-password"
export APPLE_ID="your@apple.id"
export APPLE_APP_SPECIFIC_PASSWORD="your-app-password"
export APPLE_TEAM_ID="your-team-id"
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build React app |
| `npm run electron:dev` | Run Electron in dev mode |
| `npm run electron:build` | Build and package app |
| `npm run electron:pack` | Build without packaging |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |
| `npm run test` | Run unit tests |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Run tests with coverage |

## Testing

### Run Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

## Database Schema

### Tasks Table
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  pomodoro_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### Pomodoro Sessions Table
```sql
CREATE TABLE pomodoro_sessions (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  type TEXT NOT NULL,
  duration INTEGER NOT NULL,
  completed_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

### Settings Table
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

### Daily Stats Table
```sql
CREATE TABLE daily_stats (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  focus_sessions INTEGER DEFAULT 0,
  total_focus_minutes INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0
);
```

## Security Considerations

1. **Context Isolation**: Enabled to isolate Electron APIs from renderer
2. **Node Integration**: Disabled in renderer process
3. **IPC Validation**: All IPC channels are validated against whitelist
4. **Preload Script**: Only exposes necessary, safe APIs
5. **CSP**: Content Security Policy configured in `index.html`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a Pull Request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Chart.js](https://www.chartjs.org/)
- [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3)

---

Built with ❤️ for productive developers everywhere.
