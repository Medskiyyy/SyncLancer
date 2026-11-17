'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Layers } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
            <Layers className="h-4 w-4" strokeWidth={2} />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight text-slate-950">
            SyncLancer
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="whitespace-nowrap transition-colors hover:text-slate-950">
            {t.features}
          </a>
          <a href="#workflow" className="whitespace-nowrap transition-colors hover:text-slate-950">
            {t.workflow}
          </a>
          <a href="#portal" className="whitespace-nowrap transition-colors hover:text-slate-950">
            {t.portal}
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => onLanguageChange(lang === 'id' ? 'en' : 'id')}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
            title="Switch Language"
          >
            <Globe className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.75} />
            <span>{lang.toUpperCase()}</span>
          </button>

          <Link
            href="/login"
            className="hidden sm:inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 whitespace-nowrap"
          >
            {t.login}
          </Link>

          <Link
            href="/register"
            className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 whitespace-nowrap"
          >
            {t.register}
          </Link>
        </div>
      </div>
    </header>
  );
};
