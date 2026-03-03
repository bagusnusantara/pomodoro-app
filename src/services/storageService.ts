/**
 * Storage Service
 *
 * Handles local storage for web fallback and caching
 */

const STORAGE_PREFIX = 'pomotask_';

export type StorageKey = 'theme' | 'settings' | 'lastTask' | 'onboardingComplete';

class StorageService {
  /**
   * Get a value from storage
   */
  get<T>(key: StorageKey): T | null {
    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (item) {
        return JSON.parse(item) as T;
      }
      return null;
    } catch (error) {
      console.error('Failed to get from storage:', error);
      return null;
    }
  }

  /**
   * Set a value in storage
   */
  set<T>(key: StorageKey, value: T): void {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to set storage:', error);
    }
  }

  /**
   * Remove a value from storage
   */
  remove(key: StorageKey): void {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch (error) {
      console.error('Failed to remove from storage:', error);
    }
  }

  /**
   * Clear all storage
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  /**
   * Get all stored keys
   */
  keys(): StorageKey[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter((key) => key.startsWith(STORAGE_PREFIX))
        .map((key) => key.replace(STORAGE_PREFIX, '') as StorageKey);
    } catch (error) {
      console.error('Failed to get storage keys:', error);
      return [];
    }
  }

  /**
   * Check if a key exists
   */
  has(key: StorageKey): boolean {
    try {
      return localStorage.getItem(`${STORAGE_PREFIX}${key}`) !== null;
    } catch (error) {
      console.error('Failed to check storage:', error);
      return false;
    }
  }

  /**
   * Get storage size in bytes
   */
  getSize(): number {
    let size = 0;
    try {
      for (const key in localStorage) {
        if (
          Object.prototype.hasOwnProperty.call(localStorage, key) &&
          key.startsWith(STORAGE_PREFIX)
        ) {
          size += localStorage[key].length * 2; // UTF-16 characters
        }
      }
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
    }
    return size;
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Export for testing
export { StorageService };
