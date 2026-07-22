/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from './store';
import { Splash } from './components/Splash';
import { TelegramConnect } from './components/TelegramConnect';
import { ApplyForm } from './components/ApplyForm';
import { PendingView } from './components/PendingView';
import { BannedView } from './components/BannedView';
import { RejectedView } from './components/RejectedView';
import { SuspendedView } from './components/SuspendedView';
import { MemberDataForm } from './components/MemberDataForm';
import { DashboardView } from './pages/DashboardView';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal, LogOut, CheckCircle, AlertTriangle, Info, Send, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';
import { ThemeProvider } from './components/design-system/ThemeProvider';


export default function App() {
  const { 
    user, 
    application, 
    initializeAuth, 
    isInitializing, 
    isTelegramWebApp,
    alert, 
    setAlert, 
    isDarkMode, 
    logout 
  } = useAppStore();
  
  const [showSplash, setShowSplash] = useState(true);

  // Initialize auth when app mounts
  useEffect(() => {
    initializeAuth();
  }, []);

  // Sync theme with HTML document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auto-dismiss alert toast after 4 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Show fullscreen Splash Screen first
  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  // Fallback while loading API data
  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-brand-dark flex flex-col items-center justify-center font-sans text-white">
        <div className="h-10 w-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-mono text-slate-400">Loading secure credentials...</p>
      </div>
    );
  }

  // Render correct page based on current user status
  const renderContent = () => {
    if (!user) {
      return <TelegramConnect />;
    }

    switch (user.status) {
      case 'Active':
        if (!user.uidKucing || !user.email || !user.noWa) {
          return <MemberDataForm />;
        }
        return <DashboardView />;
        
      case 'Pending':
        // If they are a visitor and have not filled out an application, show the ApplyForm
        if (!application) {
          return (
            <div className="py-12 px-4 max-w-4xl mx-auto font-sans">
              {/* Header introduction banner for new guest */}
              <div className="glassmorphism p-5 rounded-3xl mb-8 text-center relative overflow-hidden border border-brand-primary/20">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-28 h-28 bg-brand-primary opacity-10 rounded-full blur-2xl"></div>
                
                <span className="px-2.5 py-0.5 bg-brand-primary/20 text-brand-accent text-[9px] font-bold rounded-full uppercase tracking-wider border border-brand-accent/25 inline-block mb-2">
                  Visitor Mode
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Selamat Datang di AzurLize Team!</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                  Akun Telegram Anda terhubung. Anda belum terdaftar sebagai anggota atau pengisi data harian. Silakan isi formulir rekrutmen di bawah untuk mendaftarkan kualifikasi teknis Anda.
                </p>
                <button
                  onClick={logout}
                  className="mt-3.5 px-3.5 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[11px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="h-3 w-3" /> Keluar Sesi
                </button>
              </div>
              <ApplyForm />
            </div>
          );
        }
        return <PendingView />;
        
      case 'Rejected':
        return <RejectedView />;
        
      case 'Banned':
        return <BannedView />;
        
      case 'Suspended':
        return <SuspendedView />;
        
      default:
        return <PendingView />;
    }
  };

  return (
    <ThemeProvider>
      <div className={`min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-800 dark:text-slate-100 transition-colors duration-200`}>
        
        {/* Active screen content */}
        <div className="relative">
          {renderContent()}
        </div>

        {/* Floating Global Alert Toast notification */}
        <AnimatePresence>
          {alert && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 right-6 z-50 max-w-sm w-11/12 shadow-2xl rounded-2xl p-4 border flex items-start gap-3 backdrop-blur-2xl glassmorphism"
            >
              {alert.type === 'success' && (
                <div className="p-1 rounded-lg bg-brand-success/10 text-brand-success shrink-0">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
              {alert.type === 'error' && (
                <div className="p-1 rounded-lg bg-brand-danger/10 text-brand-danger shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              )}
              {alert.type === 'info' && (
                <div className="p-1 rounded-lg bg-brand-primary/10 text-brand-accent shrink-0">
                  <Info className="h-5 w-5" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white">Notifikasi Sistem</p>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{alert.message}</p>
              </div>

              <button
                onClick={() => setAlert(null)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
}

// Inline Close Icon helper since we used X
function X({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth="2.5" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
