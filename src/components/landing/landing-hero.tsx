'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Play,
  Clock,
  Briefcase,
  FileText,
  DollarSign,
  Users,
  CheckSquare,
} from 'lucide-react';
import { Language, translations } from './translations';

interface LandingHeroProps {
  lang: Language;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/10 dark:bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-indigo-500/10 dark:bg-indigo-600/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800/60 bg-blue-50/80 dark:bg-blue-950/60 px-3.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-sm backdrop-blur-sm mb-6">
            <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t.hero.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl font-heading leading-tight">
            {t.hero.titleStart}{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {t.hero.description}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all"
            >
              <span>{t.hero.startFree}</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3.5 text-base font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <span>{t.hero.loginLink}</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{t.hero.stats.allInOne}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{t.hero.stats.autoInvoicing}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{t.hero.stats.clientPortal}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Mockup Showcase */}
        <div className="mt-14 relative mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-slate-900 p-2 sm:p-4 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            {/* Window header buttons */}
            <div className="flex items-center justify-between pb-3 px-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">
                  {t.mockup.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-medium text-emerald-400">
                  Live Workspace
                </span>
              </div>
            </div>

            {/* Inner Dashboard View Mockup */}
            <div className="mt-3 rounded-xl bg-slate-950 p-4 sm:p-6 text-slate-100 font-sans space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">
                      {t.mockup.activeProjects}
                    </span>
                    <Briefcase className="h-4 w-4 text-blue-400" />
                  </div>
                  <p className="mt-2 text-xl font-bold text-white">8 Proyek</p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">
                      {t.mockup.totalRevenue}
                    </span>
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="mt-2 text-xl font-bold text-white">
                    Rp 42.500.000
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">
                      {t.mockup.pendingProposals}
                    </span>
                    <FileText className="h-4 w-4 text-amber-400" />
                  </div>
                  <p className="mt-2 text-xl font-bold text-white">3 Pending</p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">
                      {t.mockup.leadsCaptured}
                    </span>
                    <Users className="h-4 w-4 text-indigo-400" />
                  </div>
                  <p className="mt-2 text-xl font-bold text-white">12 Prospect</p>
                </div>
              </div>

              {/* Bottom Mockup Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Active Live Timer */}
                <div className="rounded-lg border border-blue-500/30 bg-blue-950/20 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                      <Clock className="h-4 w-4 animate-spin text-blue-400" />
                      <span>{t.mockup.timerRunning}</span>
                    </div>
                    <p className="mt-3 text-2xl font-mono font-bold text-white">
                      02:45:18
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Klien: PT Digital Synergy
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
                    <span className="text-xs text-slate-400">
                      Tarif: Rp 250.000 / Jam
                    </span>
                    <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Tracking
                    </span>
                  </div>
                </div>

                {/* Kanban Task snippet */}
                <div className="md:col-span-2 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <CheckSquare className="h-3.5 w-3.5 text-indigo-400" />
                      {t.mockup.recentTasks}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      3 / 5 Selesai
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded bg-slate-800/80 px-3 py-2 text-xs">
                      <span className="line-through text-slate-400">
                        Finalisasi Wireframe Mobile App
                      </span>
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        Done
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded bg-slate-800/80 px-3 py-2 text-xs">
                      <span className="text-slate-200">
                        Kirim Proposal Tambahan Fitur Payment Gateway
                      </span>
                      <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                        In Progress
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded bg-slate-800/80 px-3 py-2 text-xs">
                      <span className="text-slate-200">
                        Export Invoice PDF & Notifikasi Klien
                      </span>
                      <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                        To Do
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
