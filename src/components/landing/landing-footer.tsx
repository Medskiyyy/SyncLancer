'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import { Language, translations } from './translations';

interface LandingFooterProps {
  lang: Language;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ lang }) => {
  const t = translations[lang].footer;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background py-12 text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-flex items-center">
              <BrandLogo />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t.tagline}
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground mb-3.5">
              {t.navigation}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#features" className="transition-colors hover:text-foreground">
                  {translations[lang].nav.features}
                </a>
              </li>
              <li>
                <a href="#workflow" className="transition-colors hover:text-foreground">
                  {translations[lang].nav.workflow}
                </a>
              </li>
              <li>
                <a href="#portal" className="transition-colors hover:text-foreground">
                  {translations[lang].nav.portal}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground mb-3.5">
              {t.account}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="transition-colors hover:text-foreground">
                  {translations[lang].nav.login}
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition-colors hover:text-foreground">
                  {translations[lang].nav.register}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          © {currentYear} {t.rights}
        </div>
      </div>
    </footer>
  );
};
