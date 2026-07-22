'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, LogIn } from 'lucide-react';
import { Language, translations } from './translations';

interface LandingCTAProps {
  lang: Language;
}

export const LandingCTA: React.FC<LandingCTAProps> = ({ lang }) => {
  const t = translations[lang].cta;

  return (
    <section className="py-16 md:py-24 bg-[#030712] overflow-hidden text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-8 sm:p-12 md:p-16 shadow-2xl overflow-hidden border border-blue-500/30"
        >
          {/* Background Decorative Element */}
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-indigo-950/50 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl font-heading leading-tight">
              {t.title}
            </h2>

            <p className="mt-4 text-base sm:text-lg text-blue-100/90 leading-relaxed max-w-2xl mx-auto">
              {t.subtitle}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-base font-bold text-blue-600 shadow-xl hover:bg-blue-50 transition-all cursor-pointer"
                >
                  <span>{t.buttonRegister}</span>
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </Link>

              <Link href="/login" className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md px-6 py-3.5 text-base font-semibold text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{t.buttonLogin}</span>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
