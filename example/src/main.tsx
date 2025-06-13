import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SupabaseCMSProvider } from '@broadmountain/supabase-cms-react';
import App from './App.tsx';
import './index.css';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and Anon Key must be provided in .env file. Please create an 'example/.env' file."
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SupabaseCMSProvider
        supabaseUrl={supabaseUrl}
        supabaseAnonKey={supabaseAnonKey}
        siteId="1"
      >
        <App />
      </SupabaseCMSProvider>
    </BrowserRouter>
  </StrictMode>
);
