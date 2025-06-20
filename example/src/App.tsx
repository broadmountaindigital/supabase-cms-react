import {
  Login,
  MultilineEditor,
  SignoutButton,
  Settings,
  Collection,
  useSupabaseCMS,
} from '@broadmountain/supabase-cms-react';
import { Link, Route, Routes } from 'react-router-dom';
import { SignupPage } from './SignupPage';

// A simple component to display the main content
function HomePage() {
  const { user, loading, error, isInEditMode } = useSupabaseCMS();

  console.log('user', user);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  if (!user) {
    return (
      <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center gap-4">
        <h1 className="card-title">Welcome to the Supabase CMS Demo</h1>
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <Login />
            <p className="mt-4 text-center">
              Need an account?{' '}
              <Link to="/signup" className="link">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.info('is in edit mode:', isInEditMode);

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Supabase CMS Demo</h1>
        <div className="flex items-center gap-4">
          <Settings />
          <SignoutButton />
        </div>
      </header>
      <main className="space-y-6">
        <section className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Editable Content</h2>
          <div className="mb-4">
            <MultilineEditor
              fieldName="some_editable_content"
              rest={{ id: 'example-content' }}
            />
          </div>
        </section>

        <section className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Collection Example</h2>
          <p className="text-gray-600 mb-4">
            This is a collection of content fields. In edit mode, you can add,
            remove, and edit items.
          </p>
          <Collection
            collectionId="e3a5d0a4-bc29-4a65-919b-f678132202c9"
            emptyStateMessage="No items in this demo collection. Add some items in edit mode!"
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
