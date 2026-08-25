'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { useTranslation } from '@/shared/lib/i18nContext';

const LandingHeader = dynamic(() => import('./LandingHeader'), {
  ssr: false,
  loading: () => (
    <header className="fixed top-0 w-full z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm h-20" />
  ),
});

export default function LandingPage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { t, locale, dir } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const isRtl = locale === 'ar' || dir === 'rtl';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.75;
    }
  }, [isVideoLoaded]);

  const isUserLoggedIn = mounted && Boolean(
    isAuthenticated ||
    user ||
    (typeof window !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('user')))
  );

  const heroBtnHref = isUserLoggedIn ? "/home" : "/register";
  const heroBtnText = isUserLoggedIn ? (isRtl ? "لوحة التحكم" : "Dashboard") : t('landing.nav.goJourney');
  
  const card1Href = isUserLoggedIn ? "/caregivers" : "/register";
  const card2Href = isUserLoggedIn ? "/caregivers" : "/register";
  const card3Href = isUserLoggedIn ? "/caregivers" : "/register";
  const caregiversHref = isUserLoggedIn ? "/caregivers" : "/register";
  const ctaBtnHref = isUserLoggedIn ? "/home" : "/register";
  const ctaBtnText = isUserLoggedIn ? (isRtl ? "لوحة التحكم" : "Dashboard") : t('landing.cta.startFree');

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] dark:bg-[#080d1a] dark:text-slate-100 min-h-screen font-sans transition-colors duration-300" suppressHydrationWarning>
      {/* Navigation Header */}
      <LandingHeader />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-[#f0f5ff] to-[#e5eeff] dark:from-[#080d1a] dark:to-[#0d1528]">
          {/* Background Video Layer */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-[#0c1322]">
            {/* Fallback Poster Background / Gradient Mesh while video loads */}
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/50 via-slate-900 to-emerald-950/60 z-0" />

            <video
              ref={videoRef}
              src="/videos/hero-bg-merged.mp4"
              autoPlay
              muted
              loop
              playsInline
              onCanPlay={() => {
                setIsVideoLoaded(true);
                if (videoRef.current) videoRef.current.playbackRate = 1.75;
              }}
              className={`w-full h-full object-cover object-right md:object-center scale-105 transition-opacity duration-700 pointer-events-none ${
                isVideoLoaded ? "opacity-90 dark:opacity-80" : "opacity-0"
              }`}
            />
            {/* Multi-layered gradient overlays */}
            <div className={`absolute inset-0 ${isRtl ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-[#f0f5ff]/90 via-[#f0f5ff]/55 to-transparent dark:from-[#080d1a]/95 dark:via-[#080d1a]/65 dark:to-[#080d1a]/20`} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#f0f5ff]/20 via-transparent to-[#f0f5ff]/85 dark:from-[#080d1a]/20 dark:via-transparent dark:to-[#080d1a]/85" />
            {/* Subtle dot grid */}
            <div className="w-full h-full absolute inset-0 bg-[radial-gradient(#006c4e_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#14b8a6_1.5px,transparent_1.5px)] [background-size:28px_28px] opacity-8 pointer-events-none" />
            {/* Ambient glow accent */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 dark:bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="relative z-20 px-6 sm:px-12 md:px-16 max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-20">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-teal-600/12 dark:bg-teal-400/10 border border-teal-600/25 dark:border-teal-400/20 text-teal-700 dark:text-teal-300 font-bold text-xs uppercase tracking-widest backdrop-blur-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 animate-pulse inline-block"></span>
                {t('landing.hero.badge')}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4rem] font-black text-[#0a1628] dark:text-slate-50 leading-[1.1] tracking-tight">
                {t('landing.hero.title1')} <br />
                {t('landing.hero.title2')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500 dark:from-teal-400 dark:to-emerald-300">{t('landing.hero.title3')}</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-lg leading-relaxed">
                {t('landing.hero.description')}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href={heroBtnHref}
                  className="group bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-emerald-500 text-white px-9 py-4 rounded-full font-bold text-lg active:scale-95 transition-all flex items-center gap-2.5 shadow-xl shadow-teal-600/30 dark:shadow-teal-900/50 hover:scale-105 hover:shadow-teal-500/40"
                >
                  <span>{heroBtnText}</span>
                  <span className="material-symbols-outlined rtl:rotate-180 group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                </Link>
                <Link
                  href="#features"
                  onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="px-8 py-4 rounded-full font-semibold text-base border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 backdrop-blur-sm transition-all hover:scale-105"
                >
                  {t('landing.nav.features')}
                </Link>
              </div>

              <div className="pt-6 flex flex-wrap gap-6 sm:gap-10 items-center">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-100/80 dark:bg-teal-950/60 backdrop-blur-sm flex items-center justify-center text-teal-700 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40 shadow-sm">
                    <span className="material-symbols-outlined text-2xl">verified_user</span>
                  </div>
                  <div>
                    <div className="font-black text-[#0a1628] dark:text-slate-50 text-2xl leading-none">{t('landing.hero.stat1Value')}</div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{t('landing.hero.stat1Label')}</div>
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-300/60 dark:bg-slate-700/60" />
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-100/80 dark:bg-teal-950/60 backdrop-blur-sm flex items-center justify-center text-teal-700 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40 shadow-sm">
                    <span className="material-symbols-outlined text-2xl">sentiment_satisfied</span>
                  </div>
                  <div>
                    <div className="font-black text-[#0a1628] dark:text-slate-50 text-2xl leading-none">{t('landing.hero.stat2Value')}</div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{t('landing.hero.stat2Label')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Card Graphic (Translucent Glassmorphism) */}
            <div className="relative flex justify-center lg:justify-end items-center">
              <div className="w-full max-w-[320px] bg-white/40 dark:bg-slate-950/40 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-white/40 dark:border-slate-800/40 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#0b1c30] dark:text-slate-100">{t('landing.hero.todayMeds')}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">{t('landing.hero.todayDate')}</p>
                  </div>
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-300/50 dark:stroke-slate-700/50" strokeWidth="3" />
                      <circle cx="18" cy="18" r="16" fill="none" className="stroke-teal-600 dark:stroke-teal-400" strokeWidth="3" strokeDasharray="75, 100" strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-[11px] font-extrabold text-teal-700 dark:text-teal-400">75%</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 bg-teal-500/10 dark:bg-teal-950/30 backdrop-blur-sm rounded-xl border border-teal-500/20 dark:border-teal-900/30">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg text-teal-600 dark:text-teal-400">check_circle</span>
                      <div>
                        <div className="font-bold text-sm text-[#0b1c30] dark:text-slate-100">Glucophage 500mg</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">8:00 AM • {t('landing.hero.taken')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-teal-500/10 dark:bg-teal-950/30 backdrop-blur-sm rounded-xl border border-teal-500/20 dark:border-teal-900/30">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg text-teal-600 dark:text-teal-400">check_circle</span>
                      <div>
                        <div className="font-bold text-sm text-[#0b1c30] dark:text-slate-100">Concor 5mg</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">8:00 AM • {t('landing.hero.taken')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/30 dark:border-slate-800/30">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg text-slate-400">circle</span>
                      <div>
                        <div className="font-bold text-sm text-[#0b1c30] dark:text-slate-100">Glucophage 500mg</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">8:00 PM • {t('landing.hero.pending')}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-300/30 dark:border-slate-800/40 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                    <span className="material-symbols-outlined text-base text-teal-600 dark:text-teal-400">schedule</span>
                    {t('landing.hero.nextDose')}
                  </div>
                  <span className="material-symbols-outlined text-base text-teal-600 dark:text-teal-400 animate-bounce">notifications_active</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-28 px-6 sm:px-12 md:px-16 bg-white dark:bg-[#0b1120] scroll-mt-20 relative overflow-hidden">
          {/* Subtle background accent */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(20,184,166,0.06)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />
          <div className="max-w-[1440px] mx-auto text-center mb-20 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-600/8 dark:bg-teal-400/8 border border-teal-500/20 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-widest mb-5">
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              {isRtl ? 'ما يميزنا' : 'Our Features'}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0a1628] dark:text-slate-50 mb-5 tracking-tight">{t('landing.features.title')}</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {[
              { icon: 'notifications_active', title: t('landing.features.f1Title'), desc: t('landing.features.f1Desc'), color: 'from-teal-500 to-emerald-500' },
              { icon: 'eco', title: t('landing.features.f2Title'), desc: t('landing.features.f2Desc'), color: 'from-emerald-500 to-green-500' },
              { icon: 'diversity_1', title: t('landing.features.f3Title'), desc: t('landing.features.f3Desc'), color: 'from-teal-400 to-cyan-500' },
              { icon: 'monitoring', title: t('landing.features.f4Title'), desc: t('landing.features.f4Desc'), color: 'from-cyan-500 to-teal-500' }
            ].map((feature, i) => (
              <div key={i} className="group relative p-7 rounded-3xl overflow-hidden bg-white dark:bg-slate-900/80 backdrop-blur-xl hover:bg-gradient-to-br hover:from-teal-50/80 hover:to-white dark:hover:from-teal-950/40 dark:hover:to-slate-900 transition-all duration-300 border border-slate-200/80 dark:border-slate-800/60 hover:border-teal-300/60 dark:hover:border-teal-700/50 text-center shadow-sm hover:shadow-xl hover:shadow-teal-500/8 hover:scale-[1.03] hover:-translate-y-2 cursor-default">
                {/* Gradient top border on hover */}
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl shadow-lg shadow-teal-500/20 flex items-center justify-center text-white mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                </div>
                <h3 className="font-bold text-xl mb-3 text-[#0a1628] dark:text-slate-100 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Full Management & Checklist Showcase */}
        <section className="py-24 px-6 sm:px-12 md:px-16 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Column Container with Watermark Overlay */}
            <div className="relative flex flex-col justify-center">
              {/* Brand Logo Watermark Overlay - Centered behind text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <div className="w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] lg:w-[420px] lg:h-[420px] opacity-[0.12] dark:opacity-[0.15] transition-all duration-300">
                  <img
                    src="/images/logo.png"
                    alt="MediMind Brand Watermark"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_60px_rgba(16,185,129,0.4)] select-none"
                  />
                </div>
              </div>

              {/* Text Content (z-10 Layer Priority) */}
              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-600/8 border border-teal-500/20 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-widest">
                  <span className="material-symbols-outlined text-base">task_alt</span>
                  {isRtl ? 'إدارة متكاملة' : 'Full Management'}
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0a1628] dark:text-slate-50 tracking-tight leading-tight">{t('landing.checklist.title')}</h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t('landing.checklist.description')}
                </p>
                <ul className="space-y-4 pt-2">
                  {[t('landing.checklist.i1'), t('landing.checklist.i2'), t('landing.checklist.i3')].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-[#0a1628] dark:text-slate-200 font-medium">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20 mt-0.5">
                        <span className="material-symbols-outlined text-white text-sm">check</span>
                      </div>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-[40px] shadow-2xl border border-white/60 dark:border-slate-800 relative overflow-hidden hover:scale-[1.02] transition-all duration-300">
              {/* Feature Showcase Banner Image */}
              <div className="relative rounded-[28px] overflow-hidden mb-6 border border-teal-100 dark:border-teal-900/40 shadow-sm group">
                <img
                  src="/images/wellness-tracker.jpg"
                  alt={isRtl ? "متابعة العافية والصحة" : "Wellness Tracker"}
                  className="w-full h-48 sm:h-56 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-teal-600/90 backdrop-blur-md border border-teal-400/30">
                    <span className="material-symbols-outlined text-xs">eco</span>
                    <span>{isRtl ? "تتبع العافية اليومي" : "Wellness Tracker"}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-teal-200">
                    {isRtl ? "رعاية فائقة وسهلة" : "Personalized Care"}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-2xl mb-4 text-[#0b1c30] dark:text-slate-100">{t('landing.checklist.todayTitle')}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-teal-50/70 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-900/60 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold shadow-sm">
                      <span className="material-symbols-outlined">done</span>
                    </div>
                    <div>
                      <div className="font-bold text-[#0b1c30] dark:text-slate-100">Atorvastatin 20mg</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">8:00 AM • {t('landing.hero.taken')}</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">verified</span>
                </div>

                <div className="flex items-center justify-between p-5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-teal-500/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                      <span className="material-symbols-outlined">schedule</span>
                    </div>
                    <div>
                      <div className="font-bold text-[#0b1c30] dark:text-slate-100">Metformin 500mg</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">12:30 PM • {t('landing.hero.pending')}</div>
                    </div>
                  </div>
                  <button className="bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-teal-700 transition cursor-pointer">
                    {t('landing.checklist.markTaken')}
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                      <span className="material-symbols-outlined">schedule</span>
                    </div>
                    <div>
                      <div className="font-bold text-[#0b1c30] dark:text-slate-100">Lisinopril 10mg</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">8:00 PM • {t('landing.checklist.upcoming')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Caregivers Section */}
        <section id="caregivers" className="py-28 px-6 sm:px-12 md:px-16 bg-white dark:bg-[#0b1120] scroll-mt-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.05)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.04)_0%,transparent_60%)] pointer-events-none" />
          <div className="max-w-[1440px] mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-600/8 border border-teal-500/20 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-widest mb-5">
                  <span className="material-symbols-outlined text-base">people</span>
                  {isRtl ? 'فريق الرعاية' : 'Care Team'}
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0a1628] dark:text-slate-50 tracking-tight mb-4">{t('landing.caregivers.title')}</h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t('landing.caregivers.description')}
                </p>
              </div>
              <Link href={caregiversHref} className="group text-teal-600 dark:text-teal-400 font-bold flex items-center gap-2 hover:gap-3 transition-all whitespace-nowrap shrink-0 bg-teal-600/8 hover:bg-teal-600/15 px-5 py-2.5 rounded-full border border-teal-500/20 hover:border-teal-500/40">
                <span>{t('landing.caregivers.viewAll')}</span>
                <span className="material-symbols-outlined rtl:rotate-180 group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Sarah Johnson', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80', bio: t('landing.caregivers.c1Bio'), price: '$25', href: card1Href },
                { name: 'Michael Torres', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80', bio: t('landing.caregivers.c2Bio'), price: '$28', href: card2Href, featured: true },
                { name: 'Amina Al-Farsi', img: 'https://images.unsplash.com/photo-1594824813566-88855ce78961?w=150&auto=format&fit=crop&q=80', bio: t('landing.caregivers.c3Bio'), price: '$30', href: card3Href }
              ].map((caregiver, i) => (
                <div key={i} className={`relative group p-7 rounded-3xl backdrop-blur-xl transition-all duration-300 border hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-2 ${
                  caregiver.featured
                    ? 'bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/60 dark:to-emerald-950/40 border-teal-200/80 dark:border-teal-700/50 shadow-lg shadow-teal-500/8'
                    : 'bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800/60'
                }`}>
                  {caregiver.featured && (
                    <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 px-3 py-1 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                      {isRtl ? 'الأكثر طلباً' : 'Most Popular'}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative p-0.5 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500">
                      <img
                        alt={caregiver.name}
                        className="w-16 h-16 rounded-[14px] object-cover"
                        src={caregiver.img}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-[#0a1628] dark:text-slate-100">{caregiver.name}</h4>
                      <div className="flex text-amber-400 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed italic">
                    &ldquo;{caregiver.bio}&rdquo;
                  </p>
                  <div className="flex justify-between items-center pt-5 border-t border-slate-200/60 dark:border-slate-700/40">
                    <div>
                      <span className="text-2xl font-black text-teal-600 dark:text-teal-400">{caregiver.price}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-sm">{t('landing.caregivers.hr')}</span>
                    </div>
                    <Link
                      href={caregiver.href}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-md shadow-teal-600/20"
                    >
                      {t('landing.caregivers.select')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Public Interactive Plant Journey Demo Section */}
        <PublicPlantJourneyDemo isRtl={isRtl} ctaHref={heroBtnHref} t={t} />

        {/* Testimonials Section */}
        <section className="py-28 px-6 sm:px-12 md:px-16 bg-gradient-to-br from-[#f0f5ff] to-white dark:from-[#080d1a] dark:to-[#0b1120] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.05)_0%,transparent_70%)] pointer-events-none" />
          <div className="max-w-[1440px] mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-600/8 border border-teal-500/20 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-widest mb-5">
                <span className="material-symbols-outlined text-base">format_quote</span>
                {isRtl ? 'آراء عملائنا' : 'Patient Stories'}
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0a1628] dark:text-slate-50 tracking-tight">{t('landing.testimonials.title')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { text: t('landing.testimonials.t1Text'), author: t('landing.testimonials.t1Author'), age: t('landing.testimonials.t1Age'), img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80', featured: false },
                { text: t('landing.testimonials.t2Text'), author: t('landing.testimonials.t2Author'), age: t('landing.testimonials.t2Age'), img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', featured: true },
                { text: t('landing.testimonials.t3Text'), author: t('landing.testimonials.t3Author'), age: t('landing.testimonials.t3Age'), img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80', featured: false }
              ].map((t2, i) => (
                <div key={i} className={`relative p-8 rounded-3xl flex flex-col justify-between transition-all duration-300 ${
                  t2.featured
                    ? 'bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-2xl shadow-teal-600/25 scale-[1.03] hover:scale-[1.06]'
                    : 'bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/60 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl'
                }`}>
                  {/* Quote icon */}
                  <div className={`absolute top-6 ${isRtl ? 'left-7' : 'right-7'} text-5xl font-black leading-none select-none ${t2.featured ? 'text-white/20' : 'text-teal-500/15 dark:text-teal-400/10'}`}>&ldquo;</div>
                  {/* Stars */}
                  <div className={`flex mb-5 ${t2.featured ? 'text-white/90' : 'text-amber-400'}`}>
                    {[...Array(5)].map((_, si) => (
                      <span key={si} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className={`text-base leading-relaxed mb-8 flex-1 italic ${
                    t2.featured ? 'text-white/90' : 'text-slate-600 dark:text-slate-300'
                  }`}>
                    &ldquo;{t2.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3.5">
                    <div className={`p-0.5 rounded-full ${t2.featured ? 'bg-white/30' : 'bg-gradient-to-br from-teal-400 to-emerald-500'}`}>
                      <img
                        alt={t2.author}
                        className="w-11 h-11 rounded-full object-cover"
                        src={t2.img}
                      />
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${t2.featured ? 'text-white' : 'text-[#0a1628] dark:text-slate-100'}`}>{t2.author}</div>
                      <div className={`text-xs mt-0.5 ${t2.featured ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>{t2.age}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-28 px-6 sm:px-12 md:px-16 bg-white dark:bg-[#0b1120] scroll-mt-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(20,184,166,0.05)_0%,transparent_60%)] pointer-events-none" />
          <div className="max-w-3xl mx-auto relative z-10">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-600/8 border border-teal-500/20 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-widest mb-5">
                <span className="material-symbols-outlined text-base">help_outline</span>
                FAQ
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0a1628] dark:text-slate-50 tracking-tight">{t('landing.faq.title')}</h2>
            </div>
            <div className="space-y-3">
              {[
                { q: t('landing.faq.q1Title'), a: t('landing.faq.q1Answer'), open: true },
                { q: t('landing.faq.q2Title'), a: t('landing.faq.q2Answer') },
                { q: t('landing.faq.q3Title'), a: t('landing.faq.q3Answer') },
                { q: t('landing.faq.q4Title'), a: t('landing.faq.q4Answer') }
              ].map((item, i) => (
                <details key={i} className="group bg-slate-50 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 hover:border-teal-300/50 dark:hover:border-teal-700/40 cursor-pointer shadow-none hover:shadow-lg transition-all duration-200" {...(item.open ? { open: true } : {})}>
                  <summary className="flex justify-between items-center font-bold text-lg text-[#0a1628] dark:text-slate-100 list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none gap-4">
                    <span>{item.q}</span>
                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 transition-colors group-hover:bg-teal-200/80 dark:group-hover:bg-teal-900/80">
                      <svg
                        className="w-5 h-5 transition-transform duration-300 group-open:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </summary>
                  <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm leading-relaxed ps-0">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section with Video Overlay */}
        <section className="py-20 px-6 sm:px-12 md:px-16 my-8 relative">
          <div className="max-w-[1440px] mx-auto">
            <div className="relative overflow-hidden rounded-[40px] p-12 md:p-20 text-center shadow-2xl border border-white/10">
              {/* Rich gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 dark:from-[#052e16] dark:via-teal-950 dark:to-emerald-950" />
              {/* Mesh accent */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.12)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(52,211,153,0.12)_0%,transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
              {/* Subtle background looping video layer */}
              <div className="absolute inset-0 z-0 overflow-hidden opacity-20 pointer-events-none">
                <video
                  src="/videos/21178637.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover scale-105"
                />
              </div>
              {/* Dot grid overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

              <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white font-bold text-xs uppercase tracking-widest mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block"></span>
                  {isRtl ? 'ابدأ الآن مجاناً' : 'Start Free Today'}
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">{t('landing.cta.title')}</h2>
                <p className="text-teal-100 dark:text-emerald-200/80 text-lg leading-relaxed max-w-2xl mx-auto">
                  {t('landing.cta.description')}
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href={ctaBtnHref}
                    className="group bg-white text-teal-700 px-9 py-4 rounded-full font-black text-lg hover:bg-teal-50 hover:scale-105 transition-all active:scale-95 inline-flex items-center gap-2.5 shadow-2xl shadow-black/20 cursor-pointer"
                  >
                    <span>{ctaBtnText}</span>
                    <span className="material-symbols-outlined rtl:rotate-180 group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                  </Link>
                  <Link
                    href="#features"
                    onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="px-8 py-4 rounded-full font-semibold text-base border border-white/30 text-white hover:bg-white/15 transition-all hover:scale-105"
                  >
                    {isRtl ? 'استكشف المزايا' : 'Explore Features'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Dark & Elegant Premium Footer */}
      <footer className="bg-[#050a14] text-white border-t border-slate-800/60 relative overflow-hidden">
        {/* Footer ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(16,185,129,0.04)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

        {/* Main footer content */}
        <div className="relative z-10 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-6 sm:px-12 md:px-16 max-w-[1440px] mx-auto mb-14">
            <div className="space-y-5 lg:col-span-1">
              <div className="text-xl font-black flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-500/15">
                  <img
                    src="/images/logo.png"
                    alt="MediMind Logo"
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <span className="tracking-tight">
                  <span className="text-[#60a5fa]">Medi</span>
                  <span className="text-[#34d399]">Mind</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                {t('landing.footer.desc')}
              </p>
              {/* Trust badges */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  {isRtl ? 'آمن ومشفر' : 'HIPAA Safe'}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-white uppercase tracking-widest text-xs pb-2 border-b border-slate-800/80">{t('landing.footer.patientCare')}</h4>
              <nav className="flex flex-col gap-2.5 text-sm">
                <a className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group" href="#">
                  <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                  {t('landing.footer.startTracking')}
                </a>
                <a
                  className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group"
                  href="#caregivers"
                  onClick={(e) => { e.preventDefault(); document.getElementById('caregivers')?.scrollIntoView({ behavior: 'smooth' }); }}
                >
                  <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                  {t('landing.nav.caregivers')}
                </a>
                <a
                  className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group"
                  href="#plant-journey"
                  onClick={(e) => { e.preventDefault(); document.getElementById('plant-journey')?.scrollIntoView({ behavior: 'smooth' }); }}
                >
                  <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                  {t('landing.nav.plantJourney')}
                </a>
                <a className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group" href="#">
                  <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                  {t('landing.footer.safety')}
                </a>
              </nav>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-white uppercase tracking-widest text-xs pb-2 border-b border-slate-800/80">{t('landing.footer.company')}</h4>
              <nav className="flex flex-col gap-2.5 text-sm">
                <a className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group" href="#">
                  <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                  {t('landing.footer.mission')}
                </a>
                <a className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group" href="#">
                  <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                  {t('landing.footer.privacy')}
                </a>
                <a className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group" href="#">
                  <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                  {t('landing.footer.terms')}
                </a>
                <a className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group" href="#">
                  <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                  {t('landing.footer.support')}
                </a>
              </nav>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-white uppercase tracking-widest text-xs pb-2 border-b border-slate-800/80">{t('landing.footer.platform')}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{t('landing.footer.healthSystem')}</p>
              <Link href={heroBtnHref} className="group mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-teal-600/20">
                <span>{isRtl ? 'ابدأ مجاناً' : 'Get Started Free'}</span>
                <span className="material-symbols-outlined text-base rtl:rotate-180 group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </Link>
            </div>
          </div>

          <div className="px-6 sm:px-12 md:px-16 max-w-[1440px] mx-auto border-t border-slate-800/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs">{t('landing.footer.rights')}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <span className="material-symbols-outlined text-sm text-teal-500">favorite</span>
                {isRtl ? 'مصنوع بشغف في مصر' : 'Made with passion in Egypt'}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: PUBLIC INTERACTIVE PLANT JOURNEY DEMO
// ==========================================
function PublicPlantJourneyDemo({ isRtl, ctaHref, t }) {
  const [activeStep, setActiveStep] = useState(2);

  const milestones = [
    {
      step: 0,
      dayAr: "اليوم 0",
      dayEn: "Day 0",
      titleAr: "البذرة والبداية",
      titleEn: "Seed & Start",
      icon: "potted_plant",
      badgeAr: "شارة البداية",
      badgeEn: "Starter Badge",
      descAr: "غرس البذرة الأولى للانضباط العلاجي. تذكيرات ذكية تحميك من نسيان الجرعات من اليوم الأول.",
      descEn: "Planting the first seed of health discipline. Smart reminders protect your routine from Day 1."
    },
    {
      step: 1,
      dayAr: "اليوم 7",
      dayEn: "Day 7",
      titleAr: "إنبات برعم الصبر",
      titleEn: "First Sprout",
      icon: "eco",
      badgeAr: "وسام أسبوع الالتزام",
      badgeEn: "1-Week Habit Badge",
      descAr: "أسبوع كامل من الالتزام المنتظم! نبتتك تخرج أول برعم أخضر يعكس بداية تشكل عادتك الصحية.",
      descEn: "1 full week of consistency! Your plant sprouts its first green leaf as your habit takes root."
    },
    {
      step: 2,
      dayAr: "اليوم 30",
      dayEn: "Day 30",
      titleAr: "نمو الشتلة بانتظام",
      titleEn: "Growing Strong",
      icon: "local_florist",
      badgeAr: "درع الشهر الذهبي",
      badgeEn: "30-Day Golden Shield",
      descAr: "أحسنت! 30 يوماً متواصلة، تم تقليل مخاطر نسيان الجرعات بنسبة 80% وتأكيد استجابة العلاج الممتازة!",
      descEn: "Bravo! 30 continuous days, reducing missed dose risks by 80% while maximizing health outcomes!"
    },
    {
      step: 3,
      dayAr: "اليوم 60",
      dayEn: "Day 60",
      titleAr: "تفتح الأوراق والزهر",
      titleEn: "Blooming Leaves",
      icon: "nature",
      badgeAr: "وسام الشفاء المستدام",
      badgeEn: "Sustainable Health Badge",
      descAr: "60 يوماً من الانضباط التام. نبتتك تزهر بأوراق يانعة تشهد على تحسن استقرار مؤشراتك الطبية.",
      descEn: "60 days of perfect discipline. Your blooming plant reflects improved clinical indicators."
    },
    {
      step: 4,
      dayAr: "اليوم +90",
      dayEn: "Day 90+",
      titleAr: "شجرة الصحة المزهرة",
      titleEn: "Blooming Health Tree",
      icon: "forest",
      badgeAr: "تاج الصحة الدائمة",
      badgeEn: "Crown of Health",
      descAr: "نمط حياتك أصبح نموذجاً بالصحة والازدهار الكامل. شجرتك تثمر حيوية ونشاطاً دائمين!",
      descEn: "Your lifestyle is now a beacon of complete vitality. Your health tree bears everlasting fruit!"
    }
  ];

  const current = milestones[activeStep];

  return (
    <section id="plant-journey" className="py-24 px-6 sm:px-12 md:px-16 bg-gradient-to-br from-[#f8f9ff] to-[#e5eeff] dark:from-slate-950 dark:to-slate-900 overflow-hidden scroll-mt-20 border-y border-slate-200/80 dark:border-slate-800">
      <div className="max-w-[1440px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-600/10 border border-teal-600/20 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider backdrop-blur-md">
            <span className="material-symbols-outlined text-base">eco</span>
            <span>{isRtl ? "نظام تحفيز الالتزام العلاجي" : "Gamified Health Progress"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0b1c30] dark:text-slate-100 leading-tight">
            {isRtl ? "شاهد نفسك تزهر وتنمو مع كل جرعة" : "Watch Yourself Bloom & Grow With Every Dose"}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed">
            {isRtl
              ? "يحول تطبيق MediMind عملية تناول الأدوية اليومية إلى رحلة ممتعة وتفاعلية، حيث تنمو نبتتك مع كل جرعة تتناولها في موعدها!"
              : "MediMind transforms daily medication intake into an engaging visual journey where your personal health plant grows with every timely dose!"}
          </p>
        </div>

        {/* Timeline Interactive Progress Container */}
        <div className="relative my-12 max-w-4xl mx-auto px-4">
          {/* Circle Buttons & Connector Line Row */}
          <div className="relative h-12 sm:h-16 flex justify-between items-center z-10">
            {/* Background Track Line - Vertically centered on circle row */}
            <div className="absolute top-1/2 left-6 right-6 sm:left-8 sm:right-8 h-2 bg-slate-200 dark:bg-slate-800 rounded-full -translate-y-1/2 z-0"></div>

            {/* Dynamic Filled Teal Progress Line */}
            <div
              className="absolute top-1/2 h-2 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600 rounded-full -translate-y-1/2 z-0 transition-all duration-500 shadow-md shadow-teal-500/30"
              style={{
                left: isRtl ? "auto" : "1.5rem",
                right: isRtl ? "1.5rem" : "auto",
                width: `calc((100% - 3rem) * ${activeStep / (milestones.length - 1)})`
              }}
            ></div>

            {/* Milestone Circle Nodes */}
            {milestones.map((m) => {
              const isSelected = activeStep === m.step;
              const isPassed = activeStep >= m.step;

              return (
                <div
                  key={m.step}
                  onClick={() => setActiveStep(m.step)}
                  className="relative flex items-center justify-center cursor-pointer group z-10"
                >
                  {/* Floating Active Stage Indicator */}
                  {isSelected && (
                    <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-teal-600 text-white dark:bg-teal-400 dark:text-slate-950 text-[10px] sm:text-xs font-black px-3 py-1 rounded-full shadow-lg whitespace-nowrap animate-bounce z-20">
                      {isRtl ? "المرحلة المحددة" : "Selected Stage"}
                    </div>
                  )}

                  {/* Node Circle */}
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-slate-950 scale-110 shadow-xl shadow-teal-500/40 ring-4 ring-teal-500/20"
                        : isPassed
                        ? "bg-teal-100 dark:bg-teal-950/90 text-teal-700 dark:text-teal-400 border-2 border-teal-500/60 hover:scale-105"
                        : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 hover:scale-105"
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl sm:text-3xl">{m.icon}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Node Day Labels Below */}
          <div className="flex justify-between items-center mt-3 relative z-10">
            {milestones.map((m) => {
              const isSelected = activeStep === m.step;

              return (
                <div key={m.step} className="w-12 sm:w-16 text-center">
                  <span
                    className={`text-xs sm:text-sm font-black block transition-colors ${
                      isSelected ? "text-teal-600 dark:text-teal-400" : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {isRtl ? m.dayAr : m.dayEn}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Milestone Interactive Preview Card */}
        <div className="max-w-3xl mx-auto mt-12 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-4xl sm:text-5xl">{current.icon}</span>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] dark:text-slate-100">
                  {isRtl ? current.titleAr : current.titleEn}
                </h3>
                <span className="bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-400 px-3.5 py-1 rounded-full text-xs font-black border border-teal-300 dark:border-teal-500/30">
                  {isRtl ? current.badgeAr : current.badgeEn}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
                {isRtl ? current.descAr : current.descEn}
              </p>
            </div>
          </div>

          {/* Call-to-action Button */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {isRtl ? "ابدأ في تحويل عادتك الصحية اليوم بشكل مجاني تماماً!" : "Start transforming your health habits today completely free!"}
            </p>
            <Link
              href={ctaHref}
              className="bg-teal-600 hover:bg-teal-700 text-white px-7 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-teal-600/20 hover:scale-105 active:scale-95 transition-all text-center shrink-0 flex items-center justify-center gap-2"
            >
              <span>{isRtl ? "ابدأ رحلتك العلاجية الآن" : "Start Your Journey Now"}</span>
              <span className="material-symbols-outlined text-lg rtl:rotate-180">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
