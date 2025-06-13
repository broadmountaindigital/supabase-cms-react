# Supabase CMS Integration Guide

This guide provides a step-by-step walkthrough for integrating the `@broadmountain/supabase-cms-react` library into your React application.

## 1. Installation

First, install the library along with its peer dependencies from npm:

```bash
npm install @broadmountain/supabase-cms-react @supabase/supabase-js react react-dom
```

## 2. Environment Variables

The library requires your Supabase project credentials. Create a `.env` file in the root of your project and add the following variables. You can find these in your Supabase project's "Project Settings" > "API" section.

```
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

**Note:** If you are not using Vite, you will need to adjust the variable names and your build process accordingly (e.g., `REACT_APP_SUPABASE_URL` for Create React App).

## 3. Provider Setup

To enable the CMS functionality, you must wrap your application's root component with the `SupabaseCMSProvider`. This provider initializes the Supabase client and makes all CMS hooks and components available to your app.

You will also need to provide a unique `siteId`. For now, you can use any string, but this will be used in the future to manage multiple sites from a single Supabase backend.

Here is an example of how to set it up in your main `App.tsx` or `main.tsx` file:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SupabaseCMSProvider } from '@broadmountain/supabase-cms-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase credentials must be provided in your .env file.');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SupabaseCMSProvider
      siteId="your-unique-site-id"
      supabaseUrl={supabaseUrl}
      supabaseAnonKey={supabaseAnonKey}
    >
      <App />
    </SupabaseCMSProvider>
  </React.StrictMode>
);
```

## 4. Styling

The library comes with a pre-bundled CSS file that includes all the necessary styles for the components, powered by Tailwind CSS. To apply these styles, import the stylesheet into your main application entry point (e.g., `main.tsx` or `App.tsx`).

```tsx
import '@broadmountain/supabase-cms-react/dist/style.css';
```

### Custom Styling

While the bundled stylesheet provides a great starting point, you can also apply your own custom styles. All components accept a `classNames` prop, which allows you to pass in your own CSS classes for nested elements. This gives you granular control over the look and feel, enabling you to integrate with any styling solution, such as Tailwind CSS, CSS Modules, or vanilla CSS.

See the documentation for each component for a complete list of available `classNames`.

## 5. Usage Example

Here is a basic example of how to use the components and the main `useSupabaseCMS` hook to create a simple CMS-powered page.

```tsx
// src/components/MyCmsPage.tsx
import {
  Login,
  Profile,
  Settings,
  MultilineEditor,
  useSupabaseCMS,
} from '@broadmountain/supabase-cms-react';

function MyCmsPage() {
  const { user, loading, error, isInEditMode, toggleEditMode } =
    useSupabaseCMS();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Authentication Error: {error.message}</p>;
  }

  // If no user is logged in, show the Login component
  if (!user) {
    return (
      <div>
        <h1>Please Sign In</h1>
        <Login />
      </div>
    );
  }

  // Once the user is logged in, show the main content
  return (
    <div>
      <header>
        <h1>Welcome to Your CMS-Powered Site</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* The Settings component provides the "Edit Mode" toggle */}
          <Settings />
          {/* The Profile component handles user profile and sign-out */}
          <Profile />
        </div>
      </header>

      <main>
        <h2>About Us</h2>
        <p>This is a section with editable content.</p>

        {/* 
          The MultilineEditor becomes a textarea when in edit mode.
          The `defaultValue` will be displayed initially and when not in edit mode.
        */}
        <MultilineEditor defaultValue="We are a company dedicated to making content management easy." />
      </main>
    </div>
  );
}

export default MyCmsPage;
```

## 6. Authentication Flow

The library handles the authentication flow for you.

- The `Login` component provides a simple email/password sign-in form.
- The `Signup` component (not shown above, but available for import) provides a sign-up form.
- The `Profile` component displays the current user's avatar and provides a "Sign Out" button.
- The `useSupabaseCMS` hook gives you access to the `user` object, so you can conditionally render UI based on the user's authentication state.

By following these steps, you can quickly integrate a powerful, Supabase-backed CMS into any React application.
