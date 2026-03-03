import { useState, useEffect } from 'react';
import { usePomodoro } from '@hooks/usePomodoro';
import './SettingsPage.css';

interface SettingsState {
  focus_duration: string;
  short_break_duration: string;
  long_break_duration: string;
  long_break_interval: string;
  auto_start_breaks: string;
  auto_start_pomodoros: string;
  notifications_enabled: string;
}

function SettingsPage() {
  const { settings, updateSettings } = usePomodoro();
  const [localSettings, setLocalSettings] = useState<SettingsState>({
    focus_duration: '25',
    short_break_duration: '5',
    long_break_duration: '15',
    long_break_interval: '4',
    auto_start_breaks: 'false',
    auto_start_pomodoros: 'false',
    notifications_enabled: 'true',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setLocalSettings({
        focus_duration: settings.focus_duration || '25',
        short_break_duration: settings.short_break_duration || '5',
        long_break_duration: settings.long_break_duration || '15',
        long_break_interval: settings.long_break_interval || '4',
        auto_start_breaks: settings.auto_start_breaks || 'false',
        auto_start_pomodoros: settings.auto_start_pomodoros || 'false',
        notifications_enabled: settings.notifications_enabled || 'true',
      });
    }
  }, [settings]);

  const handleChange = (key: keyof SettingsState, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleToggle = (key: keyof SettingsState) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: prev[key] === 'true' ? 'false' : 'true',
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(localSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Customize your Pomodoro experience</p>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2 className="section-title">Timer Durations</h2>
          <p className="section-description">
            Set the length of your focus sessions and breaks
          </p>

          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="focus_duration">Focus Duration (minutes)</label>
              <input
                id="focus_duration"
                type="number"
                min="1"
                max="60"
                value={localSettings.focus_duration}
                onChange={(e) => handleChange('focus_duration', e.target.value)}
              />
            </div>

            <div className="setting-item">
              <label htmlFor="short_break_duration">Short Break (minutes)</label>
              <input
                id="short_break_duration"
                type="number"
                min="1"
                max="30"
                value={localSettings.short_break_duration}
                onChange={(e) => handleChange('short_break_duration', e.target.value)}
              />
            </div>

            <div className="setting-item">
              <label htmlFor="long_break_duration">Long Break (minutes)</label>
              <input
                id="long_break_duration"
                type="number"
                min="1"
                max="60"
                value={localSettings.long_break_duration}
                onChange={(e) => handleChange('long_break_duration', e.target.value)}
              />
            </div>

            <div className="setting-item">
              <label htmlFor="long_break_interval">Long Break Interval</label>
              <input
                id="long_break_interval"
                type="number"
                min="2"
                max="10"
                value={localSettings.long_break_interval}
                onChange={(e) => handleChange('long_break_interval', e.target.value)}
              />
              <span className="setting-hint">Focus sessions before long break</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Automation</h2>
          <p className="section-description">
            Automate your workflow with these options
          </p>

          <div className="settings-list">
            <div className="setting-toggle">
              <div className="toggle-content">
                <span className="toggle-label">Auto-start Breaks</span>
                <span className="toggle-description">
                  Automatically start break sessions when focus ends
                </span>
              </div>
              <button
                className={`toggle-switch ${localSettings.auto_start_breaks === 'true' ? 'active' : ''}`}
                onClick={() => handleToggle('auto_start_breaks')}
              >
                <span className="toggle-knob" />
              </button>
            </div>

            <div className="setting-toggle">
              <div className="toggle-content">
                <span className="toggle-label">Auto-start Pomodoros</span>
                <span className="toggle-description">
                  Automatically start focus sessions after breaks
                </span>
              </div>
              <button
                className={`toggle-switch ${localSettings.auto_start_pomodoros === 'true' ? 'active' : ''}`}
                onClick={() => handleToggle('auto_start_pomodoros')}
              >
                <span className="toggle-knob" />
              </button>
            </div>

            <div className="setting-toggle">
              <div className="toggle-content">
                <span className="toggle-label">Desktop Notifications</span>
                <span className="toggle-description">
                  Show notifications when sessions complete
                </span>
              </div>
              <button
                className={`toggle-switch ${localSettings.notifications_enabled === 'true' ? 'active' : ''}`}
                onClick={() => handleToggle('notifications_enabled')}
              >
                <span className="toggle-knob" />
              </button>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          {saved && <span className="save-message">Settings saved!</span>}
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
