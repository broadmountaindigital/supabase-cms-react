import { useSupabaseCMS } from '../hooks/useSupabaseCMS';
import EditorButton from './EditorButton';

/**
 * Props for the Profile component.
 */
export interface ProfileProps {
  /** Callback function to be called after the user signs out. */
  onSignOut?: () => void;
  /** Optional classnames for nested elements */
  classNames?: {
    containerClassName?: string;
    buttonClassName?: string;
    h2ClassName?: string;
    textClassName?: string;
  };
}

/**
 * A component that displays the current user's profile information
 * and provides a sign-out button.
 */
const Profile: React.FC<ProfileProps> = ({ onSignOut, classNames }) => {
  const { user, signOut, loading } = useSupabaseCMS();

  async function handleSignOut() {
    await signOut();
    if (onSignOut) {
      onSignOut();
    }
  }

  if (loading) {
    return (
      <div className="bmscms:text-center bmscms:p-4">Loading profile...</div>
    );
  }

  if (!user) {
    // It's up to the consumer to handle the case where there is no user.
    // This component will simply render nothing.
    return null;
  }

  return (
    <div
      className={
        classNames?.containerClassName ??
        'bmscms:rounded bmscms:shadow bmscms:p-6 bmscms:max-w-md bmscms:mx-auto'
      }
    >
      <h2
        className={
          classNames?.h2ClassName ??
          'bmscms:text-2xl bmscms:font-bold bmscms:mb-4'
        }
      >
        Profile
      </h2>
      <p className={classNames?.textClassName ?? 'bmscms:mb-4'}>
        Email: <span>{user.email}</span>
      </p>
      <EditorButton
        onClick={handleSignOut}
        className={classNames?.buttonClassName}
      >
        Sign Out
      </EditorButton>
    </div>
  );
};

export default Profile;
