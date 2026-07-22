'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  Download,
} from 'lucide-react';
import { Language, translations } from './translations';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';

interface LandingHeroProps {
  lang: Language;
}

type TabType = 'crm' | 'proposals' | 'kanban' | 'timer';

export const LandingHero: React.FC<LandingHeroProps> = ({ lang }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<TabType>('crm');

  const tabs: TabType[] = ['crm', 'proposals', 'kanban', 'timer'];

  return (
    <section className="relative overflow-hidden pt-16 pb-24 md:pt-20 md:pb-28 bg-white text-slate-900">
      {/* Subtle background — clean and airy */}
      <div className="absolute inset-0 opacity-[0.4]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-white" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Text Content */}
        <StaggerContainer className="text-center max-w-4xl mx-auto" delayChildren={0.06} staggerChildren={0.08}>
          {/* Badge */}
          <StaggerItem>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-medium text-slate-500 mb-6">
              <span>{t.hero.badge}</span>
            </div>
          </StaggerItem>

          {/* Headline */}
          <StaggerItem>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl md:text-6xl font-heading leading-[1.1]">
              {t.hero.titleStart}{' '}
              <span className="text-blue-600">
                {t.hero.titleHighlight}
              </span>
            </h1>
          </StaggerItem>

          {/* Subtext */}
          <StaggerItem>
            <p className="mt-6 text-lg sm:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
              {t.hero.description}
            </p>
          </StaggerItem>

          {/* CTAs */}
          <StaggerItem>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register" className="w-full sm:w-auto">
                <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer">
                  <span>{t.hero.startFree}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>

              <Link href="/login" className="w-full sm:w-auto">
                <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-6 py-3 text-base font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer">
                  <span>{t.hero.loginLink}</span>
                </div>
              </Link>
            </div>
          </StaggerItem>

          {/* Trust Highlights */}
          <StaggerItem>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-slate-400">
              {[
                t.hero.stats.allInOne,
                t.hero.stats.autoInvoicing,
                t.hero.stats.clientPortal,
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  <span>{stat}</span>
                </div>
              ))}
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Product Mockup */}
        <FadeIn delay={0.3} duration={0.7}>
          <div className="mt-14 relative mx-auto max-w-5xl">
            <div className="rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
              {/* Top Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                </div>
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`relative px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        activeTab === tab
                          ? 'text-slate-900'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeHeroTab"
                          className="absolute inset-0 rounded-md bg-slate-100 border border-slate-200"
                          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        />
                      )}
                      <span className="relative z-10">{t.hero.tabs[tab]}</span>
                    </button>
                  ))}
                </div>
                <div className="w-10" />
              </div>

              {/* Content Area */}
              <div className="min-h-[300px] p-5 sm:p-6 text-slate-900 relative bg-slate-50/50">
                <AnimatePresence mode="wait">
                  {activeTab === 'crm' && (
                    <motion.div
                      key="crm"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          {t.mockup.crmView.title}
                        </h3>
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">
                          3 Active Prospects
                        </span>
                      </div>

                      <div className="space-y-2">
                        {[
                          { lead: t.mockup.crmView.lead1, value: t.mockup.crmView.lead1Value, stage: t.mockup.crmView.lead1Stage, stageColor: 'bg-amber-50 text-amber-700 border-amber-100' },
                          { lead: t.mockup.crmView.lead2, value: t.mockup.crmView.lead2Value, stage: t.mockup.crmView.lead2Stage, stageColor: 'bg-blue-50 text-blue-700 border-blue-100' },
                          { lead: t.mockup.crmView.lead3, value: t.mockup.crmView.lead3Value, stage: t.mockup.crmView.lead3Stage, stageColor: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-sm"
                          >
                            <span className="font-medium text-slate-700">{item.lead}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-slate-900">{item.value}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${item.stageColor}`}>
                                {item.stage}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'proposals' && (
                    <motion.div
                      key="proposals"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div>
                          <span className="text-xs font-mono text-slate-400">{t.mockup.proposalView.proposalNum}</span>
                          <h3 className="text-sm font-semibold text-slate-900">{t.mockup.proposalView.client}</h3>
                        </div>
                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-100">
                          <Download className="h-3.5 w-3.5" />
                          {t.mockup.proposalView.status}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {t.mockup.proposalView.services.map((srv, idx) => (
                          <div key={idx} className="flex items-center justify-between rounded-lg bg-white p-3 text-sm border border-slate-200">
                            <span className="text-slate-600">{srv.name}</span>
                            <span className="font-medium text-slate-900">{srv.price}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-sm">
                        <span className="text-slate-500">Total Proposal Value:</span>
                        <span className="text-lg font-semibold text-emerald-600">{t.mockup.proposalView.subtotal}</span>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'kanban' && (
                    <motion.div
                      key="kanban"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-3"
                    >
                      <div className="rounded-lg bg-white p-3 border border-slate-200 space-y-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">{t.mockup.kanbanView.todo}</span>
                        <div className="rounded bg-slate-50 p-2.5 text-xs text-slate-700 border border-slate-100">{t.mockup.kanbanView.task1}</div>
                      </div>
                      <div className="rounded-lg bg-white p-3 border border-slate-200 space-y-2">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">{t.mockup.kanbanView.inProgress}</span>
                        <div className="rounded bg-blue-50 p-2.5 text-xs text-blue-800 border border-blue-100">{t.mockup.kanbanView.task2}</div>
                      </div>
                      <div className="rounded-lg bg-white p-3 border border-slate-200 space-y-2">
                        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block mb-1">{t.mockup.kanbanView.done}</span>
                        <div className="rounded bg-emerald-50 p-2.5 text-xs text-emerald-800 border border-emerald-100">{t.mockup.kanbanView.task3}</div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'timer' && (
                    <motion.div
                      key="timer"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18 }}
                      className="flex flex-col md:flex-row items-center justify-between gap-5 p-1"
                    >
                      <div className="space-y-1 text-center md:text-left">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100">
                          <Clock className="h-3.5 w-3.5 animate-spin text-blue-600" />
                          Live Timer Active
                        </span>
                        <h4 className="text-base font-semibold text-slate-900">{t.mockup.timerView.project}</h4>
                        <p className="text-xs text-slate-500">{t.mockup.timerView.client} | {t.mockup.timerView.hourlyRate}</p>
                      </div>
                      <div className="flex flex-col items-center md:items-end gap-2">
                        <div className="text-2xl font-mono font-semibold text-slate-900 tracking-wider">{t.mockup.timerView.timerRunning}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Total Billable:</span>
                          <span className="text-base font-semibold text-emerald-600">{t.mockup.timerView.billableTotal}</span>
                        </div>
                        <button type="button" className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 transition-colors">
                          {t.mockup.timerView.createInvoiceAction}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
