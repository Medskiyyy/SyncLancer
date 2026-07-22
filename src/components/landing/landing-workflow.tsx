'use client';

import React from 'react';
import { UserCheck, Sliders, CheckCircle, ArrowRight } from 'lucide-react';
import { Language, translations } from './translations';

interface LandingWorkflowProps {
  lang: Language;
}

export const LandingWorkflow: React.FC<LandingWorkflowProps> = ({ lang }) => {
  const t = translations[lang].workflow;

  return (
    <section
      id="workflow"
      className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/80"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800/60 bg-blue-50/80 dark:bg-blue-950/60 px-3.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-sm mb-4">
            <span>{t.badge}</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl font-heading">
            {t.title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            {t.subtitle}
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg shadow-md shadow-blue-600/20 mb-6">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
              {t.step1Title}
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.step1Desc}
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-md shadow-indigo-600/20 mb-6">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
              {t.step2Title}
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.step2Desc}
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg shadow-md shadow-emerald-600/20 mb-6">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
              {t.step3Title}
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.step3Desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
