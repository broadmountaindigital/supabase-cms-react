import { usePendingChanges } from '../hooks/usePendingChanges';
import { EditorButton } from './EditorButton';
import type { SaveResult } from '../types/PendingChangesTypes';

export interface GlobalSaveButtonProps {
  /** CSS class names for styling */
  classNames?: {
    container?: string;
    button?: string;
    indicator?: string;
    error?: string;
  };
  /** Custom text for the save button */
  saveText?: string;
  /** Custom text for the saving state */
  savingText?: string;
  /** Whether to show the change count */
  showChangeCount?: boolean;
  /** Whether to show error messages */
  showErrors?: boolean;
  /** Callback when save is successful */
  onSaveSuccess?: (result: SaveResult) => void;
  /** Callback when save fails */
  onSaveError?: (result: SaveResult | { error: string }) => void;
}

/**
 * Global save button component that appears when there are pending changes
 */
export default function GlobalSaveButton({
  classNames = {},
  saveText = 'Save Changes',
  savingText = 'Saving...',
  showChangeCount = true,
  showErrors = true,
  onSaveSuccess,
  onSaveError,
}: GlobalSaveButtonProps) {
  const {
    hasChanges,
    changeCount,
    isSaving,
    saveAll,
    lastSaveResult,
    getErrorChanges,
  } = usePendingChanges();

  // Debug logging
  console.log('[GlobalSaveButton] render', {
    hasChanges,
    changeCount,
    isSaving,
  });

  const handleSave = async () => {
    try {
      const result = await saveAll();
      if (result.success) {
        onSaveSuccess?.(result);
      } else {
        onSaveError?.(result);
      }
    } catch (error) {
      onSaveError?.({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Don't render if no changes
  if (!hasChanges && !isSaving) {
    return null;
  }

  const errorChanges = getErrorChanges();
  const hasErrors = errorChanges.length > 0;

  return (
    <div
      className={
        classNames.container ||
        'bmscms:fixed bmscms:bottom-4 bmscms:right-4 bmscms:z-50'
      }
    >
      <div className="bmscms:flex bmscms:flex-col bmscms:gap-2 bmscms:items-end">
        {/* Error messages */}
        {showErrors && hasErrors && (
          <div
            className={
              classNames.error ||
              'bmscms:bg-red-100 bmscms:border bmscms:border-red-300 bmscms:rounded-lg bmscms:p-3 bmscms:max-w-sm'
            }
          >
            <div className="bmscms:text-red-800 bmscms:font-medium bmscms:mb-2">
              Save Errors ({errorChanges.length})
            </div>
            {errorChanges.map((change) => (
              <div
                key={change.id}
                className="bmscms:text-red-700 bmscms:text-sm bmscms:mb-1"
              >
                <strong>{change.fieldName}:</strong> {change.error}
              </div>
            ))}
          </div>
        )}

        {/* Save button */}
        <div className="bmscms:flex bmscms:flex-row bmscms:items-center bmscms:gap-3">
          {/* Change count indicator */}
          {showChangeCount && changeCount > 0 && (
            <div
              className={
                classNames.indicator ||
                'bmscms:bg-blue-100 bmscms:text-blue-800 bmscms:px-3 bmscms:py-2 bmscms:rounded-lg bmscms:text-sm bmscms:font-medium'
              }
            >
              {changeCount} change{changeCount !== 1 ? 's' : ''} pending
            </div>
          )}

          {/* Save button */}
          <EditorButton
            onClick={handleSave}
            disabled={isSaving}
            className={
              classNames.button ||
              'bmscms:bg-blue-600 bmscms:hover:bg-blue-700 bmscms:text-white bmscms:px-4 bmscms:py-2 bmscms:rounded-lg bmscms:font-medium bmscms:shadow-lg'
            }
          >
            {isSaving ? savingText : saveText}
          </EditorButton>
        </div>

        {/* Success message */}
        {lastSaveResult?.success && lastSaveResult.savedCount > 0 && (
          <div className="bmscms:bg-green-100 bmscms:border bmscms:border-green-300 bmscms:rounded-lg bmscms:px-3 bmscms:py-2 bmscms:text-green-800 bmscms:text-sm bmscms:font-medium">
            ✅ Saved {lastSaveResult.savedCount} change
            {lastSaveResult.savedCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
