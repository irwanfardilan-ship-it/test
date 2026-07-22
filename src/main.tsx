import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import axios from 'axios';

// Konfigurasi baseURL axios jika didefinisikan di environment atau config.js
const appConfig = typeof window !== 'undefined' && (window as any).APP_CONFIG ? (window as any).APP_CONFIG : {};
const apiUrl = import.meta.env.VITE_API_URL || appConfig.API_URL;

if (apiUrl) {
  axios.defaults.baseURL = apiUrl;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
