'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, ArrowRight, Layers, LogIn } from 'lucide-react';
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Layers className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-900 font-heading">
            Sync<span className="text-blue-600">Lancer</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
          <a
            href="#features"
            className="hover:text-slate-900 transition-colors duration-200"
          >
            {t.features}
          </a>
          <a
            href="#workflow"
            className="hover:text-slate-900 transition-colors duration-200"
          >
            {t.workflow}
          </a>
          <a
            href="#portal"
            className="hover:text-slate-900 transition-colors duration-200"
          >
            {t.portal}
          </a>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => onLanguageChange(lang === 'id' ? 'en' : 'id')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors duration-200"
            title="Switch Language"
          >
            <Globe className="h-3.5 w-3.5 text-slate-400" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Login Button */}
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-200"
          >
            <LogIn className="h-4 w-4" />
            <span>{t.login}</span>
          </Link>

          {/* Register Button */}
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors duration-200"
          >
            <span>{t.register}</span>
            <ArrowRight className="h-4 w-4 hidden sm:inline" />
          </Link>
        </div>
      </div>
    </header>
  );
};
