/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import axios from 'axios';
import { User, Application } from './types';

interface AppState {
  user: User | null;
  application: Application | null;
  token: string | null;
  isDarkMode: boolean;
  isInitializing: boolean;
  isTelegramWebApp: boolean;
  telegramAuthError: string | null;
  alert: { message: string; type: 'success' | 'error' | 'info' } | null;

  setAlert: (alert: { message: string; type: 'success' | 'error' | 'info' } | null) => void;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
  initializeAuth: () => Promise<void>;
  authenticateTelegram: (initData: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

function sanitizeErrorMessage(msg: string): string {
  if (!msg) return msg;
  let cleanMsg = msg;
  const urlRegex = /(https?:\/\/[^\s"'()<>]+)/gi;
  cleanMsg = cleanMsg.replace(urlRegex, '[tersembunyi]');
  const wwwRegex = /(www\.[^\s"'()<>]+)/gi;
  cleanMsg = cleanMsg.replace(wwwRegex, '[tersembunyi]');
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  cleanMsg = cleanMsg.replace(emailRegex, '[tersembunyi]');
  const repoPathRegex = /\b[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+(\.git)?\b/g;
  cleanMsg = cleanMsg.replace(repoPathRegex, '[sistem]');
  const filePathRegex = /\b\/[a-zA-Z0-9._-]+(\/[a-zA-Z0-9._-]+)+\b/g;
  cleanMsg = cleanMsg.replace(filePathRegex, '[sistem]');
  const domainRegex = /\b([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?\b/gi;
  cleanMsg = cleanMsg.replace(domainRegex, '[sistem]');
  const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
  cleanMsg = cleanMsg.replace(ipRegex, '[sistem]');
  const localhostRegex = /\b(localhost|127\.0\.0\.1)\b/gi;
  cleanMsg = cleanMsg.replace(localhostRegex, '[sistem]');
  const portRegex = /:\d+/g;
  cleanMsg = cleanMsg.replace(portRegex, '');
  const sensitiveWordsRegex = /\b[a-zA-Z0-9_-]*(github|git|run\.app|ais-dev|irwanfardilan|ship-it)[a-zA-Z0-9_-]*\b/gi;
  cleanMsg = cleanMsg.replace(sensitiveWordsRegex, '[sistem]');
  const apiPathRegex = /\/api\/[^\s"'()<>]+/gi;
  cleanMsg = cleanMsg.replace(apiPathRegex, '[sistem]');
  cleanMsg = cleanMsg.replace(/\s+/g, ' ');
  return cleanMsg.trim();
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  application: null,
  token: null,
  isDarkMode: true,
  isInitializing: true,
  isTelegramWebApp: false,
  telegramAuthError: null,
  alert: null,

  setAlert: (alert) => set({ 
    alert: alert ? { ...alert, message: sanitizeErrorMessage(alert.message) } : null 
  }),

  toggleTheme: () => {
    const nextDark = !get().isDarkMode;
    set({ isDarkMode: nextDark });
  },

  setTheme: (dark) => {
    set({ isDarkMode: dark });
  },

  initializeAuth: async () => {
    set({ isInitializing: true, telegramAuthError: null });
    
    try {
      const tg = (window as any).Telegram?.WebApp;
      const isTg = !!(tg && tg.initData);
      set({ isTelegramWebApp: isTg });

      if (isTg) {
        tg.ready();
        tg.expand();
        const telegramInitData = tg.initData;
        
        console.log('[Telegram Auth] Found WebApp initData, performing backend login...');
        try {
          await get().authenticateTelegram(telegramInitData);
          set({ telegramAuthError: null });
          return;
        } catch (err: any) {
          console.error('[Telegram Auth] Verification failed:', err);
          const errMsg = err.response?.data?.error || err.message || 'Gagal memverifikasi identitas Telegram.';
          
          // Clean storage and session when Telegram verification fails
          delete axios.defaults.headers.common['Authorization'];
          set({ 
            token: null, 
            user: null, 
            application: null, 
            telegramAuthError: errMsg 
          });
          return;
        }
      } else {
        // Outside Telegram WebApp: Enforce strict bot access
        delete axios.defaults.headers.common['Authorization'];
        set({ 
          token: null, 
          user: null, 
          application: null, 
          telegramAuthError: 'Aplikasi ini hanya dapat diakses melalui Telegram Bot resmi AzurLize.' 
        });
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

  logout: () => {
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
