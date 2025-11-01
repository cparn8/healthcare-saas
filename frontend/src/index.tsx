// frontend/src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './app/index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import reportWebVitals from './reportWebVitals';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position='top-right'
        toastOptions={{
          duration: 3500,
          style: {
            background: '#111827', // slate-900
            color: '#fff',
            fontWeight: 500,
            borderRadius: '10px',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
