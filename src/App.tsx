import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from '@components/Layout';
import TimerPage from '@pages/TimerPage';
import TasksPage from '@pages/TasksPage';
import DashboardPage from '@pages/DashboardPage';
import SettingsPage from '@pages/SettingsPage';
import { useTheme } from '@hooks/useTheme';

function App() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize app
    const initApp = async () => {
      try {
        // Load initial settings
        if (window.electronAPI) {
          await window.electronAPI.getAllSettings();
        }
      } catch (error) {
        console.error('[App] Failed to initialize:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">PomoTask</div>
          <p className="text-secondary mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Layout>
        <Routes>
          <Route path="/" element={<TimerPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
