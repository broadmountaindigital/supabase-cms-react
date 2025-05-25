import React, { useState } from 'react';
import type { TextInputProps } from '../types/TextInputProps';

interface MultilineTextProps extends TextInputProps {
  rest?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
}

export default function MultilineText(props: MultilineTextProps) {
  const {
    defaultValue = '',
    onChange,
    className,
    rest,
    maxLines,
    maxCharacterCount,
  } = props;
  const [value, setValue] = useState(defaultValue);

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

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    const isEnter = event.key === 'Enter';
    const isPrintable = event.key.length === 1;
    const lineCount = value.split('\n').length;
    const charCount = value.length;

    if (typeof maxLines === 'number' && isEnter && lineCount >= maxLines) {
      console.log(`Cannot add more than ${maxLines} lines.`);
      event.preventDefault();
      return;
    }

    if (
      typeof maxCharacterCount === 'number' &&
      isPrintable &&
      charCount >= maxCharacterCount
    ) {
      console.log(`Cannot add more than ${maxCharacterCount} characters.`);
      event.preventDefault();
    }
  }

  const lineCount = value.split('\n').length;
  const rows = Math.max(
    1,
    typeof maxLines === 'number' ? Math.min(lineCount, maxLines) : lineCount
  );

  return (
    <textarea
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className={className}
      rows={rows}
      {...rest}
    />
  );
}
