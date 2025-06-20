import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { TextInputProps } from '../types/TextInputProps';
import { SaveState } from '../types/MultilineEditorTypes';
import type {
  ValidationSchema,
  ConflictDetection,
  OfflineConfig,
  ConflictResolutionStrategy,
} from '../types/ValidationTypes';
import type { RevisionEnabledProps } from '../types/RevisionTypes';
import {
  useAutosizeTextArea,
  useContentFieldsService,
  useSupabaseCMS,
} from '../hooks';
import { SkeletonLoader } from './SkeletonLoader';
import { EditorButton } from './EditorButton';

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
 * A simplified multiline text editor component with debounced saving.
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
  } = props;

  // State management
  const [fieldId, setFieldId] = useState<string | null>(null);
  const [value, setValue] = useState(defaultValue);
  const [serverValue, setServerValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>(SaveState.Idle);
  const [error, setError] = useState<string | null>(null);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Use the hook with the ref and value
  useAutosizeTextArea(textAreaRef.current, value);

  // Ensure textarea is properly sized when switching to edit mode
  useEffect(() => {
    if (isInEditMode && textAreaRef.current) {
      // Force a re-calculation of the textarea size
      const textarea = textAreaRef.current;
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = scrollHeight + 'px';
    }
  }, [isInEditMode, value]);

  // Simple save function
  const save = useCallback(async () => {
    if (!isMountedRef.current) return;

    console.log('💾 Starting save...', { value, serverValue, fieldId });

    if (value === serverValue) {
      console.log('❌ No changes to save');
      return;
    }

    setSaveState(SaveState.Saving);
    setError(null);

    try {
      let savedField;

      if (fieldId) {
        // Update existing field
        console.log('📝 Updating field:', fieldId);
        savedField = await contentFieldsService.update(fieldId, {
          field_value: value,
        });
      } else {
        // Create new field
        console.log('➕ Creating new field:', fieldName);
        savedField = await contentFieldsService.create({
          field_name: fieldName,
          field_value: value,
        });

        if (savedField) {
          setFieldId(savedField.id);
        }
      }

      if (savedField) {
        setServerValue(value);
        setSaveState(SaveState.Saved);
        console.log('✅ Save successful');

        // Auto-hide saved indicator
        setTimeout(() => {
          if (isMountedRef.current) {
            setSaveState(SaveState.Idle);
          }
        }, 2000);
      } else {
        throw new Error('Save returned null');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Save failed';
      console.error('❌ Save failed:', errorMessage);
      setError(errorMessage);
      setSaveState(SaveState.Error);
    }
  }, [value, serverValue, fieldId, fieldName, contentFieldsService]);

  // Debounced save effect
  useEffect(() => {
    if (!isInEditMode || value === serverValue) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set pending state
    setSaveState(SaveState.Pending);

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      save();
    }, debounceDelay);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [value, serverValue, isInEditMode, debounceDelay, save]);

  // Load initial content
  useEffect(() => {
    let isMounted = true;

    async function loadContent() {
      setIsLoading(true);

      try {
        const allFields = await contentFieldsService.getAll();
        const field = allFields.find((f) => f.field_name === fieldName);

        if (isMounted) {
          const fieldValue = field?.field_value ?? defaultValue;
          setValue(fieldValue);
          setServerValue(fieldValue);
          setFieldId(field?.id ?? null);
        }
      } catch (e) {
        if (isMounted) {
          const errorMessage =
            e instanceof Error ? e.message : 'Failed to load';
          setError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      isMounted = false;
    };
  }, [fieldName, contentFieldsService, defaultValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  function handleInput(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const newValue = event.target.value;
    const lineCount = newValue.split('\n').length;
    const charCount = newValue.length;

    const exceedsMaxLines =
      typeof maxLines === 'number' && lineCount > maxLines;
    const exceedsMaxChars =
      typeof maxCharacterCount === 'number' && charCount > maxCharacterCount;

    if (exceedsMaxLines || exceedsMaxChars) {
      return;
    }

    setValue(newValue);

    if (onChange) {
      onChange(newValue);
    }
  }

  async function handleSave() {
    setSaveState(SaveState.Saving);
    setError(null);
    try {
      let savedField;
      if (fieldId) {
        savedField = await contentFieldsService.update(fieldId, {
          field_value: value,
        });
      } else {
        savedField = await contentFieldsService.create({
          field_name: fieldName,
          field_value: value,
        });
        if (savedField) {
          setFieldId(savedField.id);
        }
      }
      if (savedField) {
        setServerValue(value);
        setSaveState(SaveState.Saved);
        setTimeout(() => {
          if (isMountedRef.current) setSaveState(SaveState.Idle);
        }, 2000);
      } else {
        throw new Error('Save returned null');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Save failed';
      setError(errorMessage);
      setSaveState(SaveState.Error);
    }
  }

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
        <div className="bmscms:relative">
          <textarea
            ref={textAreaRef}
            value={value}
            onChange={handleInput}
            rows={1}
            className={[
              className,
              'bmscms:border-none bmscms:outline-none bmscms:bg-transparent bmscms:p-0 bmscms:m-0 bmscms:resize-none bmscms:w-full bmscms:overflow-hidden bmscms:box-border bmscms:block bmscms:text-inherit bmscms:font-inherit bmscms:field-sizing-content',
            ]
              .filter(Boolean)
              .join(' ')}
            style={rest?.style}
            {...rest}
          />
          {showSavingIndicator && (
            <div className="bmscms:absolute bmscms:top-[-1.5rem] bmscms:right-0 bmscms:flex bmscms:flex-row bmscms:items-center bmscms:justify-end bmscms:flex-nowrap bmscms:w-full bmscms:gap-2 bmscms:z-10">
              {renderSaveIndicator(saveState)}
              {(() => {
                const showSaveButton =
                  value !== serverValue && saveState !== SaveState.Saving;
                const saveButtonDisabled =
                  saveState === SaveState.Saving ||
                  saveState === SaveState.Saved;
                return showSaveButton ? (
                  <EditorButton
                    onClick={handleSave}
                    disabled={saveButtonDisabled}
                  >
                    Save
                  </EditorButton>
                ) : null;
              })()}
            </div>
          )}
        </div>
      ) : (
        <span
          className={[className, 'bmscms:whitespace-pre-wrap']
            .filter(Boolean)
            .join(' ')}
        >
          {value}
        </span>
      )}
      {error && renderErrorMessage(error)}
    </>
  );
}

function renderSaveIndicator(saveState: SaveState) {
  if (saveState === SaveState.Idle) return null;

  const stateConfig = {
    [SaveState.Pending]:
      'bmscms:text-xs bmscms:font-medium bmscms:px-2 bmscms:py-1 bmscms:rounded bmscms:bg-amber-100 bmscms:text-amber-800',
    [SaveState.Saving]:
      'bmscms:text-xs bmscms:font-medium bmscms:px-2 bmscms:py-1 bmscms:rounded bmscms:bg-blue-100 bmscms:text-blue-900',
    [SaveState.Saved]:
      'bmscms:text-xs bmscms:font-medium bmscms:px-2 bmscms:py-1 bmscms:rounded bmscms:bg-emerald-100 bmscms:text-emerald-600',
    [SaveState.Error]:
      'bmscms:text-xs bmscms:font-medium bmscms:px-2 bmscms:py-1 bmscms:rounded bmscms:bg-red-100 bmscms:text-red-600',
  };
  const stateText = {
    [SaveState.Pending]: 'Editing...',
    [SaveState.Saving]: 'Saving...',
    [SaveState.Saved]: 'Saved',
    [SaveState.Error]: 'Error',
  };
  return <span className={stateConfig[saveState]}>{stateText[saveState]}</span>;
}

function renderErrorMessage(error: string) {
  return (
    <div className="bmscms:text-red-600 bmscms:text-sm bmscms:mt-2 bmscms:p-2 bmscms:bg-red-100 bmscms:rounded bmscms:border bmscms:border-red-200">
      {error}
    </div>
  );
}
