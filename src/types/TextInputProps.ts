export interface TextInputProps {
  fieldName: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  maxLines?: number;
  maxCharacterCount?: number;
  activeEditorClassName?: string;
}
