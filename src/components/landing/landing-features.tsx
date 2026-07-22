'use client';

import React from 'react';
import {
  Users,
  FileText,
  LayoutGrid,
  Clock,
  Receipt,
  ShieldCheck,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { Language, translations } from './translations';

interface LandingFeaturesProps {
  lang: Language;
}

export const LandingFeatures: React.FC<LandingFeaturesProps> = ({ lang }) => {
  const t = translations[lang].features;

  return (
    <section id="features" className="py-20 md:py-28 bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/80 dark:bg-indigo-950/60 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm backdrop-blur-sm mb-4">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{t.badge}</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl font-heading">
            {t.title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            {t.subtitle}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. CRM & Lead Management */}
          <div className="group rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 p-6 hover:shadow-xl hover:border-blue-500/50 transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <span className="mt-5 inline-block text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
              {t.crm.tag}
            </span>
            <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white font-heading">
              {t.crm.title}
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.crm.desc}
            </p>
          </div>

          {/* 2. Proposal Builder */}
          <div className="group rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 p-6 hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6" />
            </div>
            <span className="mt-5 inline-block text-[11px] font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
              {t.proposals.tag}
            </span>
            <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white font-heading">
              {t.proposals.title}
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.proposals.desc}
            </p>
          </div>

          {/* 3. Project & Task Kanban */}
          <div className="group rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 p-6 hover:shadow-xl hover:border-purple-500/50 transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <span className="mt-5 inline-block text-[11px] font-bold tracking-wider text-purple-600 dark:text-purple-400 uppercase">
              {t.kanban.tag}
            </span>
            <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white font-heading">
              {t.kanban.title}
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.kanban.desc}
            </p>
          </div>

          {/* 4. Time Tracking */}
          <div className="group rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 p-6 hover:shadow-xl hover:border-amber-500/50 transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6" />
            </div>
            <span className="mt-5 inline-block text-[11px] font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase">
              {t.timeTracking.tag}
            </span>
            <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white font-heading">
              {t.timeTracking.title}
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.timeTracking.desc}
            </p>
          </div>

          {/* 5. Invoice System */}
          <div className="group rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 p-6 hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Receipt className="h-6 w-6" />
            </div>
            <span className="mt-5 inline-block text-[11px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
              {t.invoicing.tag}
            </span>
            <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white font-heading">
              {t.invoicing.title}
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.invoicing.desc}
            </p>
          </div>

          {/* 6. Client Portal */}
          <div
            id="portal"
            className="group rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 p-6 hover:shadow-xl hover:border-rose-500/50 transition-all duration-300"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-600/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="mt-5 inline-block text-[11px] font-bold tracking-wider text-rose-600 dark:text-rose-400 uppercase">
              {t.clientPortal.tag}
            </span>
            <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white font-heading">
              {t.clientPortal.title}
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.clientPortal.desc}
            </p>
          </div>
        </div>

        {/* Full width highlight banner for Cloud Storage */}
        <div className="mt-6 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-gradient-to-r from-blue-50/60 via-indigo-50/60 to-slate-50/60 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-slate-900/30 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <HardDrive className="h-7 w-7" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                {t.storage.tag}
              </span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.storage.title}
              </h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                {t.storage.desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
