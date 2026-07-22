'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Briefcase,
  FileText,
  Users,
  CheckSquare,
  DollarSign,
  Download,
  Plus,
  Play,
} from 'lucide-react';
import { Language, translations } from './translations';

interface LandingHeroProps {
  lang: Language;
}

type TabType = 'crm' | 'proposals' | 'kanban' | 'timer';

export const LandingHero: React.FC<LandingHeroProps> = ({ lang }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<TabType>('crm');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 200, damping: 20 },
    },
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-[#030712] text-slate-100">
      {/* Background Decorative Radial Gradient Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-block">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-4 py-1.5 text-xs font-semibold text-blue-400 backdrop-blur-md mb-6 shadow-lg shadow-blue-500/5">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>{t.hero.badge}</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl font-heading leading-[1.1]"
          >
            {t.hero.titleStart}{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500 bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            {t.hero.description}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-blue-600/25 hover:bg-blue-500 transition-all cursor-pointer"
              >
                <span>{t.hero.startFree}</span>
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </Link>

            <Link href="/login" className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-slate-900/60 px-6 py-3.5 text-base font-semibold text-slate-200 hover:bg-slate-800/80 transition-all cursor-pointer backdrop-blur-sm"
              >
                <span>{t.hero.loginLink}</span>
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust Highlights */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium text-slate-400"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{t.hero.stats.allInOne}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{t.hero.stats.autoInvoicing}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{t.hero.stats.clientPortal}</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Live Interactive Hero Showcase Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-14 relative mx-auto max-w-5xl"
        >
          {/* Outer Framed Window */}
          <div className="rounded-2xl border border-white/10 bg-slate-950 p-2 sm:p-4 shadow-2xl shadow-blue-950/20 backdrop-blur-2xl">
            {/* Top Toolbar with Window controls & Interactive Tabs */}
            <div className="flex flex-col sm:flex-row items-center justify-between pb-3 px-3 border-b border-white/10 gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400 hidden sm:inline">
                  SyncLancer OS v2.0
                </span>
              </div>

              {/* Interactive Module Tabs Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-white/10">
                {(['crm', 'proposals', 'kanban', 'timer'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      activeTab === tab
                        ? 'text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeHeroTab"
                        className="absolute inset-0 rounded-lg bg-blue-600 shadow-md shadow-blue-600/30"
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      />
                    )}
                    <span className="relative z-10">{t.hero.tabs[tab]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic View Content Box */}
            <div className="mt-3 min-h-[340px] rounded-xl bg-[#080d1a] p-4 sm:p-6 text-slate-100 font-sans border border-white/5 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {/* 1. CRM View */}
                {activeTab === 'crm' && (
                  <motion.div
                    key="crm"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-400" />
                          {t.mockup.crmView.title}
                        </h3>
                      </div>
                      <span className="rounded bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-300">
                        3 Active Prospects
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-amber-400" />
                          <span className="font-medium text-slate-200">
                            {t.mockup.crmView.lead1}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-emerald-400">
                            {t.mockup.crmView.lead1Value}
                          </span>
                          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                            {t.mockup.crmView.lead1Stage}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-blue-400" />
                          <span className="font-medium text-slate-200">
                            {t.mockup.crmView.lead2}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-emerald-400">
                            {t.mockup.crmView.lead2Value}
                          </span>
                          <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                            {t.mockup.crmView.lead2Stage}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-emerald-400" />
                          <span className="font-medium text-slate-200">
                            {t.mockup.crmView.lead3}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-emerald-400">
                            {t.mockup.crmView.lead3Value}
                          </span>
                          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                            {t.mockup.crmView.lead3Stage}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. Proposals View */}
                {activeTab === 'proposals' && (
                  <motion.div
                    key="proposals"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <span className="text-xs font-mono text-slate-400">
                          {t.mockup.proposalView.proposalNum}
                        </span>
                        <h3 className="text-sm font-bold text-white">
                          {t.mockup.proposalView.client}
                        </h3>
                      </div>
                      <span className="flex items-center gap-1.5 rounded bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                        <Download className="h-3.5 w-3.5" />
                        {t.mockup.proposalView.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {t.mockup.proposalView.services.map((srv, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded bg-slate-900/60 p-3 text-xs sm:text-sm border border-white/5"
                        >
                          <span className="text-slate-300">{srv.name}</span>
                          <span className="font-semibold text-white">
                            {srv.price}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-white/10 text-sm">
                      <span className="text-slate-400">Total Proposal Value:</span>
                      <span className="text-xl font-bold text-emerald-400">
                        {t.mockup.proposalView.subtotal}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* 3. Kanban View */}
                {activeTab === 'kanban' && (
                  <motion.div
                    key="kanban"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3"
                  >
                    <div className="rounded-lg bg-slate-900/70 p-3 border border-white/5 space-y-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                        {t.mockup.kanbanView.todo}
                      </span>
                      <div className="rounded bg-slate-800/80 p-2.5 text-xs text-slate-200 border border-white/5">
                        {t.mockup.kanbanView.task1}
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-900/70 p-3 border border-white/5 space-y-2">
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-2">
                        {t.mockup.kanbanView.inProgress}
                      </span>
                      <div className="rounded bg-blue-950/50 p-2.5 text-xs text-slate-100 border border-blue-500/30">
                        {t.mockup.kanbanView.task2}
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-900/70 p-3 border border-white/5 space-y-2">
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-2">
                        {t.mockup.kanbanView.done}
                      </span>
                      <div className="rounded bg-emerald-950/40 p-2.5 text-xs text-emerald-200 border border-emerald-500/30">
                        {t.mockup.kanbanView.task3}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 4. Timer View */}
                {activeTab === 'timer' && (
                  <motion.div
                    key="timer"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col md:flex-row items-center justify-between gap-6 p-2"
                  >
                    <div className="space-y-2 text-center md:text-left">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
                        <Clock className="h-3.5 w-3.5 animate-spin text-blue-400" />
                        Live Timer Active
                      </span>
                      <h4 className="text-base font-bold text-white">
                        {t.mockup.timerView.project}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {t.mockup.timerView.client} | {t.mockup.timerView.hourlyRate}
                      </p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-3">
                      <div className="text-3xl font-mono font-bold text-white tracking-wider">
                        {t.mockup.timerView.timerRunning}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Total Billable:</span>
                        <span className="text-lg font-bold text-emerald-400">
                          {t.mockup.timerView.billableTotal}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
                      >
                        {t.mockup.timerView.createInvoiceAction}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
