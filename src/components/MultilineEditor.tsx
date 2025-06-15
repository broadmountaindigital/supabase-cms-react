import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { TextInputProps } from '../types/TextInputProps';
import type { SaveState } from '../types/MultilineEditorTypes';
import {
  useAutosizeTextArea,
  useContentFieldsService,
  useSupabaseCMS,
  useDebouncedSave,
} from '../hooks';
import { SkeletonLoader } from './SkeletonLoader';

/**
 * Props for the MultilineEditor component.
 */
export interface MultilineEditorProps
  extends Omit<TextInputProps, 'defaultValue'> {
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
}

/**
 * A multiline text editor component that can be used for inline editing.
 * It renders a textarea when in edit mode, and plain text otherwise.
 * Features debounced saving, optimistic updates, and enhanced loading states.
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
  const [serverValue, setServerValue] = useState(''); // The last known server value
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const prevIsInEditModeRef = useRef(isInEditMode);

  useAutosizeTextArea(textAreaRef.current, value);

  // Save function for debounced saving
  const performSave = useCallback(async () => {
    const hasValueChanged = value !== serverValue;

    if (!hasValueChanged) {
      return;
    }

    setSaveState('saving');
    setError(null);

    try {
      let savedField;

      if (fieldId) {
        // Field exists, so update it
        savedField = await contentFieldsService.update(fieldId, {
          field_value: value,
        });
      } else {
        // Field does not exist, so create it
        savedField = await contentFieldsService.create({
          field_name: fieldName,
          field_value: value,
        });

        if (savedField) {
          setFieldId(savedField.id);
        }
      }

      // Update server value to reflect successful save
      setServerValue(value);
      setSaveState('saved');

      // Auto-hide saved indicator after 2 seconds
      setTimeout(() => {
        setSaveState((current) => (current === 'saved' ? 'idle' : current));
      }, 2000);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error('Failed to save content:', errorMessage);
      setError(`Failed to save: ${errorMessage}`);
      setSaveState('error');
    }
  }, [value, serverValue, fieldId, fieldName, contentFieldsService]);

  // Determine when auto-save should trigger
  const shouldAutoSave = isInEditMode && value !== serverValue;
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

  // Fetch initial value
  useEffect(() => {
    let isMounted = true;

    async function fetchContent() {
      setIsLoading(true);

      try {
        const allFields = await contentFieldsService.getAll();
        const contentField = allFields.find(
          (field) => field.field_name === fieldName
        );

        if (isMounted) {
          const fieldValue = contentField?.field_value ?? defaultValue;
          setValue(fieldValue);
          setServerValue(fieldValue);
          setFieldId(contentField?.id ?? null);
        }
      } catch (e) {
        if (isMounted) {
          const errorMessage =
            e instanceof Error ? e.message : 'Failed to load content';
          setError(errorMessage);
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
  }, [fieldName, contentFieldsService, defaultValue]);

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

    if (onChange) {
      onChange(newValue);
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
            className={className}
            style={{ ...resetStyles, ...rest?.style }}
            {...rest}
          />
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

function renderSaveIndicator(saveState: SaveState) {
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
  };

  const stateConfig = {
    idle: { display: 'none' },
    pending: {
      ...indicatorStyle,
      backgroundColor: '#fef3c7',
      color: '#92400e',
      display: 'block',
    },
    saving: {
      ...indicatorStyle,
      backgroundColor: '#dbeafe',
      color: '#1e40af',
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
    pending: 'Saving...',
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
