/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '../store';
import { motion } from 'motion/react';
import { ShieldX, RotateCcw, MessageCircle, LogOut } from 'lucide-react';
import { ApplyForm } from './ApplyForm';

export function RejectedView() {
  const { user, logout } = useAppStore();
  const [showReapplyForm, setShowReapplyForm] = useState(false);

  if (showReapplyForm) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowReapplyForm(false)}
            className="text-xs font-semibold text-brand-primary dark:text-brand-accent hover:underline flex items-center gap-1 cursor-pointer"
          >
            ← Kembali ke Status Penolakan
          </button>
          <button
            onClick={logout}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="h-3 w-3" /> Keluar Sesi
          </button>
        </div>
        <ApplyForm />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 font-sans text-slate-800 dark:text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glassmorphism max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-3xl border border-brand-danger/20"
      >
        {/* Glow behind */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-brand-danger opacity-15 rounded-full blur-2xl"></div>

        {/* Big Cancel Icon */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-danger/10 border border-brand-danger/20 shadow-lg mb-6">
          <ShieldX className="h-10 w-10 text-brand-danger" />
        </div>

        <div className="text-center">
          <span className="px-3 py-1 bg-brand-danger/10 border border-brand-danger/20 rounded-full text-brand-danger text-[10px] font-bold tracking-wider uppercase inline-block mb-3">
            APPLICATION REJECTED
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Lamaran Belum Disetujui
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Halo, <span className="font-bold text-slate-900 dark:text-slate-100">{user?.firstName}</span>.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Terima kasih telah meluangkan waktu untuk mendaftar ke AzurLize Team. Setelah melalui proses review menyeluruh, mohon maaf lamaran Anda saat ini belum dapat kami setujui.
          </p>
        </div>

        {/* Rejection Reason Box */}
        <div className="mt-6 p-4 bg-black/5 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-2xl text-xs space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">Catatan Tim Penilai:</span>
          <p className="text-slate-700 dark:text-slate-300 italic font-medium leading-relaxed">
            "{user?.reason || 'Profil kualifikasi teknis dan berkas portofolio yang dilampirkan belum sesuai dengan kebutuhan teknis utama divisi saat ini.'}"
          </p>
        </div>

        <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 mt-5 leading-relaxed">
          Jangan berkecil hati! Anda dapat memperbarui portofolio atau melamar kembali untuk posisi yang sama atau berbeda di masa mendatang.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowReapplyForm(true)}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold transition-all shadow-md shadow-brand-primary/20 hover:opacity-90 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Kirim Ulang</span>
          </button>

          <a
            href="https://t.me/azurlize_admin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            <MessageCircle className="h-4 w-4 text-brand-primary dark:text-brand-accent" />
            <span>Tanya Admin</span>
          </a>
        </div>

        <button
          onClick={logout}
          className="w-full mt-4 py-2 text-xs text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer text-center"
        >
          Keluar Sesi Akun
        </button>
      </motion.div>
    </div>
  );
}
