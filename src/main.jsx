import { StrictMode } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { env } from './config/env.js';
import { store } from './store/index.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={env.clerkPublishableKey} afterSignOutUrl="/">
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ClerkProvider>
  </StrictMode>,
);
