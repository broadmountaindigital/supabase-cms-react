import type { RevisionEnabledProps } from './RevisionTypes';

/**
 * Props for the ImageUpload component.
 */
export interface ImageUploadProps extends RevisionEnabledProps {
  /** The unique name of the content field to be fetched and updated. */
  fieldName: string;
  /** Optional initial value if no server value exists. */
  defaultValue?: string;

  /**
   * Supabase Storage bucket to upload into. Defaults to "images".
   */
  bucket?: string;
  /**
   * Optional folder/prefix inside the bucket. If omitted, the active site id is used when available.
   */
  folder?: string;

  /** Called when the field value (image URL) changes locally. */
  onChange?: (url: string) => void;
  /** Called right before an upload begins. */
  onUploadStart?: (file: File) => void;
  /** Called when an upload completes successfully. */
  onUploadSuccess?: (url: string, path: string) => void;
  /** Called if an upload fails. */
  onUploadError?: (error: string) => void;

  /** Accept attribute for the file input. */
  accept?: string;
  /** Max file size in megabytes. */
  maxFileSizeMB?: number;

  /** Optional attributes to pass to the underlying img element when rendering the preview. */
  imgProps?: React.ImgHTMLAttributes<HTMLImageElement>;
  /** Optional attributes to pass to the underlying input[type=file] element. */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;

  /** Optional classnames for nested elements */
  classNames?: {
    container?: string;
    previewWrapper?: string;
    image?: string;
    placeholder?: string;
    controls?: string;
    input?: string;
    uploadButton?: string;
    removeButton?: string;
    progress?: string;
    error?: string;
  };

  /** When in edit mode, apply this class to the active editor wrapper. */
  activeEditorClassName?: string;
}
