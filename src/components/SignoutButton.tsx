import { useSupabaseCMS } from '../hooks/useSupabaseCMS';
import EditorButton from './EditorButton';

/**
 * Props for the Profile component.
 */
export interface SignoutButtonProps {
  /** Callback function to be called after the user signs out. */
  onSignOut?: () => void;
  buttonClassName?: string;
}

/**
 * A component that displays the current user's profile information
 * and provides a sign-out button.
 */
const SignoutButton: React.FC<SignoutButtonProps> = ({
  onSignOut,
  buttonClassName,
}) => {
  const { user, signOut, loading } = useSupabaseCMS();

  async function handleSignOut() {
    await signOut();
    if (onSignOut) {
      onSignOut();
    }
  }

  if (loading) {
    return null;
  }

  if (!user) {
    // It's up to the consumer to handle the case where there is no user.
    // This component will simply render nothing.
    return null;
  }

  return (
    <EditorButton onClick={handleSignOut} className={buttonClassName}>
      Sign Out
    </EditorButton>
  );
};

export default SignoutButton;
