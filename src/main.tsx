import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import axios from 'axios';

// Konfigurasi baseURL axios untuk mendukung deployment terpisah (seperti GitHub Pages frontend + Cloud Run backend)
if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
} else if (window.location.hostname.endsWith('.github.io')) {
  // Otomatis mengarahkan ke backend Cloud Run jika diakses dari GitHub Pages
  axios.defaults.baseURL = 'https://ais-pre-dxmkezhtwqkm7bbiwvgdnv-268860382066.asia-east1.run.app';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
