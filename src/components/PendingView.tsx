/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { motion } from 'motion/react';
import { Clock, RefreshCw, Send, UserCheck, ShieldAlert, Sparkles, MessageCircle } from 'lucide-react';

export function PendingView() {
  const { user, application, refreshUserData, setAlert } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loginTime, setLoginTime] = useState('');

  useEffect(() => {
    setLoginTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUserData();
      setAlert({ message: 'Status akun berhasil diperbarui.', type: 'success' });
    } catch (e) {
      setAlert({ message: 'Gagal memperbarui status akun.', type: 'error' });
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 font-sans text-slate-800 dark:text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glassmorphism max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-3xl border border-slate-100 dark:border-white/10"
      >
        {/* Glowing background circles */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-28 h-28 bg-brand-warning opacity-15 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-28 h-28 bg-brand-primary opacity-15 rounded-full blur-2xl"></div>

        {/* Big Rotating Loading Ring & Clock Icon */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-warning/10 border border-brand-warning/30 shadow-lg mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-dashed border-brand-warning/40"
          ></motion.div>
          <Clock className="h-9 w-9 text-brand-warning animate-pulse" />
        </div>

        {/* Typography Titles */}
        <div className="text-center">
          <span className="px-3 py-1 bg-brand-warning/20 border border-brand-warning/30 rounded-full text-brand-warning text-[10px] font-bold tracking-wider uppercase inline-block mb-3">
            Waiting For Approval
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Persetujuan Akses Tertunda
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Halo, <span className="font-bold text-brand-primary dark:text-brand-accent">{user?.firstName} {user?.lastName || ''}</span>.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            Akun Telegram Anda berhasil diverifikasi oleh sistem, namun Anda belum mendapatkan hak akses ke sistem AzurLize Team. Silakan menunggu persetujuan dari Super Admin.
          </p>
        </div>

        {/* Application details if present */}
        {application && (
          <div className="mt-5 p-3.5 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 text-center">
            <span className="text-[10px] uppercase font-bold text-brand-primary dark:text-brand-accent tracking-wider block">Posisi yang dilamar:</span>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{application.position}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Tahap Seleksi: <span className="text-brand-warning font-semibold">{application.stage}</span></p>
          </div>
        )}

        {/* Information Table Card */}
        <div className="mt-6 bg-black/5 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100 dark:border-white/5 space-y-3">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Informasi Kredensial</h4>
          
          <div className="grid grid-cols-2 gap-y-3.5 text-xs">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">Nama Telegram</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.firstName} {user?.lastName || ''}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">Username</span>
              <span className="font-mono text-brand-primary dark:text-brand-accent">@{user?.username || 'tidak_ada'}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">ID Telegram</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{user?.telegramId}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block">Waktu Log</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{loginTime}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-white/5 pt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Status Saat Ini</span>
            <span className="flex items-center gap-1.5 font-bold text-brand-warning">
              <span className="h-2 w-2 rounded-full bg-brand-warning animate-ping"></span>
              Pending Approval
            </span>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3.5">
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-brand-accent ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Perbarui Status</span>
          </button>

          {/* Contact Admin button */}
          <a
            href="https://t.me/azurlize_admin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold transition-all shadow-md hover:opacity-90 cursor-pointer"
          >
            <MessageCircle className="h-4 w-4 text-white" />
            <span>Hubungi Admin</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
