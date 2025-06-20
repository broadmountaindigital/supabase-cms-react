// src/hooks/useAutosizeTextArea.ts
import { useLayoutEffect } from 'react';

const useAutosizeTextArea = (
  textAreaRef: HTMLTextAreaElement | null,
  value: string
) => {
  useLayoutEffect(() => {
    if (textAreaRef) {
      // Add a small delay to ensure the textarea is fully rendered
      const timeoutId = setTimeout(() => {
        // Calculate the number of lines in the value
        const lines = value.split('\n').length;

        // Set the rows attribute based on the number of lines
        // Use a minimum of 1 row and a maximum of 20 rows to prevent excessive height
        const rows = Math.max(1, Math.min(lines, 20));
        textAreaRef.rows = rows;

        // We need to reset the height momentarily to get the correct scrollHeight for the new content
        textAreaRef.style.height = 'auto';
        const scrollHeight = textAreaRef.scrollHeight;

        // We then set the height directly, outside of the render loop
        textAreaRef.style.height = scrollHeight + 'px';
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [textAreaRef, value]);
};

export default useAutosizeTextArea;
