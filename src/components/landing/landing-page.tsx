'use client';

import React, { useState } from 'react';
import { Language } from './translations';
import { LandingNavbar } from './landing-navbar';
import { LandingHero } from './landing-hero';
import { LandingFeatures } from './landing-features';
import { LandingWorkflow } from './landing-workflow';
import { LandingPortal } from './landing-portal';
import { LandingCTA } from './landing-cta';
import { LandingFooter } from './landing-footer';

export const LandingPage: React.FC = () => {
  const [lang, setLang] = useState<Language>('id');

  return (
    <div className="min-h-[100dvh] bg-background font-sans text-foreground selection:bg-emerald-500/20 selection:text-foreground">
      <LandingNavbar lang={lang} onLanguageChange={setLang} />
      <main>
        <LandingHero lang={lang} />
        <LandingFeatures lang={lang} />
        <LandingWorkflow lang={lang} />
        <LandingPortal lang={lang} />
        <LandingCTA lang={lang} />
      </main>
      <LandingFooter lang={lang} />
    </div>
  );
};
