import { useSupabaseCMS } from '../hooks/useSupabaseCMS';

/**
 * Props for the Settings component.
 */
export interface SettingsProps {
  /** Optional classnames for nested elements */
  classNames?: {
    buttonClassName?: string;
    containerClassName?: string;
  };
}

/**
 * A component that renders a button to toggle the CMS edit mode.
 */
export default function Settings({ classNames }: SettingsProps) {
  const { isInEditMode, toggleEditMode } = useSupabaseCMS();

  return (
    <div className={classNames?.containerClassName ?? ''}>
      <button
        className={classNames?.buttonClassName ?? ''}
        onClick={toggleEditMode}
      >
        {isInEditMode ? 'Close' : 'Edit'}
      </button>
    </div>
  );
}
