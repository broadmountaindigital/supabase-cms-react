import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { TextInputProps } from '../types/TextInputProps';
import type { SaveState } from '../types/MultilineEditorTypes';
import type {
  ValidationSchema,
  ValidationError,
  ConflictDetection,
  OfflineConfig,
  ConflictResolutionStrategy,
} from '../types/ValidationTypes';
import type { RevisionEnabledProps } from '../types/RevisionTypes';
import {
  useAutosizeTextArea,
  useContentFieldsService,
  useSupabaseCMS,
  useDebouncedSave,
  useValidation,
  useConflictDetection,
  useOfflineSupport,
} from '../hooks';
import { SkeletonLoader } from './SkeletonLoader';

// Helper interfaces for hook return types
interface OfflineState {
  isOnline: boolean;
  hasUnsynced: boolean;
}

interface ValidationHook {
  errors: ValidationError[];
}

interface ConflictState {
  hasConflict: boolean;
}

/**
 * Props for the MultilineEditor component.
 */
export interface MultilineEditorProps
  extends Omit<TextInputProps, 'defaultValue'>,
    RevisionEnabledProps {
  /** The unique name of the content field to be fetched and updated. */
  fieldName: string;
  /** An optional default value to display and use when creating a new field. */
  defaultValue?: string;
  /** Optional attributes to pass to the underlying textarea element. */
  rest?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  /** Debounce delay in milliseconds for auto-saving (default: 1000ms) */
  debounceDelay?: number;
  /** Whether to show saving indicators */
  showSavingIndicator?: boolean;
  /** Custom loading component props */
  loadingProps?: {
    lines?: number;
    lineHeight?: string;
    width?: string | string[];
  };
  /** Validation schema for field validation */
  validation?: ValidationSchema;
  /** Conflict detection configuration */
  conflictDetection?: ConflictDetection;
  /** Offline support configuration */
  offlineConfig?: OfflineConfig;
  /** Default conflict resolution strategy */
  conflictResolutionStrategy?: ConflictResolutionStrategy;
}

/**
 * A multiline text editor component that can be used for inline editing.
 * It renders a textarea when in edit mode, and plain text otherwise.
 * Features debounced saving, optimistic updates, enhanced loading states,
 * validation, conflict detection, and offline support.
 */
