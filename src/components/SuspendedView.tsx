/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppStore } from '../store';
import { motion } from 'motion/react';
import { HelpCircle, LogOut, MessageCircle, RefreshCw } from 'lucide-react';

export function SuspendedView() {
  const { user, logout, refreshUserData, setAlert } = useAppStore();

  const handleRecheck = async () => {
    try {
      await refreshUserData();
      setAlert({ message: 'Status akun diperbarui.', type: 'success' });
    } catch (e) {
      setAlert({ message: 'Gagal memperbarui status.', type: 'error' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 font-sans text-slate-800 dark:text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glassmorphism max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-3xl border border-brand-warning/25"
      >
        {/* Glow behind */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-brand-warning opacity-15 rounded-full blur-2xl"></div>

        {/* Big Help Icon */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-warning/10 border border-brand-warning/20 shadow-lg mb-6">
          <HelpCircle className="h-10 w-10 text-brand-warning animate-spin-slow" />
        </div>

        <div className="text-center">
          <span className="px-3 py-1 bg-brand-warning/20 border border-brand-warning/30 rounded-full text-brand-warning text-[10px] font-bold tracking-wider uppercase inline-block mb-3">
            ACCOUNT SUSPENDED
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Akses Ditangguhkan Sementara
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Halo, <span className="font-bold text-slate-900 dark:text-slate-100">{user?.firstName}</span>.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Akun Anda terhubung dengan aktivitas yang memerlukan verifikasi manual tambahan. Akses ke sistem ditangguhkan sementara sampai peninjauan selesai.
          </p>
        </div>

        {/* Reason */}
        <div className="mt-6 p-4 bg-black/5 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-2xl text-xs space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">Alasan Penangguhan:</span>
          <p className="text-slate-700 dark:text-slate-300 italic font-medium leading-relaxed">
            "{user?.reason || 'Perubahan data Telegram terdeteksi atau sedang dalam proses audit berkas tim tahunan.'}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={handleRecheck}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 text-brand-primary dark:text-brand-accent" />
            <span>Cek Ulang</span>
          </button>

          <a
            href="https://t.me/azurlize_admin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-warning to-brand-primary text-white text-xs font-bold transition-all shadow-md hover:opacity-90 cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Hubungi Admin</span>
          </a>
        </div>

        <button
          onClick={logout}
          className="w-full mt-4 py-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-center"
        >
          Keluar Sesi Akun
        </button>
      </motion.div>
    </div>
  );
}
