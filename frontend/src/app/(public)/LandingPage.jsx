'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import LandingHeader from './LandingHeader';
import { useTranslation } from '@/shared/lib/i18nContext';
import { Button, Card, CardTitle, CardDescription, Badge, Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui';

export default function LandingPage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isUserLoggedIn = mounted && Boolean(
    isAuthenticated ||
    user ||
    (typeof window !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('user')))
  );

  const heroBtnHref = isUserLoggedIn ? "/home" : "/register";
  const heroBtnText = isUserLoggedIn ? (isAr ? "لوحة التحكم" : "Dashboard") : t('landing.nav.goJourney');
  const card1Href = isUserLoggedIn ? "/caregivers" : "/register";
  const card2Href = isUserLoggedIn ? "/caregivers" : "/register";
  const card3Href = isUserLoggedIn ? "/caregivers" : "/register";
  const caregiversViewAllHref = isUserLoggedIn ? "/caregivers" : "/register";
  const ctaBtnHref = isUserLoggedIn ? "/home" : "/register";
  const ctaBtnText = isUserLoggedIn ? (isAr ? "لوحة التحكم" : "Dashboard") : t('landing.cta.startFree');

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] dark:bg-slate-950 dark:text-slate-100 min-h-screen font-sans transition-colors duration-300" suppressHydrationWarning>
      {/* Navigation Header */}
      <LandingHeader />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-[#f8f9ff] to-[#e5eeff] dark:from-slate-950 dark:to-slate-900">
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-[radial-gradient(#006c4e_1px,transparent_1px)] dark:bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f8f9ff] via-[#f8f9ff]/80 to-transparent dark:from-slate-950 dark:via-slate-950/80" />
          </div>

          <div className="relative z-20 px-6 sm:px-12 md:px-16 max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
            <div className="space-y-6">
              <Badge variant="default" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-600/10 border border-teal-600/20 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider">
                {t('landing.hero.badge')}
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0b1c30] dark:text-slate-100 leading-tight">
                {t('landing.hero.title1')} <br />
                {t('landing.hero.title2')} <br />
                <span className="text-teal-600 dark:text-teal-400">{t('landing.hero.title3')}</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl">
                {t('landing.hero.description')}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-teal-600/20 dark:shadow-teal-900/40 animate-pulse h-auto" asChild>
                  <Link href={heroBtnHref}>
                    <span>{heroBtnText}</span>
                    <span className="material-symbols-outlined rtl:rotate-180">arrow_forward</span>
                  </Link>
                </Button>
              </div>

              <div className="pt-10 flex flex-wrap gap-8 items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-400">
                    <span className="material-symbols-outlined">verified_user</span>
                  </div>
                  <div>
                    <div className="font-bold text-[#0b1c30] dark:text-slate-100 text-lg">{t('landing.hero.stat1Value')}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t('landing.hero.stat1Label')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-400">
                    <span className="material-symbols-outlined">sentiment_satisfied</span>
                  </div>
                  <div>
                    <div className="font-bold text-[#0b1c30] dark:text-slate-100 text-lg">{t('landing.hero.stat2Value')}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t('landing.hero.stat2Label')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Card Graphic */}
            <div className="relative flex justify-center items-center">
              <Card className="w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-[40px] p-8 border border-white dark:border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-[#0b1c30] dark:text-slate-100">{t('landing.hero.todayMeds')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('landing.hero.todayDate')}</p>
                  </div>
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="3" />
                      <circle cx="18" cy="18" r="16" fill="none" className="stroke-teal-600 dark:stroke-teal-400" strokeWidth="3" strokeDasharray="75, 100" strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-xs font-bold text-teal-700 dark:text-teal-400">75%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-100 dark:border-teal-900/60">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">check_circle</span>
                      <div>
                        <div className="font-bold text-[#0b1c30] dark:text-slate-100">Glucophage 500mg</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">8:00 AM • {t('landing.hero.taken')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-100 dark:border-teal-900/60">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">check_circle</span>
                      <div>
                        <div className="font-bold text-[#0b1c30] dark:text-slate-100">Concor 5mg</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">8:00 AM • {t('landing.hero.taken')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-slate-400">circle</span>
                      <div>
                        <div className="font-bold text-[#0b1c30] dark:text-slate-100">Glucophage 500mg</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">8:00 PM • {t('landing.hero.pending')}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-sm">
                    <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">schedule</span>
                    {t('landing.hero.nextDose')}
                  </div>
                  <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 animate-bounce">notifications_active</span>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 sm:px-12 md:px-16 bg-white dark:bg-slate-900 scroll-mt-20">
          <div className="max-w-[1440px] mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] dark:text-slate-100 mb-4">{t('landing.features.title')}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-colors border border-slate-100 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-900 group text-center shadow-none">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">notifications_active</span>
              </div>
              <CardTitle className="font-bold text-xl mb-3 text-[#0b1c30] dark:text-slate-100">{t('landing.features.f1Title')}</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-sm">{t('landing.features.f1Desc')}</CardDescription>
            </Card>

            <Card className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-colors border border-slate-100 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-900 group text-center shadow-none">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">eco</span>
              </div>
              <CardTitle className="font-bold text-xl mb-3 text-[#0b1c30] dark:text-slate-100">{t('landing.features.f2Title')}</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-sm">{t('landing.features.f2Desc')}</CardDescription>
            </Card>

            <Card className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-colors border border-slate-100 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-900 group text-center shadow-none">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">diversity_1</span>
              </div>
              <CardTitle className="font-bold text-xl mb-3 text-[#0b1c30] dark:text-slate-100">{t('landing.features.f3Title')}</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-sm">{t('landing.features.f3Desc')}</CardDescription>
            </Card>

            <Card className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-colors border border-slate-100 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-900 group text-center shadow-none">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">monitoring</span>
              </div>
              <CardTitle className="font-bold text-xl mb-3 text-[#0b1c30] dark:text-slate-100">{t('landing.features.f4Title')}</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-sm">{t('landing.features.f4Desc')}</CardDescription>
            </Card>
          </div>
        </section>

        {/* Detailed Checklist Section */}
        <section className="py-24 px-6 sm:px-12 md:px-16 bg-gradient-to-br from-[#f8f9ff] to-[#e5eeff] dark:from-slate-950 dark:to-slate-900">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] dark:text-slate-100 mb-6">{t('landing.checklist.title')}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                {t('landing.checklist.description')}
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-[#0b1c30] dark:text-slate-200 font-medium">
                  <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">check_circle</span>
                  {t('landing.checklist.i1')}
                </li>
                <li className="flex items-center gap-3 text-[#0b1c30] dark:text-slate-200 font-medium">
                  <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">check_circle</span>
                  {t('landing.checklist.i2')}
                </li>
                <li className="flex items-center gap-3 text-[#0b1c30] dark:text-slate-200 font-medium">
                  <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">check_circle</span>
                  {t('landing.checklist.i3')}
                </li>
              </ul>
            </div>

            <Card className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <h3 className="font-bold text-2xl mb-6 text-[#0b1c30] dark:text-slate-100">{t('landing.checklist.todayTitle')}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-teal-50/60 dark:bg-teal-950/40 rounded-2xl border border-teal-100 dark:border-teal-900/60">
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

                <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                      <span className="material-symbols-outlined">schedule</span>
                    </div>
                    <div>
                      <div className="font-bold text-[#0b1c30] dark:text-slate-100">Metformin 500mg</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">12:30 PM • {t('landing.hero.pending')}</div>
                    </div>
                  </div>
                  <Button size="sm" className="bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-teal-700 transition">
                    {t('landing.checklist.markTaken')}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 opacity-60">
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
            </Card>
          </div>
        </section>

        {/* Caregivers Section */}
        <section id="caregivers" className="py-24 px-6 sm:px-12 md:px-16 bg-white dark:bg-slate-900 scroll-mt-20">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-xl">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] dark:text-slate-100 mb-4">{t('landing.caregivers.title')}</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  {t('landing.caregivers.description')}
                </p>
              </div>
              <Button variant="link" className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-2 hover:gap-3 transition-all p-0 h-auto text-base" asChild>
                <Link href={caregiversViewAllHref}>
                  <span>{t('landing.caregivers.viewAll')}</span>
                  <span className="material-symbols-outlined rtl:rotate-180">arrow_forward</span>
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all flex flex-col justify-between shadow-none">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-16 h-16 rounded-2xl border-none">
                      <AvatarImage src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80" alt="Sarah Johnson" className="rounded-2xl object-cover" />
                      <AvatarFallback className="rounded-2xl">SJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-xl text-[#0b1c30] dark:text-slate-100">Sarah Johnson</h4>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (<span key={i} className="material-symbols-outlined text-[18px]">star</span>))}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 italic text-sm">
                    "{t('landing.caregivers.c1Bio')}"
                  </p>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-teal-700 dark:text-teal-400 font-bold">$25{t('landing.caregivers.hr')}</span>
                  <Button variant="secondary" className="bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-200 dark:hover:bg-teal-900 transition" asChild>
                    <Link href={card1Href}>
                      {t('landing.caregivers.select')}
                    </Link>
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all flex flex-col justify-between shadow-none">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-16 h-16 rounded-2xl border-none">
                      <AvatarImage src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80" alt="Michael Torres" className="rounded-2xl object-cover" />
                      <AvatarFallback className="rounded-2xl">MT</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-xl text-[#0b1c30] dark:text-slate-100">Michael Torres</h4>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (<span key={i} className="material-symbols-outlined text-[18px]">star</span>))}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 italic text-sm">
                    "{t('landing.caregivers.c2Bio')}"
                  </p>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-teal-700 dark:text-teal-400 font-bold">$28{t('landing.caregivers.hr')}</span>
                  <Button variant="secondary" className="bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-200 dark:hover:bg-teal-900 transition" asChild>
                    <Link href={card2Href}>
                      {t('landing.caregivers.select')}
                    </Link>
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all flex flex-col justify-between shadow-none">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-16 h-16 rounded-2xl border-none">
                      <AvatarImage src="https://images.unsplash.com/photo-1594824813566-88855ce78961?w=150&auto=format&fit=crop&q=80" alt="Amina Al-Farsi" className="rounded-2xl object-cover" />
                      <AvatarFallback className="rounded-2xl">AF</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-xl text-[#0b1c30] dark:text-slate-100">Amina Al-Farsi</h4>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (<span key={i} className="material-symbols-outlined text-[18px]">star</span>))}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 italic text-sm">
                    "{t('landing.caregivers.c3Bio')}"
                  </p>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-teal-700 dark:text-teal-400 font-bold">$30{t('landing.caregivers.hr')}</span>
                  <Button variant="secondary" className="bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-200 dark:hover:bg-teal-900 transition" asChild>
                    <Link href={card3Href}>
                      {t('landing.caregivers.select')}
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Plant Journey Section */}
        <section id="plant-journey" className="py-24 px-6 sm:px-12 md:px-16 bg-gradient-to-br from-[#f8f9ff] to-[#e5eeff] dark:from-slate-950 dark:to-slate-900 overflow-hidden scroll-mt-20">
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] dark:text-slate-100 mb-4">{t('landing.plant.title')}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {t('landing.plant.description')}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 items-end justify-items-center">
              <div className="text-center space-y-4">
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-dashed border-slate-300 dark:border-slate-700">
                  <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500">circle</span>
                </div>
                <div className="font-bold text-slate-600 dark:text-slate-300">{t('landing.plant.day0')}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('landing.plant.day0Desc')}</p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
                  <span className="material-symbols-outlined text-5xl text-teal-600/50 dark:text-teal-400/50">grass</span>
                </div>
                <div className="font-bold text-slate-600 dark:text-slate-300">{t('landing.plant.day7')}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('landing.plant.day7Desc')}</p>
              </div>

              <div className="text-center space-y-4 scale-110">
                <div className="w-32 h-32 sm:w-36 sm:h-36 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-teal-600 dark:border-teal-400 shadow-2xl relative">
                  <span className="material-symbols-outlined text-6xl sm:text-7xl text-teal-600 dark:text-teal-400" style={{ fontVariationSettings: '"FILL" 1' }}>
                    eco
                  </span>
                  <Badge variant="default" className="absolute -top-2 -right-2 bg-teal-600 dark:bg-teal-500 text-white text-[10px] font-bold px-2 py-1 rounded-full border-none">
                    {t('landing.plant.active')}
                  </Badge>
                </div>
                <div className="font-bold text-teal-700 dark:text-teal-400">{t('landing.plant.day30')}</div>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">{t('landing.plant.day30Desc')}</p>
              </div>

              <div className="text-center space-y-4 opacity-50">
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
                  <span className="material-symbols-outlined text-6xl text-teal-600/40 dark:text-teal-400/40">potted_plant</span>
                </div>
                <div className="font-bold text-slate-600 dark:text-slate-300">{t('landing.plant.day60')}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('landing.plant.day60Desc')}</p>
              </div>

              <div className="text-center space-y-4 opacity-50">
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
                  <span className="material-symbols-outlined text-7xl text-teal-600/40 dark:text-teal-400/40">local_florist</span>
                </div>
                <div className="font-bold text-slate-600 dark:text-slate-300">{t('landing.plant.day90')}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('landing.plant.day90Desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6 sm:px-12 md:px-16 bg-white dark:bg-slate-900">
          <div className="max-w-[1440px] mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] dark:text-slate-100 text-center mb-16">{t('landing.testimonials.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-8 rounded-[32px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-none">
                <p className="text-base text-slate-600 dark:text-slate-300 italic mb-8">
                  "{t('landing.testimonials.t1Text')}"
                </p>
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-none">
                    <AvatarImage src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" alt="Margaret" className="object-cover" />
                    <AvatarFallback>M</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-[#0b1c30] dark:text-slate-100">{t('landing.testimonials.t1Author')}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t('landing.testimonials.t1Age')}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 rounded-[32px] bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 flex flex-col justify-between scale-105 shadow-xl">
                <p className="text-base text-slate-700 dark:text-slate-300 italic mb-8">
                  "{t('landing.testimonials.t2Text')}"
                </p>
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-none">
                    <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Robert" className="object-cover" />
                    <AvatarFallback>R</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-[#0b1c30] dark:text-slate-100">{t('landing.testimonials.t2Author')}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t('landing.testimonials.t2Age')}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 rounded-[32px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-none">
                <p className="text-base text-slate-600 dark:text-slate-300 italic mb-8">
                  "{t('landing.testimonials.t3Text')}"
                </p>
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-none">
                    <AvatarImage src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80" alt="Dorothy" className="object-cover" />
                    <AvatarFallback>D</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-[#0b1c30] dark:text-slate-100">{t('landing.testimonials.t3Author')}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t('landing.testimonials.t3Age')}</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 px-6 sm:px-12 md:px-16 bg-slate-50 dark:bg-slate-800/40 scroll-mt-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1c30] dark:text-slate-100 text-center mb-12">{t('landing.faq.title')}</h2>
            <div className="space-y-4">
              <details className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer" open>
                <summary className="flex justify-between items-center font-bold text-lg text-[#0b1c30] dark:text-slate-100 list-none">
                  {t('landing.faq.q1Title')}
                  <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {t('landing.faq.q1Answer')}
                </p>
              </details>

              <details className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <summary className="flex justify-between items-center font-bold text-lg text-[#0b1c30] dark:text-slate-100 list-none">
                  {t('landing.faq.q2Title')}
                  <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {t('landing.faq.q2Answer')}
                </p>
              </details>

              <details className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <summary className="flex justify-between items-center font-bold text-lg text-[#0b1c30] dark:text-slate-100 list-none">
                  {t('landing.faq.q3Title')}
                  <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {t('landing.faq.q3Answer')}
                </p>
              </details>

              <details className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <summary className="flex justify-between items-center font-bold text-lg text-[#0b1c30] dark:text-slate-100 list-none">
                  {t('landing.faq.q4Title')}
                  <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {t('landing.faq.q4Answer')}
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6 sm:px-12 md:px-16 my-8">
          <div className="max-w-[1440px] mx-auto">
            <Card className="bg-teal-600 dark:bg-slate-900 rounded-[50px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl dark:border dark:border-slate-800">
              <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white dark:text-teal-400">{t('landing.cta.title')}</h2>
                <p className="text-teal-100 dark:text-slate-400 text-lg">
                  {t('landing.cta.description')}
                </p>
                <div className="pt-6">
                  <Button size="lg" className="bg-white dark:bg-teal-600 text-teal-700 dark:text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-teal-50 dark:hover:bg-teal-700 transition-all h-auto shadow-xl" asChild>
                    <Link href={ctaBtnHref}>
                      <span>{ctaBtnText}</span>
                      <span className="material-symbols-outlined rtl:rotate-180">arrow_forward</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-6 sm:px-12 md:px-16 max-w-[1440px] mx-auto mb-16">
          <div className="space-y-4">
            <div className="text-xl font-extrabold text-teal-700 dark:text-teal-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600 dark:text-teal-400" style={{ fontVariationSettings: '"FILL" 1' }}>
                medical_services
              </span>
              MediMind
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {t('landing.footer.desc')}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-widest text-xs">{t('landing.footer.patientCare')}</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <a className="text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors" href="#">{t('landing.footer.startTracking')}</a>
              <a className="text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors" href="#caregivers" onClick={(e) => {
                e.preventDefault();
                document.getElementById('caregivers')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                {t('landing.nav.caregivers')}
              </a>
              <a className="text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors" href="#plant-journey" onClick={(e) => {
                e.preventDefault();
                document.getElementById('plant-journey')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                {t('landing.nav.plantJourney')}
              </a>
              <a className="text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors" href="#">{t('landing.footer.safety')}</a>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-widest text-xs">{t('landing.footer.company')}</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <a className="text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors" href="#">{t('landing.footer.mission')}</a>
              <a className="text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors" href="#">{t('landing.footer.privacy')}</a>
              <a className="text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors" href="#">{t('landing.footer.terms')}</a>
              <a className="text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors" href="#">{t('landing.footer.support')}</a>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-widest text-xs">{t('landing.footer.platform')}</h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{t('landing.footer.healthSystem')}</p>
          </div>
        </div>

        <div className="px-6 sm:px-12 md:px-16 max-w-[1440px] mx-auto text-center border-t border-slate-200 dark:border-slate-800 pt-8">
          <p className="text-slate-500 dark:text-slate-400 text-xs">{t('landing.footer.rights')}</p>
        </div>
      </footer>
    </div>
  );
}
