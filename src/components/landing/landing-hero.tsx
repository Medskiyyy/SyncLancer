'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Briefcase,
  FileText,
  Users,
  CheckSquare,
  DollarSign,
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
    <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 bg-[#030712] text-slate-100">
      {/* Subtle grid pattern overlay for depth — purposeful, not decorative */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Text Content */}
        <StaggerContainer className="text-center max-w-4xl mx-auto" delayChildren={0.1}>
          {/* Badge */}
          <StaggerItem>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-slate-400 mb-8">
              <span>{t.hero.badge}</span>
            </div>
          </StaggerItem>

          {/* Headline */}
          <StaggerItem>
            <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl md:text-7xl font-heading leading-[1.1]">
              {t.hero.titleStart}{' '}
              <span className="text-blue-400">
                {t.hero.titleHighlight}
              </span>
            </h1>
          </StaggerItem>

          {/* Subtext */}
          <StaggerItem>
            <p className="mt-8 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              {t.hero.description}
            </p>
          </StaggerItem>

          {/* CTAs */}
          <StaggerItem>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-lg bg-blue-600 px-7 py-3.5 text-base font-medium text-white hover:bg-blue-500 transition-colors cursor-pointer">
                  <span>{t.hero.startFree}</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Link>

              <Link href="/login" className="w-full sm:w-auto">
                <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-lg border border-white/10 px-6 py-3.5 text-base font-medium text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/[0.03] transition-colors cursor-pointer">
                  <span>{t.hero.loginLink}</span>
                </div>
              </Link>
            </div>
          </StaggerItem>

          {/* Trust Highlights */}
          <StaggerItem>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-slate-400" />
                <span>{t.hero.stats.allInOne}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-slate-400" />
                <span>{t.hero.stats.autoInvoicing}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-slate-400" />
                <span>{t.hero.stats.clientPortal}</span>
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Product Mockup */}
        <FadeIn delay={0.3} duration={0.7}>
          <div className="mt-16 relative mx-auto max-w-5xl">
            {/* Browser Chrome */}
            <div className="rounded-xl border border-white/[0.07] bg-[#0a0f1e] overflow-hidden">
              {/* Top Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                </div>
                <div className="flex items-center gap-1.5 bg-[#050816] px-3 py-1 rounded-lg border border-white/[0.05]">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        activeTab === tab
                          ? 'text-white'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeHeroTab"
                          className="absolute inset-0 rounded-md bg-white/[0.08]"
                          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        />
                      )}
                      <span className="relative z-10">{t.hero.tabs[tab]}</span>
                    </button>
                  ))}
                </div>
                <div className="w-16" />
              </div>

              {/* Content Area */}
              <div className="min-h-[320px] p-5 sm:p-7 text-slate-100 relative">
                <AnimatePresence mode="wait">
                  {activeTab === 'crm' && (
                    <motion.div
                      key="crm"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-400" />
                          {t.mockup.crmView.title}
                        </h3>
                        <span className="rounded bg-blue-500/15 px-2.5 py-1 text-xs font-medium text-blue-300">
                          3 Active Prospects
                        </span>
                      </div>

                      <div className="space-y-2">
                        {[
                          { lead: t.mockup.crmView.lead1, value: t.mockup.crmView.lead1Value, stage: t.mockup.crmView.lead1Stage, dot: 'bg-amber-400', stageBg: 'bg-amber-500/15', stageText: 'text-amber-300' },
                          { lead: t.mockup.crmView.lead2, value: t.mockup.crmView.lead2Value, stage: t.mockup.crmView.lead2Stage, dot: 'bg-blue-400', stageBg: 'bg-blue-500/15', stageText: 'text-blue-300' },
                          { lead: t.mockup.crmView.lead3, value: t.mockup.crmView.lead3Value, stage: t.mockup.crmView.lead3Stage, dot: 'bg-emerald-400', stageBg: 'bg-emerald-500/15', stageText: 'text-emerald-300' },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-2 w-2 rounded-full ${item.dot}`} />
                              <span className="font-medium text-slate-200">{item.lead}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-slate-200">{item.value}</span>
                              <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${item.stageBg} ${item.stageText}`}>
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
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                        <div>
                          <span className="text-xs font-mono text-slate-500">
                            {t.mockup.proposalView.proposalNum}
                          </span>
                          <h3 className="text-sm font-semibold text-white">
                            {t.mockup.proposalView.client}
                          </h3>
                        </div>
                        <span className="flex items-center gap-1.5 rounded bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
                          <Download className="h-3.5 w-3.5" />
                          {t.mockup.proposalView.status}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {t.mockup.proposalView.services.map((srv, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg bg-white/[0.02] p-3 text-sm border border-white/[0.06]"
                          >
                            <span className="text-slate-300">{srv.name}</span>
                            <span className="font-medium text-white">{srv.price}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-white/[0.07] text-sm">
                        <span className="text-slate-500">Total Proposal Value:</span>
                        <span className="text-xl font-semibold text-emerald-400">
                          {t.mockup.proposalView.subtotal}
                        </span>
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
                      <div className="rounded-lg bg-white/[0.02] p-3 border border-white/[0.06] space-y-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                          {t.mockup.kanbanView.todo}
                        </span>
                        <div className="rounded bg-white/[0.04] p-2.5 text-xs text-slate-300 border border-white/[0.04]">
                          {t.mockup.kanbanView.task1}
                        </div>
                      </div>

                      <div className="rounded-lg bg-white/[0.02] p-3 border border-white/[0.06] space-y-2">
                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-2">
                          {t.mockup.kanbanView.inProgress}
                        </span>
                        <div className="rounded bg-blue-500/10 p-2.5 text-xs text-slate-200 border border-blue-500/20">
                          {t.mockup.kanbanView.task2}
                        </div>
                      </div>

                      <div className="rounded-lg bg-white/[0.02] p-3 border border-white/[0.06] space-y-2">
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-2">
                          {t.mockup.kanbanView.done}
                        </span>
                        <div className="rounded bg-emerald-500/10 p-2.5 text-xs text-emerald-200 border border-emerald-500/20">
                          {t.mockup.kanbanView.task3}
                        </div>
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
                      className="flex flex-col md:flex-row items-center justify-between gap-6 p-2"
                    >
                      <div className="space-y-2 text-center md:text-left">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-300">
                          <Clock className="h-3.5 w-3.5 animate-spin text-blue-400" />
                          Live Timer Active
                        </span>
                        <h4 className="text-base font-semibold text-white">
                          {t.mockup.timerView.project}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {t.mockup.timerView.client} | {t.mockup.timerView.hourlyRate}
                        </p>
                      </div>

                      <div className="flex flex-col items-center md:items-end gap-3">
                        <div className="text-3xl font-mono font-semibold text-white tracking-wider">
                          {t.mockup.timerView.timerRunning}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Total Billable:</span>
                          <span className="text-lg font-semibold text-emerald-400">
                            {t.mockup.timerView.billableTotal}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                        >
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
