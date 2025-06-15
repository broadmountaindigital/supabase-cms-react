import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  UseDebouncedSaveOptions,
  UseDebouncedSaveReturn,
} from '../types/DebouncedSaveTypes';

/**
 * Hook for debounced saving with configurable delay and force-save capability.
 * Prevents excessive API calls during rapid user input.
 */
export function useDebouncedSave({
  delay = 1000,
  onSave,
  shouldSave,
  forceImmediate = false,
}: UseDebouncedSaveOptions): UseDebouncedSaveReturn {
  const [isPending, setIsPending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const executeSave = useCallback(async () => {
    if (isUnmountedRef.current) {
      return;
    }

    setIsSaving(true);
    setIsPending(false);

    try {
      await onSave();
    } finally {
      if (!isUnmountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [onSave]);

  const triggerSave = useCallback(async () => {
    clearPendingTimeout();
    await executeSave();
  }, [clearPendingTimeout, executeSave]);

  const cancelPendingSave = useCallback(() => {
    clearPendingTimeout();
    setIsPending(false);
  }, [clearPendingTimeout]);

  // Handle debounced save logic
  useEffect(() => {
    const shouldTriggerSave = shouldSave && !isSaving;

    if (!shouldTriggerSave) {
      return;
    }

    if (forceImmediate) {
      triggerSave();
      return;
    }

    // Clear any existing timeout
    clearPendingTimeout();

    // Set pending state
    setIsPending(true);

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      executeSave();
    }, delay);

    return () => {
      clearPendingTimeout();
    };
  }, [
    shouldSave,
    forceImmediate,
    delay,
    isSaving,
    triggerSave,
    executeSave,
    clearPendingTimeout,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      clearPendingTimeout();
    };
  }, [clearPendingTimeout]);

  return {
    isPending,
    isSaving,
    triggerSave,
    cancelPendingSave,
  };
}
