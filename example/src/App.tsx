import {
  Login,
  MultilineEditor,
  Profile,
  Settings,
  SupabaseCMSProvider,
  useSupabaseCMS,
} from '@broadmountain/supabase-cms-react';
import '../src/index.css';
import './App.css';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and Anon Key must be provided in .env file. Please create an 'example/.env' file."
  );
}

// A simple component to display the main content
function CmsContent() {
  const { user, loading, error, isInEditMode, toggleEditMode } =
    useSupabaseCMS();

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
        </main>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>Supabase CMS Demo</h1>
        <div className="controls">
          <button onClick={toggleEditMode}>
            {isInEditMode ? 'Disable Edit Mode' : 'Enable Edit Mode'}
          </button>
          <Profile />
        </div>
      </header>
      <main>
        <Settings />
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
    <SupabaseCMSProvider
      supabaseUrl={supabaseUrl}
      supabaseAnonKey={supabaseAnonKey}
      siteId="1"
    >
      <CmsContent />
    </SupabaseCMSProvider>
  );
}

export default App;
