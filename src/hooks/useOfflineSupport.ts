import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  OfflineConfig,
  OfflineQueueStatus,
} from '../types/ValidationTypes';

interface QueuedChange {
  id: string;
  fieldName: string;
  value: string;
  timestamp: number;
  retryCount: number;
}

interface OfflineState {
  isOnline: boolean;
  queueStatus: OfflineQueueStatus;
  queuedChanges: QueuedChange[];
  hasUnsynced: boolean;
}

interface UseOfflineSupportReturn {
  /** Current offline state */
  offlineState: OfflineState;
  /** Queue a change for offline storage */
  queueChange: (fieldName: string, value: string) => void;
  /** Sync queued changes */
  syncQueuedChanges: () => Promise<void>;
  /** Get stored value for a field */
  getStoredValue: (fieldName: string) => string | null;
  /** Clear stored value for a field */
  clearStoredValue: (fieldName: string) => void;
  /** Clear all offline data */
  clearOfflineData: () => void;
}

/**
 * Hook for offline support with local storage fallback and sync queue
 */
export function useOfflineSupport(
  config: OfflineConfig,
  onSync?: (fieldName: string, value: string) => Promise<void>
): UseOfflineSupportReturn {
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    queueStatus: 'idle',
    queuedChanges: [],
    hasUnsynced: false,
  });

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const storageKeyPrefix = config.storageKeyPrefix || 'cms-offline';

  // Load queued changes from localStorage on init
  useEffect(() => {
    if (!config.enabled) return;

    const loadQueuedChanges = () => {
      const queueKey = `${storageKeyPrefix}-queue`;
      const stored = localStorage.getItem(queueKey);

      if (stored) {
        try {
          const queuedChanges = JSON.parse(stored);
          setOfflineState((prev) => ({
            ...prev,
            queuedChanges,
            hasUnsynced: queuedChanges.length > 0,
          }));
        } catch (error) {
          console.error('Failed to load queued changes:', error);
        }
      }
    };

    loadQueuedChanges();
  }, [config.enabled, storageKeyPrefix]);

  // Monitor online/offline status
  useEffect(() => {
    if (!config.enabled) return;

    const handleOnline = () => {
      setOfflineState((prev) => ({ ...prev, isOnline: true }));
      // Auto-sync when coming back online
      if (offlineState.hasUnsynced) {
        scheduleSyncAttempt();
      }
    };

    const handleOffline = () => {
      setOfflineState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.enabled, offlineState.hasUnsynced]);

  const queueChange = useCallback(
    (fieldName: string, value: string) => {
      if (!config.enabled) return;

      const change: QueuedChange = {
        id: `${fieldName}-${Date.now()}`,
        fieldName,
        value,
        timestamp: Date.now(),
        retryCount: 0,
      };

      // Store in localStorage
      const storageKey = `${storageKeyPrefix}-${fieldName}`;
      localStorage.setItem(storageKey, value);

      // Add to queue
      setOfflineState((prev) => {
        const newQueue = [...prev.queuedChanges, change];

        // Limit queue size
        const maxSize = config.maxQueueSize || 100;
        const limitedQueue = newQueue.slice(-maxSize);

        // Update localStorage queue
        const queueKey = `${storageKeyPrefix}-queue`;
        localStorage.setItem(queueKey, JSON.stringify(limitedQueue));

        return {
          ...prev,
          queuedChanges: limitedQueue,
          hasUnsynced: true,
        };
      });

      // Schedule sync if online
      if (offlineState.isOnline) {
        scheduleSyncAttempt();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      config.enabled,
      config.maxQueueSize,
      storageKeyPrefix,
      offlineState.isOnline,
    ]
  );

  const syncQueuedChanges = useCallback(async () => {
    if (!config.enabled || !onSync || offlineState.queuedChanges.length === 0) {
      return;
    }

    setOfflineState((prev) => ({ ...prev, queueStatus: 'syncing' }));

    const maxRetries = config.maxRetries || 3;
    const retryDelay = config.retryDelay || 1000;

    try {
      const successfulSyncs: string[] = [];
      const failedSyncs: QueuedChange[] = [];

      for (const change of offlineState.queuedChanges) {
        try {
          await onSync(change.fieldName, change.value);
          successfulSyncs.push(change.id);

          // Clear from localStorage
          const storageKey = `${storageKeyPrefix}-${change.fieldName}`;
          localStorage.removeItem(storageKey);
        } catch (error) {
          console.error(`Failed to sync change ${change.id}:`, error);

          if (change.retryCount < maxRetries) {
            failedSyncs.push({
              ...change,
              retryCount: change.retryCount + 1,
            });
          }
        }
      }

      // Update state with remaining failed syncs
      setOfflineState((prev) => {
        const updatedQueue = failedSyncs;

        // Update localStorage queue
        const queueKey = `${storageKeyPrefix}-queue`;
        if (updatedQueue.length > 0) {
          localStorage.setItem(queueKey, JSON.stringify(updatedQueue));
        } else {
          localStorage.removeItem(queueKey);
        }

        return {
          ...prev,
          queuedChanges: updatedQueue,
          hasUnsynced: updatedQueue.length > 0,
          queueStatus: updatedQueue.length > 0 ? 'error' : 'success',
        };
      });

      // Schedule retry for failed syncs
      if (failedSyncs.length > 0) {
        setTimeout(() => {
          syncQueuedChanges();
        }, retryDelay);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setOfflineState((prev) => ({ ...prev, queueStatus: 'error' }));
    }
  }, [
    config.enabled,
    config.maxRetries,
    config.retryDelay,
    onSync,
    offlineState.queuedChanges,
    storageKeyPrefix,
  ]);

  const getStoredValue = useCallback(
    (fieldName: string): string | null => {
      if (!config.enabled) return null;

      const storageKey = `${storageKeyPrefix}-${fieldName}`;
      return localStorage.getItem(storageKey);
    },
    [config.enabled, storageKeyPrefix]
  );

  const clearStoredValue = useCallback(
    (fieldName: string) => {
      if (!config.enabled) return;

      const storageKey = `${storageKeyPrefix}-${fieldName}`;
      localStorage.removeItem(storageKey);
    },
    [config.enabled, storageKeyPrefix]
  );

  const clearOfflineData = useCallback(() => {
    if (!config.enabled) return;

    // Clear all stored values
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(storageKeyPrefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Clear state
    setOfflineState((prev) => ({
      ...prev,
      queuedChanges: [],
      hasUnsynced: false,
      queueStatus: 'idle',
    }));
  }, [config.enabled, storageKeyPrefix]);

  const scheduleSyncAttempt = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncQueuedChanges();
    }, 1000); // Delay sync by 1 second
  }, [syncQueuedChanges]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    offlineState,
    queueChange,
    syncQueuedChanges,
    getStoredValue,
    clearStoredValue,
    clearOfflineData,
  };
}
