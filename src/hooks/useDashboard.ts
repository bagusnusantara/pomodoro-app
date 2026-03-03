import { useState, useEffect, useCallback } from 'react';

interface DashboardStats {
  totalFocusSessions: number;
  totalFocusMinutes: number;
  completedTasks: number;
  totalTasks: number;
}

interface DailyStats {
  id: string;
  date: string;
  focusSessions: number;
  totalFocusMinutes: number;
  completedTasks: number;
}

interface WeeklyData {
  labels: string[];
  data: number[];
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFocusSessions: 0,
    totalFocusMinutes: 0,
    completedTasks: 0,
    totalTasks: 0,
  });
  const [todayStats, setTodayStats] = useState<DailyStats>({
    id: '',
    date: '',
    focusSessions: 0,
    totalFocusMinutes: 0,
    completedTasks: 0,
  });
  const [weeklyData, setWeeklyData] = useState<WeeklyData>({
    labels: [],
    data: [],
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const [dashboardStats, today] = await Promise.all([
        window.electronAPI.getDashboardStats(),
        window.electronAPI.getTodayStats(),
      ]);
      
      setStats(dashboardStats);
      setTodayStats(today);
      
      // Generate weekly data (mock data for now, can be extended with actual history)
      generateWeeklyData(today.totalFocusMinutes);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateWeeklyData = (todayMinutes: number) => {
    // Generate last 7 days labels
    const labels: string[] = [];
    const data: number[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      labels.push(dayLabel);
      
      // For today, use actual data; for past days, generate mock data
      if (i === 0) {
        data.push(todayMinutes);
      } else {
        // Mock data - in production, fetch from database
        data.push(Math.floor(Math.random() * 120) + 30);
      }
    }
    
    setWeeklyData({ labels, data });
  };

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    todayStats,
    weeklyData,
    loading,
    refreshStats: loadStats,
  };
}
