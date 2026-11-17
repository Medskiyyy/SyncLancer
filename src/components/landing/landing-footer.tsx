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
    <footer className="border-t border-slate-200 bg-white py-14 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">
                <Layers className="h-4 w-4" strokeWidth={2} />
              </div>
              <span className="font-heading text-lg font-semibold tracking-tight text-slate-950">
                SyncLancer
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-slate-600">
              {t.tagline}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3.5">
              {t.navigation}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#features" className="transition-colors hover:text-slate-950">
                  {translations[lang].nav.features}
                </a>
              </li>
              <li>
                <a href="#workflow" className="transition-colors hover:text-slate-950">
                  {translations[lang].nav.workflow}
                </a>
              </li>
              <li>
                <a href="#portal" className="transition-colors hover:text-slate-950">
                  {translations[lang].nav.portal}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3.5">
              {t.account}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="transition-colors hover:text-slate-950">
                  {translations[lang].nav.login}
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition-colors hover:text-slate-950">
                  {translations[lang].nav.register}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-500">
          © {currentYear} {t.rights}
        </div>
      </div>
    </footer>
  );
};
