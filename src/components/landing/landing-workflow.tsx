'use client';

import React from 'react';
import { Language, translations } from './translations';

interface LandingWorkflowProps {
  lang: Language;
}

export const LandingWorkflow: React.FC<LandingWorkflowProps> = ({ lang }) => {
  const t = translations[lang].workflow;

  return (
    <section id="workflow" className="border-t border-border bg-secondary/40 py-20 md:py-24 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {t.steps.map((step) => (
            <div
              key={step.verb}
              className="flex flex-col justify-between py-6 sm:px-6 sm:first:pl-0 sm:last:pr-0 lg:py-7"
            >
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  {step.verb}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>

              <div className="mt-6 pt-4">
                <div className="mb-2.5 h-0.5 w-6 bg-brand" />
                <p className="text-xs font-medium text-foreground">
                  {step.result}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
