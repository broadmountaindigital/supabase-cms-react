import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { TextInputProps } from '../types/TextInputProps';
import type { SaveState } from '../types/MultilineEditorTypes';
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
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  useAutosizeTextArea(textAreaRef.current, value);

  // Simple save function
  const save = useCallback(async () => {
    if (!isMountedRef.current) return;

    console.log('💾 Starting save...', { value, serverValue, fieldId });

    if (value === serverValue) {
      console.log('❌ No changes to save');
      return;
    }

    setSaveState('saving');
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
        setSaveState('saved');
        console.log('✅ Save successful');

        // Auto-hide saved indicator
        setTimeout(() => {
          if (isMountedRef.current) {
            setSaveState('idle');
          }
        }, 2000);
      } else {
        throw new Error('Save returned null');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Save failed';
      console.error('❌ Save failed:', errorMessage);
      setError(errorMessage);
      setSaveState('error');
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
    setSaveState('pending');

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
    setSaveState('saving');
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
        setSaveState('saved');
        setTimeout(() => {
          if (isMountedRef.current) setSaveState('idle');
        }, 2000);
      } else {
        throw new Error('Save returned null');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Save failed';
      setError(errorMessage);
      setSaveState('error');
    }
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
            onChange={handleInput}
            className={className}
            style={{ ...resetStyles, ...rest?.style }}
            {...rest}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={value === serverValue || saveState === 'saving'}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              fontWeight: 500,
            }}
          >
            {saveState === 'saving' ? 'Saving...' : 'Save'}
          </button>
          {showSavingIndicator && renderSaveIndicator(saveState)}
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

function renderSaveIndicator(saveState: SaveState) {
  if (saveState === 'idle') return null;

  const style: React.CSSProperties = {
    position: 'absolute',
    top: '-1.5rem',
    right: '0',
    fontSize: '0.75rem',
    fontWeight: '500',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    zIndex: 10,
  };

  const stateConfig = {
    pending: { ...style, backgroundColor: '#fef3c7', color: '#92400e' },
    saving: { ...style, backgroundColor: '#dbeafe', color: '#1e40af' },
    saved: { ...style, backgroundColor: '#d1fae5', color: '#059669' },
    error: { ...style, backgroundColor: '#fee2e2', color: '#dc2626' },
  };

  const stateText = {
    pending: 'Editing...',
    saving: 'Saving...',
    saved: 'Saved',
    error: 'Error',
  };

  return <div style={stateConfig[saveState]}>{stateText[saveState]}</div>;
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
