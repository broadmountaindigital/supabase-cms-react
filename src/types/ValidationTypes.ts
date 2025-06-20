export interface ValidationRule {
  /** Unique identifier for the rule */
  id: string;
  /** Human-readable error message */
  message: string;
  /** Validation function that returns true if valid */
  validate: (value: string) => boolean;
  /** Whether this validation should block saving */
  blockSave?: boolean;
}

export interface ValidationSchema {
  /** Array of validation rules to apply */
  rules: ValidationRule[];
  /** Whether to validate on every keystroke */
  validateOnChange?: boolean;
  /** Whether to validate when losing focus */
  validateOnBlur?: boolean;
  /** Whether to show validation errors inline */
  showInlineErrors?: boolean;
}

export interface ValidationResult {
  /** Whether the value is valid */
  isValid: boolean;
  /** Array of validation errors */
  errors: ValidationError[];
  /** Array of warnings (non-blocking) */
  warnings: ValidationError[];
}

export interface ValidationError {
  /** Rule ID that failed */
  ruleId: string;
  /** Error message to display */
  message: string;
  /** Whether this error blocks saving */
  blockSave: boolean;
}

export interface ConflictDetection {
  /** Last known server timestamp */
  serverTimestamp: string | null;
  /** Whether conflict detection is enabled */
  enabled: boolean;
  /** Custom conflict resolution handler */
  onConflict?: (serverValue: string, localValue: string) => Promise<string>;
}

export interface OfflineConfig {
  /** Whether offline support is enabled */
  enabled: boolean;
  /** Local storage key prefix */
  storageKeyPrefix?: string;
  /** Maximum number of queued changes */
  maxQueueSize?: number;
  /** Sync retry attempts */
  maxRetries?: number;
  /** Sync retry delay in milliseconds */
  retryDelay?: number;
}

export type ValidationMode = 'onChange' | 'onBlur' | 'onSave' | 'manual';
export type ConflictResolutionStrategy =
  | 'server'
  | 'local'
  | 'merge'
  | 'manual';
export type OfflineQueueStatus = 'idle' | 'syncing' | 'error' | 'success';
