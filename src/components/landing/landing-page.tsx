'use client';

import React, { useState } from 'react';
import { Language } from './translations';
import { LandingNavbar } from './landing-navbar';
import { LandingHero } from './landing-hero';
import { LandingFeatures } from './landing-features';
import { LandingWorkflow } from './landing-workflow';
import { LandingCTA } from './landing-cta';
import { LandingFooter } from './landing-footer';

export const LandingPage: React.FC = () => {
  const [lang, setLang] = useState<Language>('id');

  return (
    <div className="min-h-screen bg-[#030712] font-sans text-slate-100 selection:bg-blue-500 selection:text-white">
      <LandingNavbar lang={lang} onLanguageChange={setLang} />
      <main>
        <LandingHero lang={lang} />
        <LandingFeatures lang={lang} />
        <LandingWorkflow lang={lang} />
        <LandingCTA lang={lang} />
      </main>
      <LandingFooter lang={lang} />
    </div>
  );
};
