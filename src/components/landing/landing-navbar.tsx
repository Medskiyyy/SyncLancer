'use client';

import React from 'react';
import Link from 'next/link';
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Layers className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
              Sync<span className="text-blue-600 dark:text-blue-400">Lancer</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a
            href="#features"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {t.features}
          </a>
          <a
            href="#workflow"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {t.workflow}
          </a>
          <a
            href="#portal"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {t.portal}
          </a>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Language Selector Toggle */}
          <button
            type="button"
            onClick={() => onLanguageChange(lang === 'id' ? 'en' : 'id')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Switch Language"
          >
            <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Login Button */}
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            <span>{t.login}</span>
          </Link>

          {/* Register CTA Button */}
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <UserPlus className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">{t.register}</span>
            <span className="sm:hidden">{t.register}</span>
            <ArrowRight className="h-4 w-4 hidden sm:inline" />
          </Link>
        </div>
      </div>
    </header>
  );
};
