'use client';

import React from 'react';
import Image from 'next/image';
import { Language, translations } from './translations';

interface LandingPortalProps {
  lang: Language;
}

export const LandingPortal: React.FC<LandingPortalProps> = ({ lang }) => {
  const t = translations[lang].portal;

  return (
    <section id="portal" className="border-t border-border bg-background py-20 md:py-24 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-lg border border-border bg-secondary">
              <Image
                src="/images/landing-portal-handoff.jpg"
                alt={t.imageAlt}
                width={1000}
                height={750}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-6">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t.title}
            </h2>
            <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-muted-foreground">
              {t.subtitle}
            </p>

            <div className="mt-8 divide-y divide-border border-t border-border">
              {t.items.map((item) => (
                <div key={item.label} className="py-4">
                  <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
