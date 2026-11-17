'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Layers, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language, translations } from './translations';

interface LandingFeaturesProps {
  lang: Language;
}

type ModuleTab = 'crm' | 'proposals' | 'delivery' | 'billing';

export const LandingFeatures: React.FC<LandingFeaturesProps> = ({ lang }) => {
  const t = translations[lang].features;
  const [activeTab, setActiveTab] = useState<ModuleTab>('crm');
  const activePanel = t.panels[activeTab];

  return (
    <section id="features" className="bg-background py-20 md:py-24 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-1 border-b border-border">
          {t.tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ModuleTab)}
                className={cn(
                  'relative px-4 py-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="landingFeatureTabUnderline"
                    className="absolute right-0 bottom-0 left-0 h-0.5 bg-brand"
                    transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex h-full flex-col justify-between rounded-lg border border-border bg-card p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${lang}-${activeTab}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                  className="space-y-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="max-w-lg">
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        {activePanel.heading}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {activePanel.summary}
                      </p>
                    </div>
                    <span className="rounded-[5px] border border-border bg-secondary px-2.5 py-1 font-mono text-[11px] font-medium text-foreground">
                      {activePanel.tag}
                    </span>
                  </div>

                  <div className="divide-y divide-border rounded-md border border-border bg-background">
                    {activePanel.rows.map((row) => (
                      <div
                        key={row.title}
                        className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">
                            {row.title}
                          </div>
                          <div className="mt-0.5 truncate text-xs text-muted-foreground">
                            {row.subtitle}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <span className="font-mono text-xs font-semibold tabular-nums text-foreground whitespace-nowrap">
                            {row.metric}
                          </span>
                          <span
                            className={cn(
                              'rounded-[5px] border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
                              row.positive
                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                : 'border-border bg-secondary text-foreground'
                            )}
                          >
                            {row.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5">
            <div className="flex flex-1 flex-col justify-between rounded-lg bg-foreground p-6 text-background sm:p-7">
              <div className="flex items-center justify-between">
                <Layers className="h-5 w-5 text-brand" strokeWidth={1.75} />
                <ArrowUpRight className="h-4 w-4 opacity-60" strokeWidth={1.75} />
              </div>
              <div className="mt-6">
                <h3 className="font-heading text-lg font-bold">
                  {t.highlights.topTitle}
                </h3>
                <p className="mt-2 text-sm leading-relaxed opacity-80">
                  {t.highlights.topBody}
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between rounded-lg border border-border bg-secondary p-6 text-foreground sm:p-7">
              <div>
                <ShieldCheck className="h-5 w-5 text-brand" strokeWidth={1.75} />
              </div>
              <div className="mt-6">
                <h3 className="font-heading text-lg font-bold">
                  {t.highlights.bottomTitle}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t.highlights.bottomBody}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
