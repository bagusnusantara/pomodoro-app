import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useDashboard } from '@hooks/useDashboard';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Dashboard() {
  const { stats, todayStats, weeklyData } = useDashboard();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Data is loaded via the hook
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Pie chart data for task status
  const taskStatusData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [stats.completedTasks, stats.totalTasks - stats.completedTasks],
        backgroundColor: ['#22c55e', '#6366f1'],
        borderColor: ['#16a34a', '#4f46e5'],
        borderWidth: 2,
      },
    ],
  };

  // Bar chart data for weekly focus time
  const weeklyChartData = {
    labels: weeklyData.labels,
    datasets: [
      {
        label: 'Focus Minutes',
        data: weeklyData.data,
        backgroundColor: '#6366f1',
        borderColor: '#4f46e5',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Dashboard</h2>
        <p className="dashboard-subtitle">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <span className="stat-value">{todayStats.focusSessions}</span>
            <span className="stat-label">Today's Sessions</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <span className="stat-value">{todayStats.totalFocusMinutes}</span>
            <span className="stat-label">Focus Minutes</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-value">{todayStats.completedTasks}</span>
            <span className="stat-label">Tasks Completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalFocusMinutes}</span>
            <span className="stat-label">Total Minutes</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Task Overview</h3>
          <div className="chart-container">
            <Pie data={taskStatusData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Weekly Focus Time</h3>
          <div className="chart-container">
            <Bar data={weeklyChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      <div className="achievements">
        <h3 className="achievements-title">Overall Progress</h3>
        <div className="achievements-grid">
          <div className="achievement-item">
            <span className="achievement-icon">🍅</span>
            <div className="achievement-content">
              <span className="achievement-value">{stats.totalFocusSessions}</span>
              <span className="achievement-label">Total Pomodoros</span>
            </div>
          </div>
          <div className="achievement-item">
            <span className="achievement-icon">⭐</span>
            <div className="achievement-content">
              <span className="achievement-value">{stats.completedTasks}</span>
              <span className="achievement-label">Tasks Completed</span>
            </div>
          </div>
          <div className="achievement-item">
            <span className="achievement-icon">📚</span>
            <div className="achievement-content">
              <span className="achievement-value">{stats.totalTasks}</span>
              <span className="achievement-label">Total Tasks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
