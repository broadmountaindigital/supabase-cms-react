import { useSupabaseCMS } from '../hooks/useSupabaseCMS';

/**
 * Props for the Settings component.
 */
export interface SettingsProps {
  /** Optional CSS class name for custom styling. */
  className?: string;
}

/**
 * A component that renders a button to toggle the CMS edit mode.
 */
export default function Settings(props: SettingsProps) {
  const { className } = props;
  const { isInEditMode, toggleEditMode } = useSupabaseCMS();

  return (
    <div className={className}>
      <button
        className="bg-blue-500 text-white p-4 rounded-full text-xs cursor-pointer"
        onClick={toggleEditMode}
      >
        {isInEditMode ? 'Close' : 'Edit'}
      </button>
    </div>
  );
}
