'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Language, translations } from './translations';
import { easeOutQuart } from '@/components/ui/motion';

interface LandingWorkflowProps {
  lang: Language;
}

interface StepProps {
  number: string;
  title: string;
  desc: string;
  index: number;
  isLast?: boolean;
}

const Step = ({ number, title, desc, index, isLast = false }: StepProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className="relative flex-1">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.5, delay: index * 0.2, ease: easeOutQuart }}
        className="relative"
      >
        {/* Step number circle */}
        <div className="mb-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-mono font-semibold text-blue-600">
            {number}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {title}
        </h3>
        <p className="text-base leading-relaxed text-slate-500">
          {desc}
        </p>
      </motion.div>

      {/* Connecting line to next step (hidden on mobile) */}
      {!isLast && (
        <motion.div
          className="hidden md:block absolute left-10 top-5 w-[calc(100%-1.5rem)]"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2 + 0.4, ease: easeOutQuart }}
          style={{ transformOrigin: 'left' }}
        >
          <div className="h-px bg-slate-200" />
        </motion.div>
      )}
    </div>
  );
};

export const LandingWorkflow: React.FC<LandingWorkflowProps> = ({ lang }) => {
  const t = translations[lang].workflow;

  const steps = [
    { number: '01', title: t.step1Title, desc: t.step1Desc },
    { number: '02', title: t.step2Title, desc: t.step2Desc },
    { number: '03', title: t.step3Title, desc: t.step3Desc },
  ];

  return (
    <section id="workflow" className="py-24 md:py-32 bg-white text-slate-900 border-y border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl font-heading leading-snug">
            {t.title}
          </h2>
          <p className="mt-5 text-lg text-slate-500 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Horizontal Timeline */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-8">
          {steps.map((step, idx) => (
            <Step
              key={step.number}
              number={step.number}
              title={step.title}
              desc={step.desc}
              index={idx}
              isLast={idx === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
