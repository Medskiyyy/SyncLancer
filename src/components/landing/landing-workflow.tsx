'use client';

import React from 'react';
import { FadeIn } from '@/components/ui/motion';
import { Language, translations } from './translations';

interface LandingWorkflowProps {
  lang: Language;
}

export const LandingWorkflow: React.FC<LandingWorkflowProps> = ({ lang }) => {
  const t = translations[lang].workflow;

  return (
    <section id="workflow" className="border-t border-slate-200 bg-white py-20 md:py-24 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" duration={0.4} className="max-w-2xl">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {t.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            {t.subtitle}
          </p>
        </FadeIn>

        <div className="mt-12 grid grid-cols-1 divide-y divide-slate-200 border-y border-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
          {t.steps.map((step) => (
            <div key={step.index} className="flex flex-col justify-between py-6 md:px-8 md:first:pl-0 md:last:pr-0">
              <div>
                <span className="font-mono text-xs font-semibold text-blue-600">
                  {step.index}
                </span>
                <h3 className="mt-3 font-heading text-lg font-semibold text-slate-950">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  {step.desc}
                </p>
              </div>
              <div className="mt-6 border-t border-slate-200 pt-3 font-mono text-xs text-slate-500">
                {step.io}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
