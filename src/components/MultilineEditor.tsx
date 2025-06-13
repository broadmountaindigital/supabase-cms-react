import React, { useRef, useState } from 'react';
import type { TextInputProps } from '../types/TextInputProps';
import { useAutosizeTextArea, useSupabaseCMS } from '../hooks';

/**
 * Props for the MultilineEditor component.
 */
export interface MultilineEditorProps extends TextInputProps {
  /** Optional attributes to pass to the underlying textarea element. */
  rest?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
}

/**
 * A multiline text editor component that can be used for inline editing.
 * It renders a textarea when in edit mode, and plain text otherwise.
 */
export default function MultilineEditor(props: MultilineEditorProps) {
  const { isInEditMode } = useSupabaseCMS();

  const {
    defaultValue = '',
    onChange,
    className,
    rest,
    maxLines,
    maxCharacterCount,
  } = props;
  const [value, setValue] = useState(defaultValue);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useAutosizeTextArea(textAreaRef.current, value);

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
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

  return isInEditMode ? (
    <textarea
      ref={textAreaRef}
      value={value}
      onChange={handleChange}
      rows={1}
      className={className}
      style={{ ...resetStyles, ...rest?.style }}
      {...rest}
    />
  ) : (
    <span className={className} style={{ whiteSpace: 'pre-wrap' }}>
      {value}
    </span>
  );
}
