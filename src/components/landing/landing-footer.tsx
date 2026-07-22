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
    <footer className="py-16 border-t border-white/[0.07] bg-[#030712] text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Layers className="h-4 w-4" />
              </div>
              <span className="text-xl font-semibold tracking-tight text-white font-heading">
                Sync<span className="text-blue-400">Lancer</span>
              </span>
            </Link>
            <p className="text-base text-slate-500 max-w-sm">
              {t.tagline}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">
              {t.navigation}
            </h4>
            <ul className="space-y-3 text-base">
              <li>
                <a
                  href="#features"
                  className="hover:text-white transition-colors duration-200"
                >
                  {translations[lang].nav.features}
                </a>
              </li>
              <li>
                <a
                  href="#workflow"
                  className="hover:text-white transition-colors duration-200"
                >
                  {translations[lang].nav.workflow}
                </a>
              </li>
              <li>
                <a
                  href="#portal"
                  className="hover:text-white transition-colors duration-200"
                >
                  {translations[lang].nav.portal}
                </a>
              </li>
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">
              {t.support}
            </h4>
            <ul className="space-y-3 text-base">
              <li>
                <Link
                  href="/login"
                  className="hover:text-white transition-colors duration-200"
                >
                  {translations[lang].nav.login}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-white transition-colors duration-200"
                >
                  {translations[lang].nav.register}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/[0.07] pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-600 gap-4">
          <p>© {currentYear} SyncLancer. {t.rights}</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer transition-colors duration-200">{t.privacy}</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors duration-200">{t.terms}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
