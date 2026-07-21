/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppStore } from '../store';
import { motion } from 'motion/react';
import { ShieldAlert, LogOut, MessageCircle } from 'lucide-react';

export function BannedView() {
  const { user, logout } = useAppStore();

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 font-sans text-slate-800 dark:text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glassmorphism max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-3xl border border-brand-danger/20"
      >
        {/* Glow behind */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-brand-danger opacity-20 rounded-full blur-2xl animate-pulse"></div>

        {/* Big Alert Icon */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-danger/10 border border-brand-danger/30 shadow-lg mb-6">
          <ShieldAlert className="h-10 w-10 text-brand-danger animate-bounce" />
        </div>

        <div className="text-center">
          <span className="px-3 py-1 bg-brand-danger/20 border border-brand-danger/30 rounded-full text-brand-danger text-[10px] font-bold tracking-wider uppercase inline-block mb-3">
            ACCOUNT BANNED
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Akses Diblokir Permanen
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Halo, <span className="font-bold text-slate-900 dark:text-slate-100">{user?.firstName}</span>.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Sistem mendeteksi aktivitas yang melanggar ketentuan penggunaan platform internal AzurLize Team. Akun Anda telah dibatalkan aksesnya secara permanen.
          </p>
        </div>

        {/* Banned Reason Box */}
        <div className="mt-6 p-4 bg-brand-danger/5 border border-brand-danger/10 rounded-2xl text-xs space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-brand-danger tracking-wider block">Alasan Pemblokiran:</span>
          <p className="text-slate-800 dark:text-slate-300 italic font-medium leading-relaxed">
            "{user?.reason || 'Pelanggaran kode etik internal dan penyalahgunaan hak akses sistem.'}"
          </p>
        </div>

        {/* Account metadata info */}
        <div className="mt-5 p-3.5 bg-black/5 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-white/5 space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500">USER_ID:</span>
            <span className="text-slate-700 dark:text-slate-300">{user?.telegramId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">OPERATOR:</span>
            <span className="text-slate-700 dark:text-slate-300">Super Admin</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-slate-400" />
            <span>Keluar Sesi</span>
          </button>

          <a
            href="https://t.me/azurlize_admin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-danger text-white text-xs font-bold transition-all shadow-md shadow-brand-danger/25 hover:bg-brand-danger/90 cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Ajukan Banding</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
