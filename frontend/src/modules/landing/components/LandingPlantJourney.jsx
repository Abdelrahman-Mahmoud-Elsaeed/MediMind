'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/shared/lib/i18nContext';

export function LandingPlantJourney({ isUserLoggedIn }) {
  const { locale, dir } = useTranslation();
  const isRtl = locale === 'ar' || dir === 'rtl';
  const [activeStep, setActiveStep] = useState(0);

  const ctaHref = isUserLoggedIn ? "/home" : "/register";

  const milestones = [
    {
      step: 0,
      icon: "eco",
      dayAr: "اليوم 1",
      dayEn: "Day 1",
      titleAr: "بذرة العافية: بداية الرحلة",
      titleEn: "Wellness Seed: Journey Begins",
      badgeAr: "البداية القوية",
      badgeEn: "Strong Start",
      descAr: "زرعت أول بذرة صحية بتناول جرعتك الأولى في موعدها المظبوط. التزامك هو ما سيمنحها الحياة!",
      descEn: "You planted your first health seed by taking your initial dose right on time. Your consistency brings it to life!"
    },
    {
      step: 1,
      icon: "local_florist",
      dayAr: "اليوم 7",
      dayEn: "Day 7",
      titleAr: "برعم جديد: أسبوع كامل من الانضباط",
      titleEn: "Fresh Sprout: Full Week of Consistency",
      badgeAr: "7 أيام متواصلة",
      badgeEn: "7 Days Streak",
      descAr: "نبتتك الصغير بدأت بالظهور وأصبحت تنمو باستمرار بعد أسبوع من الالتزام التام دون تفويت أي جرعة.",
      descEn: "Your little sprout is breaking through the soil, growing consistently after a full week without missing a single dose."
    },
    {
      step: 2,
      icon: "park",
      dayAr: "اليوم 30",
      dayEn: "Day 30",
      titleAr: "نبتة يانعة: شهر من الصحة المتكاملة",
      titleEn: "Thriving Plant: Month of Complete Health",
      badgeAr: "إنجاز 30 يوماً",
      badgeEn: "30-Day Milestone",
      descAr: "تحولت عادتك اليومية إلى شجيرة صحية قوية! تحسن ملحوظ في معدل انتظامك وصحتك العامة.",
      descEn: "Your daily habit has transformed into a robust healthy plant! Remarkable improvement in adherence and overall vitality."
    },
    {
      step: 3,
      icon: "spa",
      dayAr: "اليوم 90",
      dayEn: "Day 90",
      titleAr: "شجرة مزهرة: نمط حياة صحي دائم",
      titleEn: "Blooming Tree: Everlasting Healthy Lifestyle",
      badgeAr: "الالتزام التام",
      badgeEn: "Mastery Level",
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
            {/* Background Track Line */}
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

export default LandingPlantJourney;
