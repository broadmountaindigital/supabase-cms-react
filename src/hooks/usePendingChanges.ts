import { usePendingChangesContext } from '../providers/usePendingChangesContext';
import type { PendingChangesConfig } from '../types/PendingChangesTypes';

export interface UsePendingChangesReturn {
  /** All pending changes */
  changes: ReturnType<typeof usePendingChangesContext>['changes'];
  /** Whether there are any pending changes */
  hasChanges: ReturnType<typeof usePendingChangesContext>['hasChanges'];
  /** Number of pending changes */
  changeCount: ReturnType<typeof usePendingChangesContext>['changeCount'];
  /** Whether a save operation is in progress */
  isSaving: ReturnType<typeof usePendingChangesContext>['isSaving'];
  /** Save all pending changes */
  saveAll: ReturnType<typeof usePendingChangesContext>['saveAll'];
  /** Clear all pending changes */
  clearAll: ReturnType<typeof usePendingChangesContext>['clearAll'];
  /** Retry saving failed changes */
  retryFailedChanges: ReturnType<
    typeof usePendingChangesContext
  >['retryFailedChanges'];
  /** Get changes that are currently being saved */
  getSavingChanges: ReturnType<
    typeof usePendingChangesContext
  >['getSavingChanges'];
  /** Get changes that have errors */
  getErrorChanges: ReturnType<
    typeof usePendingChangesContext
  >['getErrorChanges'];
  /** Add a change to the pending changes */
  addChange: ReturnType<typeof usePendingChangesContext>['addChange'];
  /** Remove a change from pending changes */
  removeChange: ReturnType<typeof usePendingChangesContext>['removeChange'];
  /** Get a specific change */
  getChange: ReturnType<typeof usePendingChangesContext>['getChange'];
  /** Update configuration */
  updateConfig: ReturnType<typeof usePendingChangesContext>['updateConfig'];
  /** Last save result */
  lastSaveResult: ReturnType<typeof usePendingChangesContext>['lastSaveResult'];
  /** Register a callback for when a specific field is saved */
  onFieldSaved: ReturnType<typeof usePendingChangesContext>['onFieldSaved'];
}

/**
 * Hook to manage pending changes across multiple MultilineEditor instances.
 * Now uses the shared PendingChangesContext for consistent state across the app.
 */
export function usePendingChanges(
  config?: PendingChangesConfig
): UsePendingChangesReturn {
  const context = usePendingChangesContext();

  // Update configuration if provided
  if (config) {
    context.updateConfig(config);
  }

  return context;
}
