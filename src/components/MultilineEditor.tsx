import React, { useEffect, useRef, useState } from 'react';
import type { TextInputProps } from '../types/TextInputProps';
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
import { usePendingChanges } from '../hooks/usePendingChanges';

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
  /** Whether to show individual save indicators */
  showSaveIndicator?: boolean;
}

/**
 * A simplified multiline text editor component that integrates with the global pending changes system.
 */
export default function MultilineEditor(props: MultilineEditorProps) {
  const { isInEditMode } = useSupabaseCMS();
  const contentFieldsService = useContentFieldsService();
  const { addChange, removeChange, onFieldSaved } = usePendingChanges();

  const {
    fieldName,
    defaultValue = '',
    onChange,
    className,
    rest,
    maxLines,
    maxCharacterCount,
    showSaveIndicator = true,
  } = props;

  // State management
  const [fieldId, setFieldId] = useState<string | null>(null);
  const [value, setValue] = useState(defaultValue);
  const [serverValue, setServerValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const isMountedRef = useRef(true);

  // Use the hook with the ref and value
  useAutosizeTextArea(textAreaRef.current, value);

  // Register field-specific save callback
  useEffect(() => {
    const cleanup = onFieldSaved((savedFieldName, savedFieldId, newValue) => {
      // Only update if this is our field
      if (savedFieldName === fieldName) {
        console.log(
          '[MultilineEditor] Save notification for',
          fieldName,
          'id:',
          savedFieldId,
          'newValue:',
          newValue
        );

        // If this was a new field (our fieldId was null but we got a new ID), update our fieldId
        if (fieldId === null && savedFieldId !== null) {
          console.log(
            '[MultilineEditor] Updating fieldId from null to:',
            savedFieldId
          );
          setFieldId(savedFieldId);
        }

        setServerValue(newValue);
        // If we're not in edit mode, also update the display value
        if (!isInEditMode) {
          setValue(newValue);
        }
      }
    });

    return cleanup;
  }, [fieldName, fieldId, isInEditMode, onFieldSaved]);

  useEffect(() => {
    console.log(
      '[MultilineEditor]',
      fieldName,
      'fieldId:',
      fieldId,
      'value:',
      value,
      'serverValue:',
      serverValue
    );
  }, [fieldName, fieldId, value, serverValue]);

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

  // Update pending changes when value changes
  useEffect(() => {
    if (value !== serverValue) {
      // Add or update pending change
      addChange(fieldName, fieldId, value, serverValue);
    } else {
      // Remove pending change if value matches server value
      removeChange(fieldName, fieldId);
    }
  }, [value, serverValue, fieldName, fieldId, addChange, removeChange]);

  // Update pending change registration when fieldId changes (e.g., after new field creation)
  useEffect(() => {
    if (value !== serverValue && fieldId !== null) {
      // Re-register the pending change with the new fieldId
      addChange(fieldName, fieldId, value, serverValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldId]); // Only depend on fieldId changes

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

  // Get the current pending change for this field
  const hasPendingChanges = value !== serverValue;

  if (isLoading) {
    return null;
  }

  return (
    <>
      {isInEditMode ? (
        <span className={className + ' bmscms:relative'}>
          <textarea
            ref={textAreaRef}
            value={value}
            onChange={handleInput}
            rows={1}
            className={[
              'bmscms:border-none bmscms:outline-none bmscms:transparent bmscms:p-0 bmscms:m-0 bmscms:resize-none bmscms:w-full bmscms:overflow-hidden bmscms:box-border bmscms:block bmscms:text-inherit bmscms:font-inherit bmscms:field-sizing-content',
            ]
              .filter(Boolean)
              .join(' ')}
            style={rest?.style}
            {...rest}
          />
        </span>
      ) : (
        <span
          className={[className, 'bmscms:relative'].filter(Boolean).join(' ')}
        >
          <span className="bmscms:whitespace-pre-wrap">{value}</span>
        </span>
      )}

      {/* Pending indicator - shows regardless of edit mode */}
      {showSaveIndicator && hasPendingChanges && (
        <div className="bmscms:absolute bmscms:top-[-1.5rem] bmscms:right-0 bmscms:flex bmscms:flex-row bmscms:items-center bmscms:justify-end bmscms:flex-nowrap bmscms:w-full bmscms:gap-2 bmscms:z-10">
          <span className="bmscms:text-xs bmscms:font-medium bmscms:px-2 bmscms:py-1 bmscms:rounded bmscms:bg-amber-100 bmscms:text-amber-800">
            Pending
          </span>
        </div>
      )}

      {error && renderErrorMessage(error)}
    </>
  );
}

function renderErrorMessage(error: string) {
  return (
    <span className="bmscms:text-red-600 bmscms:text-sm bmscms:mt-2 bmscms:p-2 bmscms:bg-red-100 bmscms:rounded bmscms:border bmscms:border-red-200">
      {error}
    </span>
  );
}
