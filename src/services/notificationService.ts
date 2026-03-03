/**
 * Notification Service
 * 
 * Handles desktop notifications for session events
 */

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  onClick?: () => void;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private unsubscribeRef: (() => void) | null = null;

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        this.permission = permission;
        return permission === 'granted';
      } catch (error) {
        console.error('Failed to request notification permission:', error);
        return false;
      }
    }

    return false;
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.permission === 'granted';
  }

  /**
   * Show a notification
   */
  show(options: NotificationOptions): Notification | null {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return null;
    }

    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/vite.svg',
      });

      if (options.onClick) {
        notification.onclick = () => {
          options.onClick?.();
          notification.close();
        };
      }

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  /**
   * Show session complete notification
   */
  showSessionComplete(type: 'focus' | 'short_break' | 'long_break'): Notification | null {
    const messages = {
      focus: {
        title: '🎯 Focus Session Complete!',
        body: 'Great work! Time for a well-deserved break.',
      },
      short_break: {
        title: '☕ Break Complete!',
        body: 'Ready to focus again?',
      },
      long_break: {
        title: '🌴 Long Break Complete!',
        body: 'You\'re refreshed! Let\'s get back to work.',
      },
    };

    return this.show(messages[type]);
  }

  /**
   * Show session starting notification
   */
  showSessionStarting(type: 'focus' | 'short_break' | 'long_break'): Notification | null {
    const messages = {
      focus: {
        title: '🎯 Starting Focus Session',
        body: 'Time to concentrate. You got this!',
      },
      short_break: {
        title: '☕ Starting Short Break',
        body: 'Take a moment to relax.',
      },
      long_break: {
        title: '🌴 Starting Long Break',
        body: 'Enjoy your extended break!',
      },
    };

    return this.show(messages[type]);
  }

  /**
   * Subscribe to Electron notification events
   */
  subscribeToElectronNotifications(): void {
    if (window.electronAPI) {
      this.unsubscribeRef = window.electronAPI.onNotification((data) => {
        this.show({
          title: data.title,
          body: data.body,
        });
      });
    }
  }

  /**
   * Unsubscribe from Electron notification events
   */
  unsubscribe(): void {
    if (this.unsubscribeRef) {
      this.unsubscribeRef();
      this.unsubscribeRef = null;
    }
  }

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    await this.requestPermission();
    this.subscribeToElectronNotifications();
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.unsubscribe();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export for testing
export { NotificationService };
