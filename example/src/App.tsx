import {
  Login,
  MultilineEditor,
  Profile,
  Settings,
  useSupabaseCMS,
} from '@broadmountain/supabase-cms-react';
import { Link, Route, Routes } from 'react-router-dom';
import '../src/index.css';
import './App.css';
import { SignupPage } from './SignupPage';

// A simple component to display the main content
function HomePage() {
  const { user, loading, error, isInEditMode } = useSupabaseCMS();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  if (!user) {
    return (
      <div className="container">
        <header>
          <h1>Welcome to the Supabase CMS Demo</h1>
        </header>
        <main>
          <Login />
          <p style={{ marginTop: '1rem' }}>
            Need an account? <Link to="/signup">Sign Up</Link>
          </p>
        </main>
      </div>
    );
  }

  console.info('is in edit mode:', isInEditMode);

  return (
    <div className="container">
      <header>
        <h1>Supabase CMS Demo</h1>
        <div className="controls">
          <Settings />
          <Profile />
        </div>
      </header>
      <main>
        <section>
          <h2>Editable Content</h2>
          <p>This is a demonstration of the MultilineEditor component.</p>
          <MultilineEditor
            defaultValue="Initial content for the editor."
            rest={{ id: 'example-content' }}
          />
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
}

export default App;
