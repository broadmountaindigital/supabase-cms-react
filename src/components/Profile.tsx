import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', textAlign: 'center' }}>
      <h2>Profile</h2>
      <p>Email: {user.email}</p>
    </div>
  );
};

export default Profile;
