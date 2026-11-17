'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Language, translations } from './translations';

interface LandingHeroProps {
  lang: Language;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ lang }) => {
  const t = translations[lang].hero;

  return (
    <section className="border-b border-border bg-background pt-12 pb-16 md:pt-18 md:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h1 className="font-heading text-4xl font-bold tracking-[-0.03em] leading-[1.06] text-foreground sm:text-5xl">
              {t.title}
            </h1>

            <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.99] whitespace-nowrap"
              >
                <span>{t.startFree}</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>

              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary active:scale-[0.99] whitespace-nowrap"
              >
                {t.loginLink}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-lg border border-border bg-secondary">
              <Image
                src="/images/landing-hero-studio.jpg"
                alt={t.imageAlt}
                width={1200}
                height={750}
                priority
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-card px-4 py-2.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{t.captionLeft}</span>
                <span>{t.captionRight}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
