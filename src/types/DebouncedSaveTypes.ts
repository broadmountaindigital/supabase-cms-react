export interface UseDebouncedSaveOptions {
  /** Debounce delay in milliseconds */
  delay?: number;
  /** Function to call when saving */
  onSave: () => Promise<void>;
  /** Whether saving should be triggered */
  shouldSave: boolean;
  /** Force immediate save (bypasses debounce) */
  forceImmediate?: boolean;
}

export interface UseDebouncedSaveReturn {
  /** Whether a save operation is currently pending */
  isPending: boolean;
  /** Whether a save operation is currently in progress */
  isSaving: boolean;
  /** Manually trigger save (bypasses debounce) */
  triggerSave: () => Promise<void>;
  /** Cancel pending save operation */
  cancelPendingSave: () => void;
}
