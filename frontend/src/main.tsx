import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '16px',
            background: '#fff',
            color: '#0f172a',
            fontSize: '14px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
);