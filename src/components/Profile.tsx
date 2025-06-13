import React from 'react';
import { useSupabaseCMS } from '../hooks/useSupabaseCMS';

export interface ProfileProps {
  onSignOut?: () => void;
  className?: string;
}

const Profile: React.FC<ProfileProps> = ({ onSignOut, className }) => {
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
    <div
      className={
        className ?? 'max-w-md mx-auto my-8 text-center p-4 border rounded'
      }
    >
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <p className="mb-4">
        Email: <span className="font-mono">{user.email}</span>
      </p>
      <button
        onClick={handleSignOut}
        className="p-2 bg-red-500 text-white rounded"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Profile;
