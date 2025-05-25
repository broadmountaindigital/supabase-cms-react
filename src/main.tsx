import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Provider } from 'react-redux';
import { store } from './store';
import Settings from './components/Settings.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <div>
        <App />
        <Settings className="absolute bottom-0 right-0" />
      </div>
    </Provider>
  </StrictMode>
);
