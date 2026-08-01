'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/shared/lib/i18nContext';
import { usePatientProfileQuery } from '@/modules/patient/hooks/usePatientQueries';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const WelcomeBanner = () => {
    const { locale } = useTranslation();
    const { user } = useAuth();
    const { data: profile } = usePatientProfileQuery();

    const name = profile?.firstName || user?.name || (locale === 'ar' ? 'المريض' : 'Patient');

    const formattedDate = new Date().toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="relative w-full min-h-[150px] sm:h-[180px] rounded-[24px] overflow-hidden bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-6 sm:p-8 md:p-10 flex flex-col justify-center text-white shadow-xl mb-6 sm:mb-8 border border-primary-container/20">
      {/* Wave / Radial Geometric Background Artwork */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <svg className="w-full h-full" viewBox="0 0 1000 180" preserveAspectRatio="none" fill="none">
          <ellipse cx="850" cy="90" rx="350" ry="160" stroke="url(#gradientRing1)" strokeWidth="1.5"/>
          <ellipse cx="850" cy="90" rx="260" ry="110" stroke="url(#gradientRing2)" strokeWidth="1.5" strokeDasharray="6 6"/>
          <ellipse cx="850" cy="90" rx="160" ry="70" stroke="url(#gradientRing1)" strokeWidth="1"/>
          <path d="M 0 120 C 300 40, 600 160, 1000 80" stroke="rgba(20, 184, 166, 0.4)" strokeWidth="2" fill="none"/>
          <defs>
            <linearGradient id="gradientRing1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.1"/>
            </linearGradient>
            <linearGradient id="gradientRing2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#059669" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Glass Effect Overlay */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-500/10 via-transparent to-transparent pointer-events-none"/>

      {/* Content */}
      <div className="relative z-10 space-y-1.5 max-w-xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-xs">
          {locale === 'ar' ? `مرحباً بك مجدداً، ${name}` : `Welcome back, ${name}`}
        </h1>
        <p className="text-emerald-200/80 font-medium text-sm sm:text-base tracking-wide">
          {formattedDate}
        </p>
      </div>
    </motion.div>);
};
