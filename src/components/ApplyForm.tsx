/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppStore } from '../store';
import { motion } from 'motion/react';
import { Send, User, Mail, Phone, Briefcase, Hash } from 'lucide-react';

const POSITIONS = [
  'Recruiter',
  'Member'
];

const COUNTRY_CODES = ['+62', '+1', '+44', '+65', '+60'];

export function ApplyForm() {
  const { user, refreshUserData, setAlert } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Native React States for input fields
  const [fullName, setFullName] = useState('');
  const [username] = useState(user?.username || ''); // Auto-detected, read-only

  useEffect(() => {
    if (user) {
      setFullName(`${user.firstName} ${user.lastName || ''}`.trim());
    }
  }, [user]);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+62');
  const [position, setPosition] = useState('');
  const [uid9kucing, setUid9kucing] = useState('');

  // Native Validation Errors State
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!fullName || fullName.trim().length < 3) {
      tempErrors.fullName = 'Nama lengkap minimal 3 karakter.';
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Format email tidak valid.';
    }
    if (!phone || phone.trim().length < 9) {
      tempErrors.phone = 'Nomor telepon minimal 9 digit.';
    }
    if (!position) {
      tempErrors.position = 'Silakan pilih posisi yang dilamar.';
    }
    if (!uid9kucing || uid9kucing.trim().length === 0) {
      tempErrors.uid9kucing = 'UID 9kucing wajib diisi.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setAlert({ message: 'Harap periksa kembali isian formulir Anda.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('/api/register', {
        fullName,
        username,
        email,
        phone: `${countryCode}${phone}`,
        position,
        uid9kucing
      });
      setAlert({ message: 'Lamaran Anda berhasil dikirim ke AzurLize Team!', type: 'success' });
      await refreshUserData();
    } catch (err: any) {
      console.error(err);
      setAlert({ 
        message: err.response?.data?.error || 'Gagal mengirimkan lamaran. Coba lagi.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glassmorphism max-w-2xl mx-auto rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-3xl border border-slate-200 dark:border-white/10"
    >
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-brand-primary opacity-20 rounded-full blur-2xl"></div>

      <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/25">
          <Briefcase className="h-5.5 w-5.5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Formulir Pendaftaran</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Silakan isi data diri Anda untuk bergabung bersama kami</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-slate-700 dark:text-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Username (Auto-detected) */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold tracking-wider text-slate-600 dark:text-slate-300 uppercase flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-brand-primary dark:text-brand-accent" /> Username (Auto-detected)
            </label>
            <input
              type="text"
              value={username || 'Tidak tersedia'}
              readOnly
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white opacity-70 cursor-not-allowed"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wider text-slate-600 dark:text-slate-300 uppercase flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-brand-primary dark:text-brand-accent" /> Nama Lengkap <span className="text-brand-danger">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
              placeholder="Contoh: Eko Kurniawan"
            />
            {errors.fullName && <p className="text-[11px] text-brand-danger mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wider text-slate-600 dark:text-slate-300 uppercase flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-brand-primary dark:text-brand-accent" /> Alamat Email <span className="text-brand-danger">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
              placeholder="budi@example.com"
            />
            {errors.email && <p className="text-[11px] text-brand-danger mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wider text-slate-600 dark:text-slate-300 uppercase flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-brand-primary dark:text-brand-accent" /> Nomor Telepon / WA <span className="text-brand-danger">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-white dark:bg-brand-dark border border-slate-200 dark:border-white/10 rounded-xl px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent transition-all text-slate-900 dark:text-white"
              >
                {COUNTRY_CODES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
                placeholder="812..."
              />
            </div>
            {errors.phone && <p className="text-[11px] text-brand-danger mt-1">{errors.phone}</p>}
          </div>

          {/* Position */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wider text-slate-600 dark:text-slate-300 uppercase flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-brand-primary dark:text-brand-accent" /> Posisi Pekerjaan <span className="text-brand-danger">*</span>
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full bg-white dark:bg-brand-dark border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent focus:border-transparent transition-all text-slate-900 dark:text-white"
            >
              <option value="" className="bg-white dark:bg-brand-dark text-slate-400 dark:text-slate-500">Pilih Posisi</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p} className="bg-white dark:bg-brand-dark text-slate-900 dark:text-white">{p}</option>
              ))}
            </select>
            {errors.position && <p className="text-[11px] text-brand-danger mt-1">{errors.position}</p>}
          </div>
        </div>

        {/* UID 9kucing */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold tracking-wider text-slate-600 dark:text-slate-300 uppercase flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5 text-brand-primary dark:text-brand-accent" /> UID 9kucing <span className="text-brand-danger">*</span>
          </label>
          <input
            type="text"
            value={uid9kucing}
            onChange={(e) => setUid9kucing(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
            placeholder="Masukkan UID 9kucing Anda"
          />
          {errors.uid9kucing && <p className="text-[11px] text-brand-danger mt-1">{errors.uid9kucing}</p>}
        </div>

        {/* Action Button */}
        <div className="border-t border-slate-200 dark:border-white/10 pt-5 mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent hover:opacity-90 shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Send className="h-4.5 w-4.5" />
                <span>Kirim Lamaran</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
