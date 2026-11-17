'use client';

import React from 'react';
import { Download, FileText } from 'lucide-react';
import { FadeIn } from '@/components/ui/motion';
import { Language, translations } from './translations';

interface LandingPortalProps {
  lang: Language;
}

export const LandingPortal: React.FC<LandingPortalProps> = ({ lang }) => {
  const t = translations[lang].portal;

  return (
    <section id="portal" className="border-y border-slate-200 bg-slate-50 py-20 md:py-24 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <FadeIn direction="up" duration={0.4} className="lg:col-span-5">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              {t.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              {t.subtitle}
            </p>

            <div className="mt-8 divide-y divide-slate-200 border-t border-slate-200">
              {t.items.map((item) => (
                <div key={item.label} className="py-4">
                  <div className="text-sm font-semibold text-slate-950">{item.label}</div>
                  <div className="mt-1 text-sm text-slate-600">{item.detail}</div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.1} duration={0.45} className="lg:col-span-7">
            <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="text-xs font-medium text-slate-500">{t.preview.clientName}</div>
                  <div className="mt-0.5 font-heading text-lg font-semibold text-slate-950">
                    {t.preview.projectName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs text-slate-500">Progress</div>
                  <div className="font-mono text-lg font-semibold tabular-nums text-blue-600">
                    {t.preview.progress}%
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-12">
                <div className="sm:col-span-7">
                  <div className="text-xs font-semibold text-slate-700">Milestones</div>
                  <div className="mt-2.5 divide-y divide-slate-200 rounded-md border border-slate-200">
                    {t.preview.milestones.map((m) => (
                      <div key={m.title} className="flex items-center justify-between gap-2 px-3 py-2.5 text-xs">
                        <span className="font-medium text-slate-800">{m.title}</span>
                        <span
                          className={`rounded border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${
                            m.status === 'Completed'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : m.status === 'In Progress'
                                ? 'border-blue-200 bg-blue-50 text-blue-700'
                                : 'border-slate-200 bg-slate-50 text-slate-600'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 sm:col-span-5">
                  <div className="rounded-md border border-slate-200 p-3.5">
                    <div className="text-xs font-semibold text-slate-700">Invoice</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono text-xs text-slate-900">{t.preview.invoiceNumber}</span>
                      <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                        {t.preview.invoiceStatus}
                      </span>
                    </div>
                    <div className="mt-2 font-mono text-base font-semibold tabular-nums text-slate-950">
                      {t.preview.invoiceAmount}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-md border border-slate-200 p-3.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <FileText className="h-4 w-4 shrink-0 text-blue-600" strokeWidth={1.75} />
                      <div className="min-w-0">
                        <div className="truncate text-xs font-medium text-slate-900">{t.preview.fileName}</div>
                        <div className="font-mono text-[11px] text-slate-500">{t.preview.fileMeta}</div>
                      </div>
                    </div>
                    <Download className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.75} />
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};
