import { useState, useCallback } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  pomodoro_count: number;
  created_at: string;
  updated_at: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedTasks = await window.electronAPI.getTasks();
      setTasks(loadedTasks);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData: { title: string; description?: string }) => {
    try {
      const newTask = await window.electronAPI.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError('Failed to create task');
      console.error('Failed to create task:', err);
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (taskData: { 
    id: string; 
    title: string; 
    description?: string; 
    status?: string 
  }) => {
    try {
      const updatedTask = await window.electronAPI.updateTask(taskData);
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      return updatedTask;
    } catch (err) {
      setError('Failed to update task');
      console.error('Failed to update task:', err);
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await window.electronAPI.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
      console.error('Failed to delete task:', err);
      throw err;
    }
  }, []);

  const setActiveTask = useCallback(async (taskId: string) => {
    try {
      const updatedTask = await window.electronAPI.setActiveTask(taskId);
      setTasks(prev => prev.map(t => ({
        ...t,
        status: t.id === taskId ? 'in_progress' : t.status === 'in_progress' ? 'pending' : t.status,
      })));
      return updatedTask;
    } catch (err) {
      setError('Failed to set active task');
      console.error('Failed to set active task:', err);
      throw err;
    }
  }, []);

  const getTaskById = useCallback(async (taskId: string) => {
    try {
      return await window.electronAPI.getTaskById(taskId);
    } catch (err) {
      console.error('Failed to get task:', err);
      throw err;
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    refreshTasks,
    createTask,
    updateTask,
    deleteTask,
    setActiveTask,
    getTaskById,
  };
}
