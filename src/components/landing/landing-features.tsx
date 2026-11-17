'use client';

import React from 'react';
import { BarChart3, Building2, FolderOpen, Receipt } from 'lucide-react';
import { FadeIn } from '@/components/ui/motion';
import { Language, translations } from './translations';

interface LandingFeaturesProps {
  lang: Language;
}

const SECONDARY_ICONS = [Receipt, FolderOpen, Building2, BarChart3];

export const LandingFeatures: React.FC<LandingFeaturesProps> = ({ lang }) => {
  const t = translations[lang].features;

  return (
    <section id="features" className="bg-slate-50 py-20 md:py-24 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" duration={0.4} className="max-w-2xl">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {t.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            {t.subtitle}
          </p>
        </FadeIn>

        <div className="mt-12 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="grid grid-cols-1 divide-y divide-slate-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            {t.primary.map((item) => (
              <div key={item.title} className="flex flex-col justify-between p-6 sm:p-8">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 divide-y divide-slate-200 border-t border-slate-200">
                  {item.metrics.map((m) => (
                    <div key={m.label} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-xs font-medium text-slate-500">{m.label}</span>
                      <span className="font-mono text-xs text-slate-900">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 divide-y divide-slate-200 border-t border-slate-200 bg-slate-50/50 sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0">
            {t.secondary.map((item, idx) => {
              const Icon = SECONDARY_ICONS[idx] || Receipt;
              return (
                <div key={item.title} className="p-6">
                  <Icon className="h-4 w-4 text-blue-600" strokeWidth={1.75} />
                  <h3 className="mt-4 font-heading text-base font-semibold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
