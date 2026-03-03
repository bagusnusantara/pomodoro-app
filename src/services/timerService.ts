/**
 * Timer Service
 * 
 * Utility functions for time formatting and calculations
 */

/**
 * Format milliseconds to MM:SS format
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format milliseconds to human readable duration
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  
  return `${minutes}m`;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((current / total) * 100);
}

/**
 * Get session type color
 */
export function getSessionColor(type: 'focus' | 'short_break' | 'long_break'): string {
  switch (type) {
    case 'focus':
      return '#f97316';
    case 'short_break':
      return '#22c55e';
    case 'long_break':
      return '#3b82f6';
    default:
      return '#f97316';
  }
}

/**
 * Get session type label
 */
export function getSessionLabel(type: 'focus' | 'short_break' | 'long_break'): string {
  switch (type) {
    case 'focus':
      return 'Focus Time';
    case 'short_break':
      return 'Short Break';
    case 'long_break':
      return 'Long Break';
    default:
      return 'Focus Time';
  }
}

/**
 * Get session type icon
 */
export function getSessionIcon(type: 'focus' | 'short_break' | 'long_break'): string {
  switch (type) {
    case 'focus':
      return '🎯';
    case 'short_break':
      return '☕';
    case 'long_break':
      return '🌴';
    default:
      return '🎯';
  }
}

/**
 * Calculate estimated completion time
 */
export function getEstimatedCompletion(remainingMs: number): Date {
  return new Date(Date.now() + remainingMs);
}

/**
 * Format time until completion
 */
export function formatTimeUntil(remainingMs: number): string {
  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  
  if (minutes === 0) {
    return 'Less than a minute';
  } else if (minutes === 1) {
    return '1 minute';
  } else if (minutes < 60) {
    return `${minutes} minutes`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}
