import { useSupabaseCMS } from '../hooks/useSupabaseCMS';

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
    return <div className="text-center p-4">Loading profile...</div>;
  }

  if (!user) {
    // It's up to the consumer to handle the case where there is no user.
    // This component will simply render nothing.
    return null;
  }

  return (
    <div className={classNames?.containerClassName}>
      <h2 className={classNames?.h2ClassName}>Profile</h2>
      <p className={classNames?.textClassName}>
        Email: <span>{user.email}</span>
      </p>
      <button onClick={handleSignOut} className={classNames?.buttonClassName}>
        Sign Out
      </button>
    </div>
  );
};

export default Profile;
