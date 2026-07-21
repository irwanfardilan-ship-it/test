/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAppStore } from '../../store';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextProps {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Try to load initial theme from localStorage
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('azurlize_theme_mode') as ThemeMode;
      return saved || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  const { isDarkMode, setTheme: setStoreTheme } = useAppStore();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  // Compute resolved theme
  useEffect(() => {
    const updateTheme = () => {
      let active: 'light' | 'dark' = 'dark';
      
      if (theme === 'system') {
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        active = isSystemDark ? 'dark' : 'light';
      } else {
        active = theme === 'dark' ? 'dark' : 'light';
      }

      setResolvedTheme(active);

      // Sync with HTML class list
      const root = window.document.documentElement;
      if (active === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }

      // Sync with Zustand store if it differs
      if (isDarkMode !== (active === 'dark')) {
        setStoreTheme(active === 'dark');
      }
    };

    updateTheme();

    // Listen to system changes if in system mode
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme, isDarkMode, setStoreTheme]);

  // Sync state when store theme toggled from elsewhere
  useEffect(() => {
    if (theme !== 'system') {
      const expectedMode: ThemeMode = isDarkMode ? 'dark' : 'light';
      if (expectedMode !== theme) {
        setThemeState(expectedMode);
        localStorage.setItem('azurlize_theme_mode', expectedMode);
      }
    }
  }, [isDarkMode]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('azurlize_theme_mode', newTheme);
  };

  const toggleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % modes.length;
    setTheme(modes[nextIndex]);
  };

  // Inject CSS Variables for Enterprise Design System Tokens
  useEffect(() => {
    const root = document.documentElement;
    
    // Set Theme independent / constant tokens
    // Border Radius System (M3 inspired)
    root.style.setProperty('--radius-xs', '4px');
    root.style.setProperty('--radius-sm', '8px');
    root.style.setProperty('--radius-md', '12px');
    root.style.setProperty('--radius-lg', '16px');
    root.style.setProperty('--radius-xl', '24px');
    root.style.setProperty('--radius-full', '9999px');

    // Animation Duration Tokens
    root.style.setProperty('--transition-fast', '150ms');
    root.style.setProperty('--transition-normal', '250ms');
    root.style.setProperty('--transition-slow', '350ms');
    
    // M3 Spring/Easing tokens
    root.style.setProperty('--easing-standard', 'cubic-bezier(0.2, 0, 0, 1)');
    root.style.setProperty('--easing-decelerate', 'cubic-bezier(0, 0, 0, 1)');
    root.style.setProperty('--easing-accelerate', 'cubic-bezier(0.3, 0, 1, 1)');

    // Responsive breakpoints (for CSS custom layout references)
    root.style.setProperty('--breakpoint-mobile-max', '599px');
    root.style.setProperty('--breakpoint-tablet-min', '600px');
    root.style.setProperty('--breakpoint-tablet-max', '1023px');
    root.style.setProperty('--breakpoint-laptop-min', '1024px');
    root.style.setProperty('--breakpoint-laptop-max', '1439px');
    root.style.setProperty('--breakpoint-desktop-min', '1440px');

    // Dynamic Color and Elevation Tokens based on resolved theme
    if (resolvedTheme === 'dark') {
      // Dark Colors (MD3 & AzurLize Premium Deep Space Palette)
      root.style.setProperty('--sys-color-primary', '#60A5FA');
      root.style.setProperty('--sys-color-on-primary', '#0F172A');
      root.style.setProperty('--sys-color-primary-container', 'rgba(96, 165, 250, 0.15)');
      root.style.setProperty('--sys-color-on-primary-container', '#93C5FD');

      root.style.setProperty('--sys-color-secondary', '#A78BFA');
      root.style.setProperty('--sys-color-on-secondary', '#0F172A');
      root.style.setProperty('--sys-color-secondary-container', 'rgba(167, 139, 250, 0.15)');
      root.style.setProperty('--sys-color-on-secondary-container', '#C084FC');

      root.style.setProperty('--sys-color-tertiary', '#2DD4BF');
      root.style.setProperty('--sys-color-on-tertiary', '#0F172A');
      root.style.setProperty('--sys-color-tertiary-container', 'rgba(45, 212, 191, 0.15)');
      root.style.setProperty('--sys-color-on-tertiary-container', '#99F6E4');

      root.style.setProperty('--sys-color-success', '#4ADE80');
      root.style.setProperty('--sys-color-warning', '#FBBF24');
      root.style.setProperty('--sys-color-danger', '#F87171');

      root.style.setProperty('--sys-color-background', '#0F172A');
      root.style.setProperty('--sys-color-on-background', '#F8FAFC');

      root.style.setProperty('--sys-color-surface', '#1E293B');
      root.style.setProperty('--sys-color-on-surface', '#F8FAFC');
      root.style.setProperty('--sys-color-surface-variant', '#334155');
      root.style.setProperty('--sys-color-on-surface-variant', '#94A3B8');

      root.style.setProperty('--sys-color-outline', '#475569');
      root.style.setProperty('--sys-color-outline-variant', '#334155');

      // Glassmorphism tokens
      root.style.setProperty('--sys-glass-bg', 'rgba(15, 23, 42, 0.55)');
      root.style.setProperty('--sys-glass-border', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--sys-glass-blur', '24px');
      root.style.setProperty('--sys-glass-shadow', '0 12px 40px 0 rgba(0, 0, 0, 0.3)');

      // Elevation Shadows (Material Design 3 + Glow)
      root.style.setProperty('--sys-elevation-0', 'none');
      root.style.setProperty('--sys-elevation-1', '0 2px 8px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--sys-elevation-2', '0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--sys-elevation-3', '0 8px 24px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.15)');
      root.style.setProperty('--sys-elevation-4', '0 16px 36px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(96, 165, 250, 0.05)');
      root.style.setProperty('--sys-elevation-5', '0 24px 48px rgba(0, 0, 0, 0.6), 0 12px 24px rgba(124, 58, 237, 0.1)');
    } else {
      // Light Colors (MD3 & Soft High-Contrast Material Palette)
      root.style.setProperty('--sys-color-primary', '#2563EB');
      root.style.setProperty('--sys-color-on-primary', '#FFFFFF');
      root.style.setProperty('--sys-color-primary-container', '#DBEAFE');
      root.style.setProperty('--sys-color-on-primary-container', '#1E40AF');

      root.style.setProperty('--sys-color-secondary', '#7C3AED');
      root.style.setProperty('--sys-color-on-secondary', '#FFFFFF');
      root.style.setProperty('--sys-color-secondary-container', '#F3E8FF');
      root.style.setProperty('--sys-color-on-secondary-container', '#6B21A8');

      root.style.setProperty('--sys-color-tertiary', '#0D9488');
      root.style.setProperty('--sys-color-on-tertiary', '#FFFFFF');
      root.style.setProperty('--sys-color-tertiary-container', '#CCFBF1');
      root.style.setProperty('--sys-color-on-tertiary-container', '#115E59');

      root.style.setProperty('--sys-color-success', '#16A34A');
      root.style.setProperty('--sys-color-warning', '#D97706');
      root.style.setProperty('--sys-color-danger', '#DC2626');

      root.style.setProperty('--sys-color-background', '#F8FAFC');
      root.style.setProperty('--sys-color-on-background', '#0F172A');

      root.style.setProperty('--sys-color-surface', '#FFFFFF');
      root.style.setProperty('--sys-color-on-surface', '#0F172A');
      root.style.setProperty('--sys-color-surface-variant', '#F1F5F9');
      root.style.setProperty('--sys-color-on-surface-variant', '#475569');

      root.style.setProperty('--sys-color-outline', '#CBD5E1');
      root.style.setProperty('--sys-color-outline-variant', '#E2E8F0');

      // Glassmorphism tokens
      root.style.setProperty('--sys-glass-bg', 'rgba(255, 255, 255, 0.78)');
      root.style.setProperty('--sys-glass-border', 'rgba(15, 23, 42, 0.08)');
      root.style.setProperty('--sys-glass-blur', '24px');
      root.style.setProperty('--sys-glass-shadow', '0 12px 40px 0 rgba(31, 38, 135, 0.05)');

      // Elevation Shadows (Material Design 3 Soft shadow tokens)
      root.style.setProperty('--sys-elevation-0', 'none');
      root.style.setProperty('--sys-elevation-1', '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)');
      root.style.setProperty('--sys-elevation-2', '0 4px 12px rgba(31, 38, 135, 0.04), 0 2px 4px rgba(0, 0, 0, 0.02)');
      root.style.setProperty('--sys-elevation-3', '0 12px 24px rgba(31, 38, 135, 0.06), 0 4px 8px rgba(0, 0, 0, 0.03)');
      root.style.setProperty('--sys-elevation-4', '0 20px 32px rgba(31, 38, 135, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04)');
      root.style.setProperty('--sys-elevation-5', '0 32px 64px rgba(31, 38, 135, 0.12), 0 16px 32px rgba(31, 38, 135, 0.04)');
    }
  }, [resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
