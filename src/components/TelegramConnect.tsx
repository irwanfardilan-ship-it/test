/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../store';
import { ShieldAlert, ExternalLink, HelpCircle, UserX, Copy, Check } from 'lucide-react';

export function TelegramConnect() {
  const { isTelegramWebApp } = useAppStore();
  const [copied, setCopied] = React.useState(false);

  // Get WebApp Telegram User info
  const tg = (window as any).Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user;

  const botUsername = import.meta.env.VITE_BOT_USERNAME || 'AzurLize_Bot';
  const botLink = `https://t.me/${botUsername}`;

  const copyDetails = () => {
    if (!tgUser) return;
    const textToCopy = `Halo Admin, tolong daftarkan akun saya:
Username: ${tgUser.username ? `@${tgUser.username}` : 'Tidak ada'}
Nama: ${tgUser.first_name || ''} ${tgUser.last_name || ''}
ID Telegram: ${tgUser.id}`;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // State 1: Open outside Telegram WebApp (Direct Browser Block)
  if (!isTelegramWebApp) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex items-center justify-center px-4 py-12 relative overflow-hidden text-slate-900 dark:text-white font-sans transition-colors duration-300">
        <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 opacity-10 dark:opacity-15 blur-[120px]"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="glassmorphism max-w-md w-full p-8 rounded-3xl border border-rose-200 dark:border-rose-900/30 shadow-2xl backdrop-blur-2xl bg-white/80 dark:bg-brand-dark/80 text-center transition-all duration-300"
        >
          {/* Shield Lock Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-red-400 p-[1px] shadow-lg shadow-rose-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-slate-50 dark:bg-brand-dark/95">
              <ShieldAlert className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-5">Akses Ditolak</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            Portal ini dilindungi secara ketat. Anda hanya dapat menjalankan dan mengakses aplikasi ini dari dalam <strong>Telegram Bot Resmi AzurLize Team</strong>.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 text-xs text-rose-700 dark:text-rose-300 text-left space-y-2">
            <p className="font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
              Mengapa akses dibatalkan?
            </p>
            <p className="leading-relaxed text-[11px] opacity-90">
              Demi keamanan, otentikasi data dan penyerahan aplikasi rekrutmen wajib diverifikasi secara langsung menggunakan infrastruktur Telegram WebApp yang aman.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <a
              href={botLink}
              target="_blank"
              referrerPolicy="no-referrer"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-red-500 hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Buka Telegram Bot</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/5 flex items-center justify-center gap-1.5 text-[9px] font-mono text-slate-400 dark:text-slate-500">
            <span>SECURE_GATEWAY_ENFORCED_SSL</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // State 2: Open inside Telegram WebApp, but unregistered in database
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex items-center justify-center px-4 py-12 relative overflow-hidden text-slate-900 dark:text-white font-sans transition-colors duration-300">
      <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 opacity-10 dark:opacity-15 blur-[120px]"></div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glassmorphism max-w-md w-full p-8 rounded-3xl border border-amber-200 dark:border-amber-900/30 shadow-2xl backdrop-blur-2xl bg-white/80 dark:bg-brand-dark/80 text-center transition-all duration-300"
      >
        {/* User Unregistered Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 p-[1px] shadow-lg shadow-amber-500/20">
          <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-slate-50 dark:bg-brand-dark/95">
            <UserX className="h-6 w-6 text-amber-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-5">Akun Belum Terdaftar</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
          Akun Telegram Anda terdeteksi dari bot, namun <strong>belum terdaftar</strong> dalam sistem database AzurLize Team.
        </p>

        {tgUser && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/10 text-left">
            <p className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-3">Detail Identitas Akun Anda</p>
            <div className="space-y-1.5 text-xs font-mono text-slate-700 dark:text-slate-300">
              <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                <span className="text-slate-500">Username:</span>
                <span className="font-semibold">{tgUser.username ? `@${tgUser.username}` : 'Tidak ada'}</span>
              </div>
              <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                <span className="text-slate-500">Nama:</span>
                <span className="font-semibold">{tgUser.first_name || ''} {tgUser.last_name || ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ID Telegram:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{tgUser.id}</span>
              </div>
            </div>

            <button
              onClick={copyDetails}
              className="mt-4 w-full py-2 px-3 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Salin Detail Identitas</span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="mt-6 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/10 text-xs text-blue-700 dark:text-blue-300 text-left space-y-2">
          <p className="font-semibold flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
            Langkah Selanjutnya:
          </p>
          <p className="leading-relaxed text-[11px] opacity-90">
            Hubungi Administrator atau pihak rekrutmen AzurLize Team untuk mendaftarkan akun Telegram Anda menggunakan detail identitas di atas agar dapat masuk ke portal ini.
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/5 flex items-center justify-center gap-1.5 text-[9px] font-mono text-slate-400 dark:text-slate-500">
          <span>REGISTRATION_STATUS_REQUIRED</span>
        </div>
      </motion.div>
    </div>
  );
}
