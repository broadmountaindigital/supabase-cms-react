import type { TextInputProps } from '../types/TextInputProps';
import type {
  ValidationSchema,
  ConflictDetection,
  OfflineConfig,
  ConflictResolutionStrategy,
} from '../types/ValidationTypes';
import type { RevisionEnabledProps } from '../types/RevisionTypes';

/**
 * Props for the MultilineEditor component.
 */
export interface MultilineEditorProps
  extends TextInputProps,
    RevisionEnabledProps {
  /** The unique name of the content field to be fetched and updated. */
  fieldName: string;
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
}
