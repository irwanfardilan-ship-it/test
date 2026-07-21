/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal } from 'lucide-react';

const LOADING_STEPS = [
  'Initializing core systems...',
  'Connecting to Telegram WebApp...',
  'Authenticating security credentials...',
  'Checking Firestore database...',
  'Loading recruitment resources...',
  'Preparing your workspace dashboard...'
];

export function Splash({ onFinish }: { onFinish: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Step text rotation interval
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 900);

    // Smooth progress bar completion
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            onFinish();
          }, 300);
          return 100;
        }
        return prev + 4;
      });
    }, 150);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-brand-dark font-sans text-slate-900 dark:text-white transition-colors duration-300">
      {/* Dynamic Animated Ambient Mesh Circles */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary opacity-10 dark:opacity-25 blur-[120px] animate-mesh-1"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-brand-accent to-brand-primary opacity-5 dark:opacity-20 blur-[130px] animate-mesh-2"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glassmorphism max-w-md w-11/12 p-8 rounded-3xl text-center shadow-2xl backdrop-blur-3xl bg-white/80 dark:bg-brand-dark/80 text-slate-600 dark:text-slate-200 transition-all duration-300"
      >
        {/* Brand Shield Icon */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary p-[2px] shadow-lg shadow-brand-primary/20">
          <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-50 dark:bg-brand-dark/90 transition-colors">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
              className="absolute inset-0 rounded-2xl border border-brand-accent/30"
            ></motion.div>
            <Sparkles className="h-10 w-10 text-brand-accent animate-pulse" />
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 dark:from-white via-slate-600 dark:via-slate-200 to-brand-accent bg-clip-text text-transparent"
        >
          AzurLize Team
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-2 text-xs font-semibold tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase"
        >
          Recruitment Management Platform
        </motion.p>

        {/* Loading Ring & Progress Percent */}
        <div className="relative mx-auto mt-12 flex h-20 w-20 items-center justify-center">
          <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              className="text-slate-400/20 dark:text-white/10"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            {/* Active Circle Progress */}
            <motion.circle
              className="text-brand-accent"
              strokeWidth="4"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * progress) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
              transition={{ duration: 0.2 }}
            />
          </svg>
          <span className="text-sm font-mono font-bold text-brand-accent">{progress}%</span>
        </div>

        {/* Interactive Step Text */}
        <div className="mt-8 h-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={stepIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2"
            >
              <Terminal className="h-3.5 w-3.5 text-brand-secondary animate-bounce" />
              {LOADING_STEPS[stepIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Standard Horizontal Progress Bar */}
        <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent"
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut' }}
          ></motion.div>
        </div>

        <p className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          SYSTEM_VERSION: 3.1.2-ENTERPRISE • REGION: ID_JKT
        </p>
      </motion.div>
    </div>
  );
}
