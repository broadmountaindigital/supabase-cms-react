import { useCallback, useRef, useState } from 'react';
import type {
  ConflictDetection,
  ConflictResolutionStrategy,
} from '../types/ValidationTypes';

interface ConflictState {
  hasConflict: boolean;
  serverValue: string | null;
  localValue: string | null;
  serverTimestamp: string | null;
  localTimestamp: string | null;
}

interface UseConflictDetectionReturn {
  /** Current conflict state */
  conflictState: ConflictState;
  /** Check for conflicts before saving */
  checkForConflict: (
    localValue: string,
    serverValue: string,
    serverTimestamp: string
  ) => boolean;
  /** Resolve a conflict using the specified strategy */
  resolveConflict: (strategy: ConflictResolutionStrategy) => Promise<string>;
  /** Clear conflict state */
  clearConflict: () => void;
  /** Update server timestamp after successful save */
  updateServerTimestamp: (timestamp: string) => void;
}

/**
 * Hook for detecting and resolving editing conflicts
 */
export function useConflictDetection(
  config?: ConflictDetection
): UseConflictDetectionReturn {
  const [conflictState, setConflictState] = useState<ConflictState>({
    hasConflict: false,
    serverValue: null,
    localValue: null,
    serverTimestamp: null,
    localTimestamp: null,
  });

  const lastKnownTimestampRef = useRef<string | null>(
    config?.serverTimestamp || null
  );

  const checkForConflict = useCallback(
    (
      localValue: string,
      serverValue: string,
      serverTimestamp: string
    ): boolean => {
      if (!config?.enabled) {
        return false;
      }

      const hasTimestampConflict = Boolean(
        lastKnownTimestampRef.current &&
          lastKnownTimestampRef.current !== serverTimestamp
      );

      const hasValueConflict = localValue !== serverValue;

      const hasConflict = hasTimestampConflict && hasValueConflict;

      if (hasConflict) {
        setConflictState({
          hasConflict: true,
          serverValue,
          localValue,
          serverTimestamp,
          localTimestamp: lastKnownTimestampRef.current,
        });
      }

      return hasConflict;
    },
    [config?.enabled]
  );

  const resolveConflict = useCallback(
    async (strategy: ConflictResolutionStrategy): Promise<string> => {
      const { serverValue, localValue } = conflictState;

      if (!serverValue || !localValue) {
        throw new Error('No conflict to resolve');
      }

      const resolvedValue = await executeConflictResolution(
        strategy,
        serverValue,
        localValue,
        config?.onConflict
      );

      // Clear conflict state after resolution
      setConflictState({
        hasConflict: false,
        serverValue: null,
        localValue: null,
        serverTimestamp: null,
        localTimestamp: null,
      });

      return resolvedValue;
    },
    [conflictState, config?.onConflict]
  );

  const clearConflict = useCallback(() => {
    setConflictState({
      hasConflict: false,
      serverValue: null,
      localValue: null,
      serverTimestamp: null,
      localTimestamp: null,
    });
  }, []);

  const updateServerTimestamp = useCallback((timestamp: string) => {
    lastKnownTimestampRef.current = timestamp;
  }, []);

  return {
    conflictState,
    checkForConflict,
    resolveConflict,
    clearConflict,
    updateServerTimestamp,
  };
}

// Helper function to execute conflict resolution based on strategy
async function executeConflictResolution(
  strategy: ConflictResolutionStrategy,
  serverValue: string,
  localValue: string,
  customHandler?: (serverValue: string, localValue: string) => Promise<string>
): Promise<string> {
  switch (strategy) {
    case 'server':
      return serverValue;

    case 'local':
      return localValue;

    case 'merge': {
      // Simple merge strategy - you could implement more sophisticated merging
      const mergedValue = createMergedValue(serverValue, localValue);
      return mergedValue;
    }

    case 'manual': {
      if (customHandler) {
        return await customHandler(serverValue, localValue);
      }
      throw new Error('Manual resolution requires a custom handler');
    }

    default:
      return serverValue; // Default to server value
  }
}

// Helper function for simple merge strategy
function createMergedValue(serverValue: string, localValue: string): string {
  // This is a simple implementation - in practice, you might want
  // to use a more sophisticated merge algorithm
  const serverLines = serverValue.split('\n');
  const localLines = localValue.split('\n');

  // If one is empty, use the other
  if (serverLines.length === 0) return localValue;
  if (localLines.length === 0) return serverValue;

  // Simple merge: combine unique lines
  const allLines = [...new Set([...serverLines, ...localLines])];
  return allLines.join('\n');
}
