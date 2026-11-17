'use client';

import React from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { ThemeToggle } from '@/components/theme-toggle';
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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <BrandLogo />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="whitespace-nowrap transition-colors hover:text-foreground">
            {t.features}
          </a>
          <a href="#workflow" className="whitespace-nowrap transition-colors hover:text-foreground">
            {t.workflow}
          </a>
          <a href="#portal" className="whitespace-nowrap transition-colors hover:text-foreground">
            {t.portal}
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onLanguageChange(lang === 'id' ? 'en' : 'id')}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
            title="Switch Language"
          >
            <Globe className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>{lang.toUpperCase()}</span>
          </button>

          <ThemeToggle />

          <Link
            href="/login"
            className="hidden sm:inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground whitespace-nowrap"
          >
            {t.login}
          </Link>

          <Link
            href="/register"
            className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 whitespace-nowrap"
          >
            {t.register}
          </Link>
        </div>
      </div>
    </header>
  );
};
