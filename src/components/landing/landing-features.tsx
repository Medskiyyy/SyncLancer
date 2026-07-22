'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Users,
  FileText,
  LayoutGrid,
  Clock,
  Receipt,
  ShieldCheck,
  HardDrive,
} from 'lucide-react';
import { Language, translations } from './translations';
import { easeOutQuart } from '@/components/ui/motion';

interface LandingFeaturesProps {
  lang: Language;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  tag: string;
  title: string;
  desc: string;
  className?: string;
  index: number;
}

const FeatureCard = ({ icon, tag, title, desc, className = '', index }: FeatureCardProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.98 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: easeOutQuart,
      }}
      className={`group rounded-xl border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all ${className}`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
        {icon}
      </div>

      <span className="mt-5 inline-block text-[11px] font-semibold tracking-wider text-blue-600 uppercase">
        {tag}
      </span>

      <h3 className="mt-2 text-lg font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-base leading-relaxed text-slate-500">
        {desc}
      </p>
    </motion.div>
  );
};

export const LandingFeatures: React.FC<LandingFeaturesProps> = ({ lang }) => {
  const t = translations[lang].features;

  const features = [
    {
      icon: <Users className="h-5 w-5" />,
      tag: t.crm.tag,
      title: t.crm.title,
      desc: t.crm.desc,
    },
    {
      icon: <FileText className="h-5 w-5" />,
      tag: t.proposals.tag,
      title: t.proposals.title,
      desc: t.proposals.desc,
    },
    {
      icon: <LayoutGrid className="h-5 w-5" />,
      tag: t.kanban.tag,
      title: t.kanban.title,
      desc: t.kanban.desc,
    },
    {
      icon: <Clock className="h-5 w-5" />,
      tag: t.timeTracking.tag,
      title: t.timeTracking.title,
      desc: t.timeTracking.desc,
    },
    {
      icon: <Receipt className="h-5 w-5" />,
      tag: t.invoicing.tag,
      title: t.invoicing.title,
      desc: t.invoicing.desc,
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      tag: t.clientPortal.tag,
      title: t.clientPortal.title,
      desc: t.clientPortal.desc,
    },
    {
      icon: <HardDrive className="h-5 w-5" />,
      tag: t.storage.tag,
      title: t.storage.title,
      desc: t.storage.desc,
    },
  ];

  return (
    <section id="features" className="py-24 md:py-32 bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl font-heading leading-snug">
            {t.title}
          </h2>
          <p className="mt-5 text-lg text-slate-500 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard
            icon={features[0].icon}
            tag={features[0].tag}
            title={features[0].title}
            desc={features[0].desc}
            className="md:col-span-2"
            index={0}
          />
          <FeatureCard
            icon={features[1].icon}
            tag={features[1].tag}
            title={features[1].title}
            desc={features[1].desc}
            index={1}
          />
          <FeatureCard
            icon={features[2].icon}
            tag={features[2].tag}
            title={features[2].title}
            desc={features[2].desc}
            index={2}
          />
          <FeatureCard
            icon={features[3].icon}
            tag={features[3].tag}
            title={features[3].title}
            desc={features[3].desc}
            index={3}
          />
          <FeatureCard
            icon={features[4].icon}
            tag={features[4].tag}
            title={features[4].title}
            desc={features[4].desc}
            index={4}
          />
          <FeatureCard
            icon={features[5].icon}
            tag={features[5].tag}
            title={features[5].title}
            desc={features[5].desc}
            index={5}
          />
          <FeatureCard
            icon={features[6].icon}
            tag={features[6].tag}
            title={features[6].title}
            desc={features[6].desc}
            className="md:col-span-2"
            index={6}
          />
        </div>
      </div>
    </section>
  );
};
