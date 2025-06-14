import React, { useEffect, useRef, useState } from 'react';
import type { TextInputProps } from '../types/TextInputProps';
import {
  useAutosizeTextArea,
  useContentFieldsService,
  useSupabaseCMS,
} from '../hooks';

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
}

/**
 * A multiline text editor component that can be used for inline editing.
 * It renders a textarea when in edit mode, and plain text otherwise.
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
  } = props;

  const [fieldId, setFieldId] = useState<string | null>(null);
  const [value, setValue] = useState(defaultValue);
  const [originalValue, setOriginalValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const prevIsInEditModeRef = useRef(isInEditMode);

  useAutosizeTextArea(textAreaRef.current, value);

  // Fetch initial value
  useEffect(() => {
    let isMounted = true;
    async function fetchContent() {
      setIsLoading(true);
      const allFields = await contentFieldsService.getAll();
      const contentField = allFields.find(
        (field) => field.field_name === fieldName
      );
      if (isMounted) {
        if (contentField) {
          setValue(contentField.field_value ?? '');
          setOriginalValue(contentField.field_value ?? '');
          setFieldId(contentField.id);
        } else {
          // If no field is found, use the default value
          setValue(defaultValue);
          setOriginalValue(defaultValue);
        }
        setIsLoading(false);
      }
    }
    fetchContent();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldName, contentFieldsService]);

  // Save value on exiting edit mode
  useEffect(() => {
    async function saveContent() {
      if (
        prevIsInEditModeRef.current &&
        !isInEditMode &&
        value !== originalValue
      ) {
        setError(null);
        try {
          if (fieldId) {
            // Field exists, so update it
            await contentFieldsService.update(fieldId, { field_value: value });
          } else {
            // Field does not exist, so create it
            const newField = await contentFieldsService.create({
              field_name: fieldName,
              field_value: value,
            });
            if (newField) {
              setFieldId(newField.id); // Store the new ID for future updates
            }
          }
          setOriginalValue(value); // Update original value after a successful save
        } catch (e) {
          const errorMessage =
            e instanceof Error ? e.message : 'An unknown error occurred.';
          console.error('Failed to save content:', errorMessage);
          setError(`Failed to save: ${errorMessage}`);
          // Optional: revert value to originalValue on error
          // setValue(originalValue);
        }
      }
    }
    saveContent();
    prevIsInEditModeRef.current = isInEditMode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInEditMode, value, originalValue, fieldId, contentFieldsService]);

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
    overflow: 'hidden', // Hide scrollbar
    boxSizing: 'border-box',
    display: 'block',
  };

  if (isLoading) {
    return <span className={className}>Loading...</span>;
  }

  return (
    <>
      {isInEditMode ? (
        <textarea
          ref={textAreaRef}
          value={value}
          onChange={onFieldInput}
          className={className}
          style={{ ...resetStyles, ...rest?.style }}
          {...rest}
        />
      ) : (
        <span className={className} style={{ whiteSpace: 'pre-wrap' }}>
          {value}
        </span>
      )}
      {error && (
        <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          {error}
        </div>
      )}
    </>
  );
}
