/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import axios from 'axios';
import { User, Application, UserRole, UserStatus } from './types';

interface AppState {
  user: User | null;
  application: Application | null;
  token: string | null;
  isDarkMode: boolean;
  isInitializing: boolean;
  alert: { message: string; type: 'success' | 'error' | 'info' } | null;

  setAlert: (alert: { message: string; type: 'success' | 'error' | 'info' } | null) => void;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
  initializeAuth: () => Promise<void>;
  authenticateTelegram: (initData: string) => Promise<void>;
  connectTelegramManual: (username: string, firstName: string, lastName?: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

function sanitizeErrorMessage(msg: string): string {
  if (!msg) return msg;
  
  let cleanMsg = msg;
  
  // 1. Remove standard URLs starting with http:// or https://
  const urlRegex = /(https?:\/\/[^\s"'()<>]+)/gi;
  cleanMsg = cleanMsg.replace(urlRegex, '[tersembunyi]');
  
  // 2. Remove standard URLs starting with www.
  const wwwRegex = /(www\.[^\s"'()<>]+)/gi;
  cleanMsg = cleanMsg.replace(wwwRegex, '[tersembunyi]');
  
  // 3. Remove email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  cleanMsg = cleanMsg.replace(emailRegex, '[tersembunyi]');

  // 4. Remove username/repository pattern like "irwanfardilan-ship-it/test" or "some-user/repo"
  const repoPathRegex = /\b[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+(\.git)?\b/g;
  cleanMsg = cleanMsg.replace(repoPathRegex, '[sistem]');

  // 5. Remove absolute file paths like /usr/bin/git
  const filePathRegex = /\b\/[a-zA-Z0-9._-]+(\/[a-zA-Z0-9._-]+)+\b/g;
  cleanMsg = cleanMsg.replace(filePathRegex, '[sistem]');

  // 6. Remove sensitive hostnames/domains/IPs/ports
  const domainRegex = /\b([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?\b/gi;
  cleanMsg = cleanMsg.replace(domainRegex, '[sistem]');
  
  const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
  cleanMsg = cleanMsg.replace(ipRegex, '[sistem]');
  
  const localhostRegex = /\b(localhost|127\.0\.0\.1)\b/gi;
  cleanMsg = cleanMsg.replace(localhostRegex, '[sistem]');

  const portRegex = /:\d+/g;
  cleanMsg = cleanMsg.replace(portRegex, '');

  // 7. Remove specific git/github/deployment/action related terms or username patterns
  const sensitiveWordsRegex = /\b[a-zA-Z0-9_-]*(github|git|run\.app|ais-dev|irwanfardilan|ship-it)[a-zA-Z0-9_-]*\b/gi;
  cleanMsg = cleanMsg.replace(sensitiveWordsRegex, '[sistem]');

  // 8. Remove API paths
  const apiPathRegex = /\/api\/[^\s"'()<>]+/gi;
  cleanMsg = cleanMsg.replace(apiPathRegex, '[sistem]');

  // 9. Clean up extra spacing
  cleanMsg = cleanMsg.replace(/\s+/g, ' ');
  return cleanMsg.trim();
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  application: null,
  token: (() => { try { return localStorage.getItem('azurlize_jwt_token'); } catch(e) { return null; } })(),
  isDarkMode: (() => { try { return localStorage.getItem('azurlize_theme') !== 'light'; } catch(e) { return true; } })(),
  isInitializing: true,
  alert: null,

  setAlert: (alert) => set({ 
    alert: alert ? { ...alert, message: sanitizeErrorMessage(alert.message) } : null 
  }),

  toggleTheme: () => {
    const nextDark = !get().isDarkMode;
    localStorage.setItem('azurlize_theme', nextDark ? 'dark' : 'light');
    set({ isDarkMode: nextDark });
  },

  setTheme: (dark) => {
    localStorage.setItem('azurlize_theme', dark ? 'dark' : 'light');
    set({ isDarkMode: dark });
  },

  initializeAuth: async () => {
    set({ isInitializing: true });
    
    try {
      // Check if running inside Telegram WebApp and has initData
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        
        const telegramInitData = tg.initData;
        if (telegramInitData) {
          console.log('[Telegram Auth] Found WebApp initData, performing backend login...');
          try {
            await get().authenticateTelegram(telegramInitData);
            set({ isInitializing: false });
            return;
          } catch (err) {
            console.error('[Telegram Auth] Verification failed:', err);
          }
        }
      }

      const token = get().token;

      // Set axios authorization default header if token exists
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      if (token) {
        try {
          // Fetch real status
          const res = await axios.get('/api/me');
          set({
            user: res.data.user,
            application: res.data.application,
          });
        } catch (err) {
          console.warn('Failed auto token verification.', err);
          // If server request fails or token invalid, clean storage
          localStorage.removeItem('azurlize_jwt_token');
          set({ token: null, user: null, application: null });
        }
      }
    } catch (globalErr) {
      console.error('[Auth Initialization] Critical error:', globalErr);
    } finally {
      set({ isInitializing: false });
    }
  },

  authenticateTelegram: async (initData) => {
    try {
      const res = await axios.post('/api/auth/telegram', { initData });
      const { token, user } = res.data;

      // Save token and defaults
      localStorage.setItem('azurlize_jwt_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      set({
        token,
        user,
        alert: { message: `Berhasil masuk sebagai ${user.firstName}`, type: 'success' }
      });

      // Retrieve full me profile (which carries application details)
      const profileRes = await axios.get('/api/me');
      set({
        user: profileRes.data.user,
        application: profileRes.data.application
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'Gagal terhubung dengan sistem otentikasi.';
      set({
        alert: { message: `Auth Error: ${errMsg}`, type: 'error' }
      });
      throw err;
    }
  },

  connectTelegramManual: async (username, firstName, lastName) => {
    try {
      const res = await axios.post('/api/auth/telegram-manual', {
        username,
        firstName,
        lastName
      });
      const { token, user } = res.data;

      localStorage.setItem('azurlize_jwt_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      set({
        token,
        user,
        alert: { message: `Berhasil terhubung sebagai @${username}`, type: 'success' }
      });

      // Retrieve full me profile
      const profileRes = await axios.get('/api/me');
      set({
        user: profileRes.data.user,
        application: profileRes.data.application
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'Gagal menghubungkan akun Telegram.';
      set({
        alert: { message: `Manual Auth Error: ${errMsg}`, type: 'error' }
      });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('azurlize_jwt_token');
    delete axios.defaults.headers.common['Authorization'];
    set({
      user: null,
      application: null,
      token: null,
      alert: { message: 'Sesi Anda telah keluar.', type: 'info' }
    });
  },

  refreshUserData: async () => {
    try {
      const res = await axios.get('/api/me');
      set({
        user: res.data.user,
        application: res.data.application
      });
    } catch (e) {
      console.error('Failed to refresh user data', e);
    }
  }
}));
