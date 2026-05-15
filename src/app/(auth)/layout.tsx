'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-2">
            M
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">MailFlow</h1>
          <p className="text-slate-500 dark:text-slate-400">Production-grade Email Marketing</p>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