export default function MultilineEditor(props: MultilineEditorProps) {
  const { isInEditMode } = useSupabaseCMS();
  const contentFieldsService = useContentFieldsService();

  const {
    fieldName,
    defaultValue = '',
    onChange,
    className,
    rest,
    maxLines,
    maxCharacterCount,
    debounceDelay = 1000,
    showSavingIndicator = true,
    loadingProps = {},
    validation,
    conflictDetection,
    offlineConfig,
    conflictResolutionStrategy = 'server',
    // Revision props (to be implemented in Phase 2)
    enableRevisions = false,
    revisionConfig,
    onRevisionCreated,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onRevisionPublished,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onRevisionConflict,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    showRevisionStatus = false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    allowRollback = false,
  } = props;

  // State management
  const [fieldId, setFieldId] = useState<string | null>(null);
  const [value, setValue] = useState(defaultValue);
  const [serverValue, setServerValue] = useState('');
  const [serverTimestamp, setServerTimestamp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const prevIsInEditModeRef = useRef(isInEditMode);

  // Phase 3 hooks
  const validationHook = useValidation(validation, value);
  const conflictHook = useConflictDetection(conflictDetection);
  const offlineHook = useOfflineSupport(
    offlineConfig || { enabled: false },
    handleOfflineSync
  );

  useAutosizeTextArea(textAreaRef.current, value);

  // Save function for debounced saving with Phase 3 features
  const performSave = useCallback(async () => {
    const hasValueChanged = value !== serverValue;

    if (!hasValueChanged) {
      return;
    }

    // Validate before saving if validation is enabled
    if (validation) {
      const validationResult = validationHook.validate(value, 'onSave');
      if (validationResult.errors.length > 0) {
        setError(`Validation failed: ${validationResult.errors[0].message}`);
        setSaveState('error');
        return;
      }
    }

    setSaveState('saving');
    setError(null);

    try {
      // Check for conflicts if enabled
      if (conflictDetection?.enabled && serverTimestamp) {
        const currentServerData = await fetchCurrentServerData();
        if (
          currentServerData &&
          conflictHook.checkForConflict(
            value,
            currentServerData.value,
            currentServerData.timestamp
          )
        ) {
          // Handle conflict
          const resolvedValue = await conflictHook.resolveConflict(
            conflictResolutionStrategy
          );
          setValue(resolvedValue);
          setServerValue(resolvedValue);
          setSaveState('saved');
          return;
        }
      }

      let savedField;

      // Prepare revision config if revisions are enabled
      const revisionEnabled = enableRevisions && revisionConfig;
      const revisionOptions = revisionEnabled
        ? {
            enabled: true,
            createdBy: revisionConfig.auto_create ? 'system' : undefined,
            metadata: {
              fieldName,
              timestamp: new Date().toISOString(),
            },
          }
        : undefined;

      if (fieldId) {
        // Field exists, so update it (with optional revision tracking)
        savedField = revisionOptions
          ? await contentFieldsService.updateWithRevisions(
              fieldId,
              {
                field_value: value,
              },
              revisionOptions
            )
          : await contentFieldsService.update(fieldId, {
              field_value: value,
            });
      } else {
        // Field does not exist, so create it (with optional revision tracking)
        const fieldData = {
          field_name: fieldName,
          field_value: value,
        };

        savedField = revisionOptions
          ? await contentFieldsService.createWithRevisions(
              fieldData,
              revisionOptions
            )
          : await contentFieldsService.create(fieldData);

        if (savedField) {
          setFieldId(savedField.id);
        }
      }

      // Update server value and timestamp to reflect successful save
      setServerValue(value);
      if (savedField?.updated_at) {
        setServerTimestamp(savedField.updated_at);
        conflictHook.updateServerTimestamp(savedField.updated_at);
      }

      setSaveState('saved');

      // Call revision callback if provided
      if (enableRevisions && onRevisionCreated && savedField) {
        try {
          const currentRevision = await contentFieldsService.getCurrentRevision(
            savedField.id
          );
          if (currentRevision) {
            onRevisionCreated(currentRevision);
          }
        } catch (error) {
          console.error('Error fetching current revision:', error);
        }
      }

      // Auto-hide saved indicator after 2 seconds
      setTimeout(() => {
        setSaveState((current) => (current === 'saved' ? 'idle' : current));
      }, 2000);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error('Failed to save content:', errorMessage);

      // Queue for offline if configured
      if (offlineConfig?.enabled && !navigator.onLine) {
        offlineHook.queueChange(fieldName, value);
        setSaveState('saved'); // Show as saved since it's queued
      } else {
        setError(`Failed to save: ${errorMessage}`);
        setSaveState('error');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    value,
    serverValue,
    fieldId,
    fieldName,
    contentFieldsService,
    validation,
    validationHook,
    conflictDetection,
    conflictHook,
    serverTimestamp,
    conflictResolutionStrategy,
    offlineConfig,
    offlineHook,
    enableRevisions,
    revisionConfig,
    onRevisionCreated,
  ]);

  // Determine when auto-save should trigger
  const shouldAutoSave =
    isInEditMode && value !== serverValue && validationHook.isValid;
  const forceImmediate = prevIsInEditModeRef.current && !isInEditMode;

  // Debounced saving
  const { isPending, isSaving } = useDebouncedSave({
    delay: debounceDelay,
    onSave: performSave,
    shouldSave: shouldAutoSave,
    forceImmediate,
  });

  // Update save state based on debounced save status
  useEffect(() => {
    const newSaveState = determineCurrentSaveState(isPending, isSaving, error);
    setSaveState(newSaveState);
  }, [isPending, isSaving, error]);

  // Fetch initial value with offline fallback
  useEffect(() => {
    let isMounted = true;

    async function fetchContent() {
      setIsLoading(true);

      try {
        // Check offline storage first
        const offlineValue = offlineHook.getStoredValue(fieldName);

        if (offlineValue && !navigator.onLine) {
          setValue(offlineValue);
          setServerValue(defaultValue); // Server value unknown when offline
          setIsLoading(false);
          return;
        }

        const allFields = await contentFieldsService.getAll();
        const contentField = allFields.find(
          (field) => field.field_name === fieldName
        );

        if (isMounted) {
          const fieldValue = contentField?.field_value ?? defaultValue;
          const timestamp = contentField?.updated_at ?? null;

          setValue(fieldValue);
          setServerValue(fieldValue);
          setFieldId(contentField?.id ?? null);
          setServerTimestamp(timestamp);

          if (timestamp) {
            conflictHook.updateServerTimestamp(timestamp);
          }
        }
      } catch (e) {
        if (isMounted) {
          const errorMessage =
            e instanceof Error ? e.message : 'Failed to load content';

          // Try offline fallback on error
          const offlineValue = offlineHook.getStoredValue(fieldName);
          if (offlineValue) {
            setValue(offlineValue);
            setServerValue(defaultValue);
          } else {
            setError(errorMessage);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchContent();

    return () => {
      isMounted = false;
    };
  }, [
    fieldName,
    contentFieldsService,
    defaultValue,
    offlineHook,
    conflictHook,
  ]);

  // Track edit mode changes
  useEffect(() => {
    prevIsInEditModeRef.current = isInEditMode;
  }, [isInEditMode]);

  function onFieldInput(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const newValue = event.target.value;
    const lineCount = newValue.split('\n').length;
    const charCount = newValue.length;

    const exceedsMaxLines =
      typeof maxLines === 'number' && lineCount > maxLines;
    const exceedsMaxChars =
      typeof maxCharacterCount === 'number' && charCount > maxCharacterCount;

    if (exceedsMaxLines) {
      console.log(`Input exceeds the maximum allowed lines (${maxLines}).`);
      return;
    }

    if (exceedsMaxChars) {
      console.log(
        `Input exceeds the maximum allowed characters (${maxCharacterCount}).`
      );
      return;
    }

    // Optimistic update
    setValue(newValue);

    // Validate on change if configured
    if (validation?.validateOnChange) {
      validationHook.validate(newValue, 'onChange');
    }

    if (onChange) {
      onChange(newValue);
    }
  }

  function onFieldBlur() {
    // Validate on blur if configured
    if (validation?.validateOnBlur) {
      validationHook.validate(value, 'onBlur');
    }
  }

  // Helper function to fetch current server data for conflict detection
  async function fetchCurrentServerData(): Promise<{
    value: string;
    timestamp: string;
  } | null> {
    try {
      if (!fieldId) return null;

      const field = await contentFieldsService.getById(fieldId);
      if (field) {
        return {
          value: field.field_value || '',
          timestamp: field.updated_at,
        };
      }
    } catch (error) {
      console.error('Failed to fetch current server data:', error);
    }
    return null;
  }

  // Handle offline sync
  async function handleOfflineSync(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _fieldName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _value: string
  ): Promise<void> {
    // This will be called by the offline hook to sync changes
    await performSave();
  }

  const resetStyles: React.CSSProperties = {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    resize: 'none',
    font: 'inherit',
    color: 'inherit',
    width: '100%',
    overflow: 'hidden',
    boxSizing: 'border-box',
    display: 'block',
  };

  // Enhanced loading state
  if (isLoading) {
    return (
      <SkeletonLoader
        className={className}
        lines={loadingProps.lines || 1}
        lineHeight={loadingProps.lineHeight || '1.2em'}
        width={loadingProps.width || '100%'}
      />
    );
  }

  return (
    <>
      {isInEditMode ? (
        <div style={{ position: 'relative' }}>
          <textarea
            ref={textAreaRef}
            value={value}
            onChange={onFieldInput}
            onBlur={onFieldBlur}
            className={className}
            style={{ ...resetStyles, ...rest?.style }}
            {...rest}
          />
          {showSavingIndicator &&
            renderSaveIndicator(saveState, offlineHook.offlineState)}
          {renderValidationErrors(validationHook)}
          {renderConflictNotification(conflictHook.conflictState)}
        </div>
      ) : (
        <span className={className} style={{ whiteSpace: 'pre-wrap' }}>
          {value}
        </span>
      )}
      {error && renderErrorMessage(error)}
    </>
  );
}

// Helper functions following declarative approach
function determineCurrentSaveState(
  isPending: boolean,
  isSaving: boolean,
  error: string | null
): SaveState {
  if (error) return 'error';
  if (isSaving) return 'saving';
  if (isPending) return 'pending';
  return 'idle';
}

function renderSaveIndicator(saveState: SaveState, offlineState: OfflineState) {
  const indicatorStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-1.5rem',
    right: '0',
    fontSize: '0.75rem',
    fontWeight: '500',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    transition: 'all 0.2s ease-in-out',
    pointerEvents: 'none',
    zIndex: 10,
  };

  // Determine state and color based on online/offline status
  const isOffline = !offlineState.isOnline;
  const hasQueuedChanges = offlineState.hasUnsynced;

  const stateConfig = {
    idle: { display: 'none' },
    pending: {
      ...indicatorStyle,
      backgroundColor: isOffline ? '#f59e0b' : '#fef3c7',
      color: isOffline ? '#ffffff' : '#92400e',
      display: 'block',
    },
    saving: {
      ...indicatorStyle,
      backgroundColor: isOffline ? '#f59e0b' : '#dbeafe',
      color: isOffline ? '#ffffff' : '#1e40af',
      display: 'block',
    },
    saved: {
      ...indicatorStyle,
      backgroundColor: '#d1fae5',
      color: '#059669',
      display: 'block',
    },
    error: {
      ...indicatorStyle,
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      display: 'block',
    },
  };

  const stateText = {
    idle: '',
    pending: isOffline ? 'Queued' : 'Saving...',
    saving: isOffline ? 'Queued' : 'Saving...',
    saved: hasQueuedChanges ? 'Queued' : 'Saved',
    error: 'Error',
  };

  return (
    <div style={stateConfig[saveState]}>
      {stateText[saveState]}
      {isOffline && <span style={{ marginLeft: '0.25rem' }}>📱</span>}
    </div>
  );
}

function renderValidationErrors(validationHook: ValidationHook) {
  if (!validationHook.errors.length) return null;

  const errorStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '0.25rem',
    padding: '0.5rem',
    fontSize: '0.75rem',
    color: '#dc2626',
    zIndex: 10,
    marginTop: '0.25rem',
  };

  return (
    <div style={errorStyle}>
      {validationHook.errors.map((error: ValidationError, index: number) => (
        <div key={index}>{error.message}</div>
      ))}
    </div>
  );
}

function renderConflictNotification(conflictState: ConflictState) {
  if (!conflictState.hasConflict) return null;

  const conflictStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    backgroundColor: '#fef3c7',
    border: '1px solid #fed7aa',
    borderRadius: '0.25rem',
    padding: '0.5rem',
    fontSize: '0.75rem',
    color: '#92400e',
    zIndex: 10,
    marginTop: '0.25rem',
  };

  return (
    <div style={conflictStyle}>
      ⚠️ Content was modified by another user. Changes have been merged.
    </div>
  );
}

function renderErrorMessage(error: string) {
  const errorStyle: React.CSSProperties = {
    color: '#dc2626',
    fontSize: '0.8rem',
    marginTop: '0.5rem',
    padding: '0.5rem',
    backgroundColor: '#fee2e2',
    borderRadius: '0.25rem',
    border: '1px solid #fecaca',
  };

  return <div style={errorStyle}>{error}</div>;
}
