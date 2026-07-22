'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Language, translations } from './translations';

interface LandingWorkflowProps {
  lang: Language;
}

export const LandingWorkflow: React.FC<LandingWorkflowProps> = ({ lang }) => {
  const t = translations[lang].workflow;

  const stepVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 22,
        delay: i * 0.15,
      },
    }),
  };

  return (
    <section
      id="workflow"
      className="py-20 md:py-28 bg-[#02050e] border-y border-white/10 text-slate-100 relative"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-3.5 py-1.5 text-xs font-semibold text-blue-400 mb-4 backdrop-blur-md">
            <span>{t.badge}</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-heading leading-tight">
            {t.title}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300">
            {t.subtitle}
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <motion.div
            custom={0}
            variants={stepVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="relative rounded-2xl border border-white/10 bg-[#090e1c] p-8 shadow-xl hover:border-blue-500/50 transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 font-mono font-bold text-lg text-white shadow-lg shadow-blue-600/30 mb-6">
              01
            </div>
            <h3 className="text-xl font-bold text-white font-heading">
              {t.step1Title}
            </h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              {t.step1Desc}
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            custom={1}
            variants={stepVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="relative rounded-2xl border border-white/10 bg-[#090e1c] p-8 shadow-xl hover:border-indigo-500/50 transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 font-mono font-bold text-lg text-white shadow-lg shadow-indigo-600/30 mb-6">
              02
            </div>
            <h3 className="text-xl font-bold text-white font-heading">
              {t.step2Title}
            </h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              {t.step2Desc}
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            custom={2}
            variants={stepVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="relative rounded-2xl border border-white/10 bg-[#090e1c] p-8 shadow-xl hover:border-emerald-500/50 transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 font-mono font-bold text-lg text-white shadow-lg shadow-emerald-600/30 mb-6">
              03
            </div>
            <h3 className="text-xl font-bold text-white font-heading">
              {t.step3Title}
            </h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              {t.step3Desc}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
