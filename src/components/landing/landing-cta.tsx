'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Language, translations } from './translations';

interface LandingCTAProps {
  lang: Language;
}

export const LandingCTA: React.FC<LandingCTAProps> = ({ lang }) => {
  const t = translations[lang].cta;

  return (
    <section className="border-t border-border bg-secondary/60 py-20 md:py-24 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center shrink-0">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 whitespace-nowrap"
            >
              <span>{t.buttonRegister}</span>
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>

            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary whitespace-nowrap"
            >
              {t.buttonLogin}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
