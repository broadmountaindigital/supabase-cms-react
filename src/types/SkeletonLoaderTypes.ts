export interface SkeletonLoaderProps {
  /** CSS class for styling */
  className?: string;
  /** Number of skeleton lines to show */
  lines?: number;
  /** Height of each skeleton line */
  lineHeight?: string;
  /** Width of lines (can be array for varied widths) */
  width?: string | string[];
  /** Custom style object */
  style?: React.CSSProperties;
}
