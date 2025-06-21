/**
 * Represents a pending change to a content field
 */
export interface PendingChange {
  /** Unique identifier for this change */
  id: string;
  /** The field name being changed */
  fieldName: string;
  /** The field ID (null if creating new field) */
  fieldId: string | null;
  /** The new value */
  newValue: string;
  /** The original value for comparison */
  originalValue: string;
  /** Timestamp when the change was made */
  timestamp: number;
  /** Whether this is a new field creation */
  isNewField: boolean;
  /** Status of the change */
  status: 'pending' | 'saving' | 'saved' | 'error';
  /** Error message if status is 'error' */
  error?: string;
}

/**
 * Configuration for the pending changes service
 */
export interface PendingChangesConfig {
  /** Whether to auto-save changes after a delay */
  autoSave?: boolean;
  /** Delay in milliseconds before auto-saving (default: 2000ms) */
  autoSaveDelay?: number;
  /** Whether to show save indicators on individual fields */
  showIndividualIndicators?: boolean;
  /** Whether to batch save all changes together */
  batchSave?: boolean;
}

/**
 * Result of a save operation
 */
export interface SaveResult {
  /** Whether the save was successful */
  success: boolean;
  /** Number of changes saved */
  savedCount: number;
  /** Number of changes that failed */
  failedCount: number;
  /** Array of failed changes with error messages */
  failures: Array<{
    fieldName: string;
    error: string;
  }>;
  /** Total time taken for the save operation */
  duration: number;
}

/**
 * Callback functions for the pending changes service
 */
export interface PendingChangesCallbacks {
  /** Called when changes are added */
  onChangesAdded?: (changes: PendingChange[]) => void;
  /** Called when changes are saved */
  onChangesSaved?: (result: SaveResult) => void;
  /** Called when changes are cleared */
  onChangesCleared?: () => void;
  /** Called when there's an error */
  onError?: (error: string) => void;
  /** Called when a specific field's change is saved */
  onFieldSaved?: (
    fieldName: string,
    fieldId: string | null,
    newValue: string
  ) => void;
}
