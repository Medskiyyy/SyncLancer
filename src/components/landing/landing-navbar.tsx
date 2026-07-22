'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe, ArrowRight, Layers, LogIn, UserPlus } from 'lucide-react';
import { Language, translations } from './translations';

interface LandingNavbarProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  lang,
  onLanguageChange,
}) => {
  const t = translations[lang].nav;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#030712]/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-600/20"
          >
            <Layers className="h-5 w-5 text-white" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white font-heading">
              Sync<span className="text-blue-500">Lancer</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <motion.a
            whileHover={{ y: -1, color: '#60a5fa' }}
            href="#features"
            className="transition-colors"
          >
            {t.features}
          </motion.a>
          <motion.a
            whileHover={{ y: -1, color: '#60a5fa' }}
            href="#workflow"
            className="transition-colors"
          >
            {t.workflow}
          </motion.a>
          <motion.a
            whileHover={{ y: -1, color: '#60a5fa' }}
            href="#portal"
            className="transition-colors"
          >
            {t.portal}
          </motion.a>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => onLanguageChange(lang === 'id' ? 'en' : 'id')}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-blue-500/50 hover:bg-slate-800 transition-all"
            title="Switch Language"
          >
            <Globe className="h-3.5 w-3.5 text-blue-400" />
            <span>{lang.toUpperCase()}</span>
          </motion.button>

          {/* Login Button */}
          <Link href="/login">
            <motion.div
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>{t.login}</span>
            </motion.div>
          </Link>

          {/* Register Button */}
          <Link href="/register">
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              <span>{t.register}</span>
              <ArrowRight className="h-4 w-4 hidden sm:inline" />
            </motion.div>
          </Link>
        </div>
      </div>
    </header>
  );
};
