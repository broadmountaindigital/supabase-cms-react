# @broadmountain/supabase-cms-react

[![NPM Version](https://img.shields.io/npm/v/@broadmountain/supabase-cms-react)](https://www.npmjs.com/package/@broadmountain/supabase-cms-react)

A React library that provides content management capabilities for websites using Supabase as the backend. This library allows developers to add CMS functionality to their React applications with site-specific content management.

## Features

- **Site-Specific CMS**: Manage content for multiple sites from a single Supabase backend.
- **Component-Based**: A set of reusable React components (`Login`, `Signup`, `MultilineEditor`, etc.).
- **Custom Hooks**: Easy-to-use hooks (`useSupabaseCMS`) to access auth, services, and state.
- **Styling Included**: Comes with a bundled CSS file for easy setup.
- **TypeScript Ready**: Fully typed for a better developer experience.

## Installation

```bash
npm install @broadmountain/supabase-cms-react @supabase/supabase-js react react-dom
```

## Usage

Wrap your application with the `SupabaseCMSProvider` and start using the components and hooks.

```tsx
// In your main App.tsx
import {
  SupabaseCMSProvider,
  Login,
  Profile,
  MultilineEditor,
  Settings,
} from '@broadmountain/supabase-cms-react';

// Import the bundled CSS
import '@broadmountain/supabase-cms-react/dist/style.css';

function App() {
  return (
    <SupabaseCMSProvider
      siteId="YOUR_SITE_ID"
      supabaseUrl="YOUR_SUPABASE_URL"
      supabaseAnonKey="YOUR_SUPABASE_ANON_KEY"
    >
      <YourAppContent />
    </SupabaseCMSProvider>
  );
}

function YourAppContent() {
  // Use hooks to manage state and actions
  const { user, signOut } = useSupabaseCMS();

  return (
    <div>
      <header>
        <h1>My Awesome Website</h1>
        {user ? (
          <Profile onSignOut={() => console.log('Signed out!')} />
        ) : (
          <Login />
        )}
      </header>
      <main>
        <h2>Editable Content</h2>
        <MultilineEditor
          defaultValue="Click the 'Edit' button to change this text."
          onChange={(value) => console.log(value)}
        />
      </main>
      <footer>
        {/* The settings component provides the edit mode toggle */}
        <Settings className="fixed bottom-4 right-4" />
      </footer>
    </div>
  );
}

export default App;
```

## Styling

This library allows you to bring your own styles. Components allow className props
to be passed so you can add your own selectors be it through Tailwind, vanilla CSS,
or whatever you like.

---

For information on contributing to this project, please see [CONTRIBUTING.md](CONTRIBUTING.md).
