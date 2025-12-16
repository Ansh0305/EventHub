import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#1a1a24', color: '#f9fafb', border: '1px solid rgba(139, 92, 246, 0.2)' } }} />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
