'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, LogIn } from 'lucide-react';
import { Language, translations } from './translations';
import { easeOutQuart } from '@/components/ui/motion';

interface LandingCTAProps {
  lang: Language;
}

export const LandingCTA: React.FC<LandingCTAProps> = ({ lang }) => {
  const t = translations[lang].cta;
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 md:py-32 bg-slate-50 overflow-hidden text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, ease: easeOutQuart }}
          className="relative rounded-2xl bg-blue-600 p-8 sm:p-12 md:p-16 overflow-hidden"
        >
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/3" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl md:text-5xl font-heading leading-snug text-white">
              {t.title}
            </h2>

            <p className="mt-5 text-lg text-blue-100 leading-relaxed max-w-2xl mx-auto">
              {t.subtitle}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register" className="w-full sm:w-auto">
                <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-medium text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
                  <span>{t.buttonRegister}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>

              <Link href="/login" className="w-full sm:w-auto">
                <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3 text-base font-medium text-white hover:bg-white/20 transition-colors cursor-pointer">
                  <LogIn className="h-4 w-4" />
                  <span>{t.buttonLogin}</span>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
