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
  const onSaveRef = useRef(onSave);

  // Update the ref whenever onSave changes
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const executeSave = useCallback(async () => {
    console.log('🚀 executeSave called, onSave:', typeof onSaveRef.current);

    if (isUnmountedRef.current) {
      console.log('❌ Component unmounted, skipping save');
      return;
    }

    setIsSaving(true);
    setIsPending(false);

    try {
      console.log('📞 Calling onSave...');
      await onSaveRef.current();
      console.log('✅ onSave completed successfully');
    } catch (error) {
      console.error('❌ Error in onSave:', error);
    } finally {
      if (!isUnmountedRef.current) {
        setIsSaving(false);
      }
    }
  }, []); // No dependencies since we use the ref

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
    console.log('🕐 useDebouncedSave useEffect called:', {
      shouldSave,
      isSaving,
      forceImmediate,
    });

    const shouldTriggerSave = shouldSave && !isSaving;

    if (!shouldTriggerSave) {
      console.log('❌ Not triggering save:', { shouldSave, isSaving });
      return;
    }

    if (forceImmediate) {
      console.log('⚡ Triggering immediate save');
      // Call executeSave directly
      (async () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (!isUnmountedRef.current) {
          setIsSaving(true);
          setIsPending(false);
          try {
            await onSaveRef.current();
          } catch (error) {
            console.error('❌ Error in immediate save:', error);
          } finally {
            if (!isUnmountedRef.current) {
              setIsSaving(false);
            }
          }
        }
      })();
      return;
    }

    // Clear any existing timeout
    console.log('⏰ Setting up debounced save timeout');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Set pending state
    setIsPending(true);

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      console.log('⏳ Timeout fired, executing save');
      if (!isUnmountedRef.current) {
        setIsSaving(true);
        setIsPending(false);
        try {
          console.log('📞 Calling onSave from timeout...');
          await onSaveRef.current();
          console.log('✅ onSave completed successfully');
        } catch (error) {
          console.error('❌ Error in onSave:', error);
        } finally {
          if (!isUnmountedRef.current) {
            setIsSaving(false);
          }
        }
      }
    }, delay);

    return () => {
      console.log('🧹 Cleanup: clearing timeout');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [
    shouldSave,
    isSaving,
    forceImmediate,
    delay,
    // No function dependencies!
  ]);

  // Cleanup on unmount
  useEffect(() => {
    console.log('🔧 useDebouncedSave cleanup effect setup');
    return () => {
      console.log(
        '🗑️ useDebouncedSave cleanup: setting isUnmountedRef to true'
      );
      isUnmountedRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []); // No dependencies - only run on mount/unmount

  return {
    isPending,
    isSaving,
    triggerSave,
    cancelPendingSave,
  };
}
