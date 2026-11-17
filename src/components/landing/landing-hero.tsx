'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  FileText,
  FolderKanban,
  GitBranch,
  Receipt,
} from 'lucide-react';
import { Language, translations } from './translations';

interface LandingHeroProps {
  lang: Language;
}

type TabType = 'crm' | 'proposals' | 'kanban' | 'billing';

export const LandingHero: React.FC<LandingHeroProps> = ({ lang }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<TabType>('crm');

  const navItems: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'crm', label: t.hero.tabs.crm, icon: GitBranch },
    { id: 'proposals', label: t.hero.tabs.proposals, icon: FileText },
    { id: 'kanban', label: t.hero.tabs.kanban, icon: FolderKanban },
    { id: 'billing', label: t.hero.tabs.billing, icon: Receipt },
  ];

  const stageStyle = (stage: string) => {
    if (stage === 'Won' || stage === 'Paid' || stage === 'Approved') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (stage === 'Proposal Sent' || stage === 'Sent') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

  return (
    <section className="border-b border-slate-200 bg-white pt-12 pb-16 md:pt-16 md:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              {t.hero.title}
            </h1>

            <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-slate-600 sm:text-lg">
              {t.hero.description}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:translate-y-px whitespace-nowrap"
              >
                <span>{t.hero.startFree}</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>

              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 active:translate-y-px whitespace-nowrap"
              >
                {t.hero.loginLink}
              </Link>
            </div>

            <div className="mt-9 border-t border-slate-200 pt-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-slate-600">
                {t.hero.modulesStrip.map((item, idx) => (
                  <React.Fragment key={item}>
                    <span>{item}</span>
                    {idx < t.hero.modulesStrip.length - 1 && (
                      <span className="text-slate-300">/</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="border-b border-slate-200 bg-slate-50 p-3 md:col-span-4 md:border-r md:border-b-0 md:p-4">
                  <div className="border-b border-slate-200 pb-3">
                    <div className="text-sm font-semibold text-slate-950">{t.hero.workspaceName}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-slate-500">{t.hero.workspacePlan}</div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-1.5 md:grid-cols-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveTab(item.id)}
                          className={`relative flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                            isActive
                              ? 'text-slate-950'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="heroWorkspaceTab"
                              className="absolute inset-0 rounded-md border border-slate-200 bg-white shadow-xs"
                              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                            />
                          )}
                          <Icon className={`relative z-10 h-3.5 w-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="relative z-10 truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="min-h-[300px] bg-white p-4 sm:p-5 md:col-span-8">
                  <AnimatePresence mode="wait">
                    {activeTab === 'crm' && (
                      <motion.div
                        key="crm"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.16 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <span className="text-sm font-semibold text-slate-950">{t.mockup.crmView.title}</span>
                          <span className="font-mono text-xs text-slate-500">{t.mockup.crmView.countLabel}</span>
                        </div>
                        <div className="divide-y divide-slate-200 border border-slate-200 rounded-md">
                          {t.mockup.crmView.rows.map((row) => (
                            <div key={row.client} className="flex flex-col gap-2 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-slate-900">{row.client}</div>
                                <div className="truncate text-xs text-slate-500">{row.scope}</div>
                              </div>
                              <div className="flex items-center justify-between gap-3 sm:justify-end">
                                <span className="font-mono text-xs font-semibold tabular-nums text-slate-900">
                                  {row.value}
                                </span>
                                <span className={`rounded border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${stageStyle(row.stage)}`}>
                                  {row.stage}
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
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.16 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div>
                            <div className="font-mono text-xs text-slate-500">{t.mockup.proposalView.number}</div>
                            <div className="text-sm font-semibold text-slate-950">{t.mockup.proposalView.client}</div>
                          </div>
                          <span className={`rounded border px-2.5 py-0.5 text-xs font-medium ${stageStyle(t.mockup.proposalView.status)}`}>
                            {t.mockup.proposalView.status}
                          </span>
                        </div>
                        <div className="divide-y divide-slate-200 rounded-md border border-slate-200">
                          {t.mockup.proposalView.services.map((srv) => (
                            <div key={srv.name} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs">
                              <span className="text-slate-700">{srv.name}</span>
                              <span className="font-mono font-semibold tabular-nums text-slate-950 whitespace-nowrap">{srv.price}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between px-3.5 py-2 text-xs text-slate-500 bg-slate-50">
                            <span>{t.mockup.proposalView.taxLabel}</span>
                            <span className="font-mono tabular-nums">{t.mockup.proposalView.taxValue}</span>
                          </div>
                          <div className="flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold text-slate-950 bg-slate-50">
                            <span>{t.mockup.proposalView.totalLabel}</span>
                            <span className="font-mono tabular-nums text-blue-600">{t.mockup.proposalView.totalValue}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'kanban' && (
                      <motion.div
                        key="kanban"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.16 }}
                        className="space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                          <span className="text-sm font-semibold text-slate-950">{t.mockup.kanbanView.title}</span>
                          <div className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
                            <Clock className="h-3.5 w-3.5 text-blue-600" strokeWidth={1.75} />
                            <span className="font-mono font-semibold tabular-nums text-slate-900">
                              {t.mockup.kanbanView.timerDuration}
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="font-mono text-slate-600 tabular-nums">{t.mockup.kanbanView.timerBillable}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                          {t.mockup.kanbanView.columns.map((col) => (
                            <div key={col.label} className="rounded-md border border-slate-200 bg-slate-50/70 p-2.5">
                              <div className="mb-2 text-[11px] font-semibold text-slate-600">{col.label}</div>
                              <div className="rounded border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-800">
                                {col.task}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'billing' && (
                      <motion.div
                        key="billing"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.16 }}
                        className="space-y-4"
                      >
                        <div className="border-b border-slate-200 pb-3">
                          <span className="text-sm font-semibold text-slate-950">{t.mockup.billingView.title}</span>
                        </div>
                        <div className="divide-y divide-slate-200 rounded-md border border-slate-200">
                          {t.mockup.billingView.rows.map((row) => (
                            <div key={row.number} className="flex flex-col gap-2 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-semibold text-slate-900">{row.number}</span>
                                  <span className="text-xs text-slate-600">{row.client}</span>
                                </div>
                                <div className="mt-0.5 text-[11px] text-slate-500">Due {row.due}</div>
                              </div>
                              <div className="flex items-center justify-between gap-3 sm:justify-end">
                                <span className="font-mono text-xs font-semibold tabular-nums text-slate-950">{row.amount}</span>
                                <span className={`rounded border px-2 py-0.5 text-[11px] font-medium ${stageStyle(row.status)}`}>
                                  {row.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
