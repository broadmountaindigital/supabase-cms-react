export interface TextInputProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  maxLines?: number;
  maxCharacterCount?: number;
}
