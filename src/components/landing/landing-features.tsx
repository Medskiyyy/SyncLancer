'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Users,
  FileText,
  LayoutGrid,
  Clock,
  Receipt,
  ShieldCheck,
  HardDrive,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Language, translations } from './translations';

interface LandingFeaturesProps {
  lang: Language;
}

export const LandingFeatures: React.FC<LandingFeaturesProps> = ({ lang }) => {
  const t = translations[lang].features;

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 200, damping: 22 },
    },
  };

  return (
    <section id="features" className="py-20 md:py-28 bg-[#030712] text-slate-100 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1.5 text-xs font-semibold text-indigo-400 mb-4 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>{t.badge}</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-heading leading-tight">
            {t.title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300">
            {t.subtitle}
          </p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. CRM & Lead Management */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="group rounded-2xl border border-white/10 bg-[#090e1c] p-7 shadow-xl hover:border-blue-500/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
            </div>
            <span className="mt-6 inline-block text-[11px] font-bold tracking-wider text-blue-400 uppercase">
              {t.crm.tag}
            </span>
            <h3 className="mt-1 text-xl font-bold text-white font-heading">
              {t.crm.title}
            </h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              {t.crm.desc}
            </p>
          </motion.div>

          {/* 2. Proposal Builder */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="group rounded-2xl border border-white/10 bg-[#090e1c] p-7 shadow-xl hover:border-indigo-500/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
            </div>
            <span className="mt-6 inline-block text-[11px] font-bold tracking-wider text-indigo-400 uppercase">
              {t.proposals.tag}
            </span>
            <h3 className="mt-1 text-xl font-bold text-white font-heading">
              {t.proposals.title}
            </h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              {t.proposals.desc}
            </p>
          </motion.div>

          {/* 3. Project & Task Kanban */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="group rounded-2xl border border-white/10 bg-[#090e1c] p-7 shadow-xl hover:border-purple-500/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                <LayoutGrid className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-600 group-hover:text-purple-400 transition-colors" />
            </div>
            <span className="mt-6 inline-block text-[11px] font-bold tracking-wider text-purple-400 uppercase">
              {t.kanban.tag}
            </span>
            <h3 className="mt-1 text-xl font-bold text-white font-heading">
              {t.kanban.title}
            </h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              {t.kanban.desc}
            </p>
          </motion.div>

          {/* 4. Time Tracking */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="group rounded-2xl border border-white/10 bg-[#090e1c] p-7 shadow-xl hover:border-amber-500/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-600 group-hover:text-amber-400 transition-colors" />
            </div>
            <span className="mt-6 inline-block text-[11px] font-bold tracking-wider text-amber-400 uppercase">
              {t.timeTracking.tag}
            </span>
            <h3 className="mt-1 text-xl font-bold text-white font-heading">
              {t.timeTracking.title}
            </h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              {t.timeTracking.desc}
            </p>
          </motion.div>

          {/* 5. Invoice System */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="group rounded-2xl border border-white/10 bg-[#090e1c] p-7 shadow-xl hover:border-emerald-500/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Receipt className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </div>
            <span className="mt-6 inline-block text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
              {t.invoicing.tag}
            </span>
            <h3 className="mt-1 text-xl font-bold text-white font-heading">
              {t.invoicing.title}
            </h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              {t.invoicing.desc}
            </p>
          </motion.div>

          {/* 6. Client Portal */}
          <motion.div
            id="portal"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="group rounded-2xl border border-white/10 bg-[#090e1c] p-7 shadow-xl hover:border-rose-500/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-600 group-hover:text-rose-400 transition-colors" />
            </div>
            <span className="mt-6 inline-block text-[11px] font-bold tracking-wider text-rose-400 uppercase">
              {t.clientPortal.tag}
            </span>
            <h3 className="mt-1 text-xl font-bold text-white font-heading">
              {t.clientPortal.title}
            </h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              {t.clientPortal.desc}
            </p>
          </motion.div>
        </div>

        {/* Highlight Card for Supabase Cloud Storage */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.005 }}
          className="mt-6 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900/60 p-6 sm:p-8 backdrop-blur-xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                <HardDrive className="h-7 w-7" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-wider text-blue-400 uppercase">
                  {t.storage.tag}
                </span>
                <h4 className="text-lg font-bold text-white">
                  {t.storage.title}
                </h4>
                <p className="mt-1 text-sm text-slate-300 max-w-2xl">
                  {t.storage.desc}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
