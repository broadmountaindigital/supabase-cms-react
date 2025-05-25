import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { signOut } from '@/store/slices/userSlice';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  async function handleLogout() {
    await dispatch(signOut());
    navigate('/login');
  }

  return (
    <nav
      style={{
        display: 'flex',
        gap: 16,
        padding: 16,
        borderBottom: '1px solid #eee',
      }}
    >
      <Link to="/">Home</Link>
      <Link to="/profile">Profile</Link>
      {!user && <Link to="/login">Login</Link>}
      {!user && <Link to="/signup">Sign Up</Link>}
      {user && (
        <button onClick={handleLogout} style={{ cursor: 'pointer' }}>
          Log Out
        </button>
      )}
    </nav>
  );
};

export default Navbar;
