/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../store';
import { Send, ShieldCheck, User } from 'lucide-react';

export function TelegramConnect() {
  const { connectTelegramManual } = useAppStore();
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    const cleanUsername = username.replace('@', '').trim();
    
    if (!username || cleanUsername.length < 3) {
      tempErrors.username = 'Username Telegram minimal 3 karakter.';
    }
    if (!firstName || firstName.trim().length === 0) {
      tempErrors.firstName = 'Nama depan wajib diisi.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      const cleanUsername = username.replace('@', '').trim();
      await connectTelegramManual(cleanUsername, firstName, lastName);
    } catch (err) {
      console.error('[TelegramConnect] Connection failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex items-center justify-center px-4 py-12 relative overflow-hidden text-slate-900 dark:text-white font-sans transition-colors duration-300">
      {/* Animated Mesh Backdrops for elegant theme */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary opacity-10 dark:opacity-15 blur-[120px] animate-mesh-1"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-gradient-to-tr from-brand-accent to-brand-primary opacity-5 dark:opacity-10 blur-[130px] animate-mesh-2"></div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glassmorphism max-w-md w-full p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-2xl bg-white/80 dark:bg-brand-dark/80 text-slate-600 dark:text-slate-200 transition-all duration-300"
      >
        {/* User Icon Accent */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 p-[1px] shadow-lg shadow-blue-500/20">
          <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-slate-50 dark:bg-brand-dark/95 transition-colors">
            <User className="h-6 w-6 text-sky-600 dark:text-sky-400" />
          </div>
        </div>

        <div className="text-center mt-5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Masuk ke Portal</h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            Silakan masukkan detail akun Telegram Anda di bawah untuk mengakses portal rekrutmen kami.
          </p>
        </div>

        <div className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                Username Telegram
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 text-slate-900 dark:text-white"
                  placeholder="username_anda"
                  required
                />
              </div>
              {errors.username && <p className="text-[10px] text-brand-danger font-medium">{errors.username}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  Nama Depan
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 text-slate-900 dark:text-white"
                  placeholder="Nama Depan"
                  required
                />
                {errors.firstName && <p className="text-[10px] text-brand-danger font-medium">{errors.firstName}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  Nama Belakang
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 text-slate-900 dark:text-white"
                  placeholder="Opsional"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 to-blue-500 hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/10 flex items-center justify-center gap-2 cursor-pointer ${
                  isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <span className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Hubungkan & Masuk</span>
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/5 flex items-center justify-center gap-1.5 text-[9px] font-mono text-slate-400 dark:text-slate-500 transition-colors">
          <ShieldCheck className="h-3.5 w-3.5 text-sky-600 dark:text-sky-500/80" />
          <span>REALTIME_DATABASE_SECURE_SYNC</span>
        </div>
      </motion.div>
    </div>
  );
}
