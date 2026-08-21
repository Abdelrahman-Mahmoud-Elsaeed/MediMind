'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import LandingHeader from '@/modules/landing/components/LandingHeader';
import LandingHero from '@/modules/landing/components/LandingHero';
import LandingFeatures from '@/modules/landing/components/LandingFeatures';
import LandingFullManagement from '@/modules/landing/components/LandingFullManagement';
import LandingCaregivers from '@/modules/landing/components/LandingCaregivers';
import LandingPlantJourney from '@/modules/landing/components/LandingPlantJourney';
import LandingTestimonials from '@/modules/landing/components/LandingTestimonials';
import LandingFAQ from '@/modules/landing/components/LandingFAQ';
import LandingPricing from '@/modules/landing/components/LandingPricing';
import LandingCTA from '@/modules/landing/components/LandingCTA';
import LandingFooter from '@/modules/landing/components/LandingFooter';

export default function LandingPage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isUserLoggedIn = mounted && Boolean(
    isAuthenticated ||
    user ||
    (typeof window !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('user')))
  );

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] dark:bg-[#080d1a] dark:text-slate-100 min-h-screen font-sans transition-colors duration-300" suppressHydrationWarning>
      {/* Navigation Header */}
      <LandingHeader />

      <main className="pt-20">
        {/* Hero Section */}
        <LandingHero isUserLoggedIn={isUserLoggedIn} />

        {/* Features Grid */}
        <LandingFeatures />

        {/* Full Management & Showcase */}
        <LandingFullManagement />

        {/* Caregivers Roster Section */}
        <LandingCaregivers isUserLoggedIn={isUserLoggedIn} />

        {/* Gamified Health Progress & Plant Journey */}
        <LandingPlantJourney isUserLoggedIn={isUserLoggedIn} />

        {/* Patient Stories & Testimonials */}
        <LandingTestimonials />

        {/* FAQ Accordion */}
        <LandingFAQ />

        {/* Pricing Plans */}
        <LandingPricing isUserLoggedIn={isUserLoggedIn} />

        {/* Call to Action Banner */}
        <LandingCTA isUserLoggedIn={isUserLoggedIn} />
      </main>

      {/* Footer */}
      <LandingFooter isUserLoggedIn={isUserLoggedIn} />
    </div>
  );
}
