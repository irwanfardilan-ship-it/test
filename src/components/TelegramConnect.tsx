/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store';
import { Send, Info, ShieldCheck, ExternalLink } from 'lucide-react';

const TelegramWidget = ({ botName, onAuth }: { botName: string, onAuth: (user: any) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !botName) return;

    (window as any).onTelegramAuth = (user: any) => {
      onAuth(user);
    };

    // Clean up previous script
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    containerRef.current.appendChild(script);
  }, [botName, onAuth]);

  return <div ref={containerRef} className="flex justify-center w-full min-h-[40px]" />;
};

export function TelegramConnect() {
  const { connectTelegramManual, setAlert } = useAppStore();
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isDetected, setIsDetected] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoDetecting, setIsAutoDetecting] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }

    const detectUser = () => {
      if (!(window as any).Telegram) {
        console.log('[Telegram Detection] window.Telegram not found yet');
        return false;
      }

      const tg = (window as any).Telegram?.WebApp;
      if (!tg) {
        console.log('[Telegram Detection] WebApp object not found');
        return false;
      }
      
      tg.ready();
      tg.expand();

      let userData = tg.initDataUnsafe?.user;
      
      // Fallback to parsing initData string if unsafe is empty
      if (!userData && tg.initData) {
        try {
          const params = new URLSearchParams(tg.initData);
          const userStr = params.get('user');
          if (userStr) {
            userData = JSON.parse(userStr);
          }
        } catch (e) {
          console.error('[Telegram Detection] Failed to parse user from initData', e);
        }
      }

      // Fallback to search parameters
      if (!userData && window.location.search) {
        try {
          const searchParams = new URLSearchParams(window.location.search);
          const tgWebAppData = searchParams.get('tgWebAppData');
          if (tgWebAppData) {
            const dataParams = new URLSearchParams(tgWebAppData);
            const userStr = dataParams.get('user');
            if (userStr) {
              userData = JSON.parse(decodeURIComponent(userStr));
            }
          }
        } catch (e) {}
      }

      // Final fallback: Check URL hash/fragment
      if (!userData && window.location.hash) {
        try {
          const hash = window.location.hash.substring(1);
          const hashParams = new URLSearchParams(hash);
          let rawData = hashParams.get('tgWebAppData') || hash;
          const dataParams = new URLSearchParams(rawData);
          const userStr = dataParams.get('user');
          
          if (userStr) {
            userData = JSON.parse(decodeURIComponent(userStr));
          }
        } catch (e) {}
      }

      if (userData) {
        const { username: tgUsername, first_name, last_name } = userData;
        if (tgUsername) {
          setUsername(tgUsername);
          setIsDetected(true);
        }
        if (first_name) setFirstName(first_name);
        if (last_name) setLastName(last_name);
        setIsAutoDetecting(false);
        return true; 
      }
      return false;
    };

    detectUser();

    const timer = setTimeout(() => {
      detectUser();
      setIsAutoDetecting(false);
    }, 3000);
    
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (detectUser() || attempts > 30) {
        clearInterval(interval);
        if (attempts > 30) setIsAutoDetecting(false);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const [debugMessage, setDebugMessage] = useState<string | null>(null);
  const [showConfigGuide, setShowConfigGuide] = useState(false);
  const [botUsernameInput, setBotUsernameInput] = useState('');
  const configuredBotName = import.meta.env.VITE_BOT_USERNAME;
  const activeBotName = configuredBotName || botUsernameInput;

  const isDevEnvironment = typeof window !== 'undefined' && 
    (window.location.hostname.includes('ais-dev') || 
     window.location.hostname.includes('localhost') || 
     window.location.hostname.includes('asia-east1.run.app'));

  const handleManualRetry = () => {
    setDebugMessage(null);
    const tg = (window as any).Telegram?.WebApp;
    
    if (!tg || (!tg.initDataUnsafe?.user && !tg.initData)) {
      setDebugMessage('Lingkungan Telegram tidak terdeteksi secara otomatis.');
      setShowConfigGuide(true);
      setIsAutoDetecting(false);
      return;
    }

    setIsAutoDetecting(true);
    
    const tryDetect = () => {
      let userData = tg.initDataUnsafe?.user;

      if (!userData && tg.initData) {
        try {
          const params = new URLSearchParams(tg.initData);
          const userStr = params.get('user');
          if (userStr) userData = JSON.parse(decodeURIComponent(userStr));
        } catch (e) {}
      }

      if (!userData && (window.location.search || window.location.hash)) {
        const params = new URLSearchParams(window.location.search || window.location.hash.substring(1));
        const tgWebAppData = params.get('tgWebAppData');
        if (tgWebAppData) {
          try {
            const dataParams = new URLSearchParams(tgWebAppData);
            const userStr = dataParams.get('user');
            if (userStr) userData = JSON.parse(decodeURIComponent(userStr));
          } catch (e) {}
        }
      }

      if (userData) {
        const { username: tgUsername, first_name, last_name } = userData;
        if (tgUsername) {
          setUsername(tgUsername);
          setIsDetected(true);
        }
        if (first_name) setFirstName(first_name);
        if (last_name) setLastName(last_name);
        setIsAutoDetecting(false);
        setDebugMessage(null);
        return true;
      }
      return false;
    };

    if (tryDetect()) return;

    setTimeout(() => {
      if (!tryDetect()) {
        setIsAutoDetecting(false);
        setDebugMessage('Data pengguna Telegram tetap tidak ditemukan.');
        setShowConfigGuide(true);
      }
    }, 1500);
  };

  const handleMockDetection = () => {
    setUsername('user_tester');
    setFirstName('Tester');
    setLastName('AzurLize');
    setIsDetected(true);
    setDebugMessage(null);
  };

  const handleTelegramAuth = async (user: any) => {
    setIsSubmitting(true);
    try {
      // user object from Telegram login widget: { id, first_name, last_name, username, photo_url, auth_date, hash }
      const cleanUsername = user.username?.replace('@', '').trim() || `user_${user.id}`;
      await connectTelegramManual(cleanUsername, user.first_name || '', user.last_name || '');
    } catch (err) {
      console.error('[TelegramConnect] Connection failed:', err);
      setDebugMessage('Gagal menghubungkan akun. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAuto = async () => {
    if (!username) return;
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

  const handleSubmitManual = async (e: React.FormEvent) => {
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
      {/* Animated Mesh Backdrops for luxurious feeling */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary opacity-10 dark:opacity-15 blur-[120px] animate-mesh-1"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-gradient-to-tr from-brand-accent to-brand-primary opacity-5 dark:opacity-10 blur-[130px] animate-mesh-2"></div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glassmorphism max-w-md w-full p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-2xl bg-white/80 dark:bg-brand-dark/80 text-slate-600 dark:text-slate-200 transition-all duration-300"
      >
        {/* Telegram Shield Icon Accent */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 p-[1px] shadow-lg shadow-blue-500/20">
          <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-slate-50 dark:bg-brand-dark/95 transition-colors">
            <Send className="h-6 w-6 text-sky-600 dark:text-sky-400 -translate-x-0.5 animate-pulse" />
          </div>
        </div>

        <div className="text-center mt-5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Hubungkan Akun Telegram</h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            {isDetected 
              ? 'Akun Telegram Anda berhasil terdeteksi.' 
              : 'Gunakan login Telegram untuk masuk dan mengakses portal rekrutmen kami secara aman.'}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {isDetected && !isManualMode ? (
            <div className="space-y-4">
              <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                <div className="h-12 w-12 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-lg">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">@{username}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{firstName} {lastName}</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleSubmitAuto}
                disabled={isSubmitting}
                className={`w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 to-blue-500 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/10 flex items-center justify-center gap-2 cursor-pointer ${
                  isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <span className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Lanjutkan sebagai @{username}</span>
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          ) : isManualMode ? (
            <form onSubmit={handleSubmitManual} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center justify-between">
                  Username Telegram
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 text-slate-900 dark:text-white"
                  placeholder="Contoh: user_anda"
                />
                {errors.username && <p className="text-[10px] text-brand-danger">{errors.username}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center justify-between">
                  Nama Depan
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 text-slate-900 dark:text-white"
                  placeholder="Masukkan nama depan"
                />
                {errors.firstName && <p className="text-[10px] text-brand-danger">{errors.firstName}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center justify-between">
                  Nama Belakang (Opsional)
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 text-slate-900 dark:text-white"
                  placeholder="Masukkan nama belakang"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 px-4 bg-gradient-to-r from-slate-600 to-slate-500 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <span className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>Hubungkan Akun Manual</span>
                      <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualMode(false)}
                  className="w-full mt-2 py-2 text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  Batal / Kembali ke Otomatis
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Login Widget via Telegram */}
              {activeBotName ? (
                <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-6 rounded-2xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium text-center">
                    Masuk dengan cepat menggunakan Telegram
                  </p>
                  <TelegramWidget botName={activeBotName} onAuth={handleTelegramAuth} />
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-4 text-center max-w-[250px]">
                    Jika tombol tidak muncul / error "Bot domain invalid", pastikan Anda sudah <code className="bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded">/setdomain</code> ke <br/><b className="text-sky-500">domain website Anda</b><br/> (tanpa https://) di @BotFather.
                  </p>
                  
                  <div className="mt-4 w-full border-t border-slate-200 dark:border-white/5 pt-4 space-y-2">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center mb-2">Alternatif lain jika terjadi error:</p>
                    <a
                      href={`https://t.me/${activeBotName}?start=connect`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2.5 px-4 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-xl text-[11px] font-bold text-center transition-all"
                    >
                      Buka via Aplikasi Telegram
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualMode(true);
                      }}
                      className="block w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-bold text-center transition-all"
                    >
                      Isi Username Manual
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-sky-500/5 border border-sky-500/10 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold uppercase tracking-wider text-[11px]">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Setup Bot Telegram</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Masukkan username bot Anda untuk menampilkan tombol login Telegram.
                  </p>
                  <input
                    type="text"
                    value={botUsernameInput}
                    onChange={(e) => setBotUsernameInput(e.target.value.replace('@', ''))}
                    placeholder="Contoh: AzurlizeBot"
                    className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                  />
                  <div className="mt-2 text-[10px] text-sky-600/80 dark:text-sky-400/80 bg-sky-500/10 p-2 rounded-lg border border-sky-500/20">
                    <p className="font-bold mb-1">Penting:</p>
                    <p>Pastikan Anda sudah mengatur domain di BotFather menggunakan perintah <code className="bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded">/setdomain</code> ke <b>URL website Anda</b> (beserta https://) agar widget login dapat berfungsi (mencegah error "Bot domain invalid").</p>
                  </div>
                </div>
              )}

              {debugMessage && (
                <p className="text-[10px] text-brand-danger text-center font-medium">
                  {debugMessage}
                </p>
              )}

              {isAutoDetecting && (
                <div className="flex items-center justify-center gap-2 text-[10px] text-amber-500">
                  <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-ping" />
                  Mencoba mendeteksi sesi Mini App...
                </div>
              )}

              <button 
                type="button"
                onClick={handleManualRetry}
                className="w-full text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-center"
              >
                Mengalami kendala? Tampilkan panduan
              </button>
            </div>
          )}

          {/* Bot Setup Guide if needed */}
          <AnimatePresence>
            {showConfigGuide && !isDetected && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mt-2 mb-2 text-[11px] space-y-2.5 transition-all">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                    <Info className="h-3.5 w-3.5" />
                    <span>Panduan Koneksi Alternatif</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Jika tombol login di atas tidak muncul atau tidak berfungsi, Anda dapat membuka aplikasi ini secara langsung dari <b>Telegram Bot</b> Anda.
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-500 dark:text-slate-400 ml-1">
                    <li>Buka <b>@BotFather</b> di Telegram.</li>
                    <li>Gunakan perintah <code className="bg-black/5 dark:bg-white/5 px-1 rounded">/newapp</code>.</li>
                    <li>Pilih bot Anda dan masukkan judul.</li>
                    <li>Masukkan URL ini sebagai Web App URL:</li>
                  </ol>
                  <div className="bg-black/10 dark:bg-white/5 p-2 rounded-lg font-mono text-[10px] border border-black/5 dark:border-white/10 text-slate-400 flex items-center justify-between gap-2">
                    <span>[ URL Web App Tersembunyi ]</span>
                    <button 
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin);
                        setAlert({ message: 'URL Web App berhasil disalin ke clipboard!', type: 'success' });
                      }}
                      className="shrink-0 text-[8px] bg-sky-500/20 px-2 py-0.5 rounded uppercase font-bold text-sky-500 hover:bg-sky-500/30 transition-all cursor-pointer"
                    >
                      Copy URL
                    </button>
                  </div>
                  <div className="pt-2 border-t border-amber-500/10 flex items-center justify-between gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowConfigGuide(false)}
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold uppercase tracking-tighter"
                    >
                      Tutup Panduan
                    </button>
                    {isDevEnvironment && (
                      <button 
                        type="button"
                        onClick={handleMockDetection}
                        className="bg-sky-500/20 text-sky-500 px-2.5 py-1 rounded-lg border border-sky-500/30 font-bold uppercase tracking-tighter hover:bg-sky-500/30 transition-all"
                      >
                        Mode Simulasi (Dev)
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/5 flex items-center justify-center gap-1.5 text-[9px] font-mono text-slate-400 dark:text-slate-500 transition-colors">
          <ShieldCheck className="h-3.5 w-3.5 text-sky-600 dark:text-sky-500/80" />
          <span>REALTIME_DATABASE_SECURE_SYNC</span>
        </div>
      </motion.div>
    </div>
  );
}
