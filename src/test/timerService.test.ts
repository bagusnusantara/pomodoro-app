import { describe, it, expect } from 'vitest';
import {
  formatTime,
  formatDuration,
  calculateProgress,
  getSessionColor,
  getSessionLabel,
  getSessionIcon,
  formatTimeUntil,
} from '../services/timerService';

describe('Timer Service', () => {
  describe('formatTime', () => {
    it('should format milliseconds to MM:SS format', () => {
      expect(formatTime(25 * 60 * 1000)).toBe('25:00');
      expect(formatTime(5 * 60 * 1000)).toBe('05:00');
      expect(formatTime(15 * 60 * 1000)).toBe('15:00');
    });

    it('should handle zero time', () => {
      expect(formatTime(0)).toBe('00:00');
    });

    it('should handle seconds', () => {
      expect(formatTime(30 * 1000)).toBe('00:30');
      expect(formatTime(45 * 1000)).toBe('00:45');
    });

    it('should pad single digit minutes and seconds', () => {
      expect(formatTime(1 * 60 * 1000 + 5 * 1000)).toBe('01:05');
      expect(formatTime(9 * 60 * 1000 + 9 * 1000)).toBe('09:09');
    });
  });

  describe('formatDuration', () => {
    it('should format duration in minutes', () => {
      expect(formatDuration(25 * 60 * 1000)).toBe('25m');
      expect(formatDuration(5 * 60 * 1000)).toBe('5m');
    });

    it('should format duration in hours and minutes', () => {
      expect(formatDuration(90 * 60 * 1000)).toBe('1h 30m');
      expect(formatDuration(120 * 60 * 1000)).toBe('2h 0m');
    });

    it('should handle zero duration', () => {
      expect(formatDuration(0)).toBe('0m');
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress percentage', () => {
      expect(calculateProgress(25 * 60 * 1000, 25 * 60 * 1000)).toBe(100);
      expect(calculateProgress(12.5 * 60 * 1000, 25 * 60 * 1000)).toBe(50);
      expect(calculateProgress(0, 25 * 60 * 1000)).toBe(0);
    });

    it('should handle zero total', () => {
      expect(calculateProgress(100, 0)).toBe(0);
    });

    it('should round to nearest integer', () => {
      expect(calculateProgress(1, 3)).toBe(33);
      expect(calculateProgress(2, 3)).toBe(67);
    });
  });

  describe('getSessionColor', () => {
    it('should return correct color for focus session', () => {
      expect(getSessionColor('focus')).toBe('#f97316');
    });

    it('should return correct color for short break', () => {
      expect(getSessionColor('short_break')).toBe('#22c55e');
    });

    it('should return correct color for long break', () => {
      expect(getSessionColor('long_break')).toBe('#3b82f6');
    });
  });

  describe('getSessionLabel', () => {
    it('should return correct label for focus session', () => {
      expect(getSessionLabel('focus')).toBe('Focus Time');
    });

    it('should return correct label for short break', () => {
      expect(getSessionLabel('short_break')).toBe('Short Break');
    });

    it('should return correct label for long break', () => {
      expect(getSessionLabel('long_break')).toBe('Long Break');
    });
  });

  describe('getSessionIcon', () => {
    it('should return correct icon for focus session', () => {
      expect(getSessionIcon('focus')).toBe('🎯');
    });

    it('should return correct icon for short break', () => {
      expect(getSessionIcon('short_break')).toBe('☕');
    });

    it('should return correct icon for long break', () => {
      expect(getSessionIcon('long_break')).toBe('🌴');
    });
  });

  describe('formatTimeUntil', () => {
    it('should format less than a minute', () => {
      expect(formatTimeUntil(30 * 1000)).toBe('Less than a minute');
    });

    it('should format one minute', () => {
      expect(formatTimeUntil(60 * 1000)).toBe('1 minute');
    });

    it('should format multiple minutes', () => {
      expect(formatTimeUntil(25 * 60 * 1000)).toBe('25 minutes');
    });

    it('should format hours', () => {
      expect(formatTimeUntil(120 * 60 * 1000)).toBe('2 hours');
    });

    it('should format hours and minutes', () => {
      expect(formatTimeUntil(90 * 60 * 1000)).toBe('1h 30m');
    });
  });
});
