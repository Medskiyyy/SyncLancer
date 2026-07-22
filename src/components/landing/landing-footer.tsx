'use client';

import React from 'react';
import Link from 'next/link';
import { Layers } from 'lucide-react';
import { Language, translations } from './translations';

interface LandingFooterProps {
  lang: Language;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ lang }) => {
  const t = translations[lang].footer;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Layers className="h-4 w-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
                Sync<span className="text-blue-600 dark:text-blue-400">Lancer</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              {t.tagline}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white font-heading mb-3">
              {t.navigation}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#features"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {translations[lang].nav.features}
                </a>
              </li>
              <li>
                <a
                  href="#workflow"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {translations[lang].nav.workflow}
                </a>
              </li>
              <li>
                <a
                  href="#portal"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {translations[lang].nav.portal}
                </a>
              </li>
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white font-heading mb-3">
              {t.support}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/login"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {translations[lang].nav.login}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {translations[lang].nav.register}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200/80 dark:border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} SyncLancer. {t.rights}</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">{t.privacy}</span>
            <span className="hover:underline cursor-pointer">{t.terms}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
