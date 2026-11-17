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
    <section className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 rounded-xl border border-slate-800 bg-slate-950 px-6 py-12 text-white sm:px-10 md:flex-row md:items-center md:py-14">
          <div className="max-w-xl">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {t.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center shrink-0">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700 whitespace-nowrap"
            >
              <span>{t.buttonRegister}</span>
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>

            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-5 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-800 whitespace-nowrap"
            >
              {t.buttonLogin}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
