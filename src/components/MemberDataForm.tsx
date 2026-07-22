import React, { useState } from 'react';
import { useAppStore } from '../store';
import { motion } from 'motion/react';
import { Send, Cat, Mail, Phone, Loader2 } from 'lucide-react';

export function MemberDataForm() {
  const { user, setAlert } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    uidKucing: user?.uidKucing || '',
    email: user?.email || '',
    noWa: user?.noWa || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.uidKucing || !formData.email || !formData.noWa) {
      setAlert({ type: 'error', message: 'Semua kolom wajib diisi.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = useAppStore.getState().token;
      const response = await fetch('/api/user/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan data.');
      }

      setAlert({ type: 'success', message: 'Data berhasil disimpan!' });
      // The store needs to be updated with the new user data.
      // Refreshing the page is the easiest way to reload the data.
      window.location.reload();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Terjadi kesalahan server.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 max-w-xl mx-auto font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glassmorphism p-6 rounded-3xl relative overflow-hidden border border-brand-primary/20"
      >
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-brand-primary opacity-10 rounded-full blur-2xl"></div>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Lengkapi Data Diri</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Selamat! Akun Anda telah disetujui. Silakan lengkapi data berikut untuk melanjutkan ke Dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              UID Kucing
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Cat className="h-4 w-4" />
              </div>
              <input
                type="text"
                name="uidKucing"
                value={formData.uidKucing}
                onChange={handleChange}
                placeholder="Masukkan UID Kucing Anda"
                className="w-full pl-9 pr-4 py-2.5 bg-white/50 dark:bg-brand-dark/50 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-slate-900 dark:text-white transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contoh@email.com"
                className="w-full pl-9 pr-4 py-2.5 bg-white/50 dark:bg-brand-dark/50 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-slate-900 dark:text-white transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              No WhatsApp
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                name="noWa"
                value={formData.noWa}
                onChange={handleChange}
                placeholder="081234567890"
                className="w-full pl-9 pr-4 py-2.5 bg-white/50 dark:bg-brand-dark/50 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-slate-900 dark:text-white transition-all"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-secondary hover:to-brand-accent text-white font-semibold rounded-xl text-sm transition-all shadow-lg hover:shadow-brand-primary/25 disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
