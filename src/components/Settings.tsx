import { useSupabaseCMS } from '../hooks/useSupabaseCMS';
import { useUserSiteRole } from '../hooks/useUserSiteRole';
import EditorButton from './EditorButton';

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
  const { role, loading } = useUserSiteRole();

  if (loading || !role) return null;

  console.log('user role', role);

  return (
    <div
      className={
        classNames?.containerClassName ??
        'bmscms:p-2 bmscms:rounded bmscms:shadow'
      }
    >
      <EditorButton
        className={classNames?.buttonClassName}
        onClick={toggleEditMode}
      >
        {isInEditMode ? 'Close' : 'Edit'}
      </EditorButton>
    </div>
  );
}
