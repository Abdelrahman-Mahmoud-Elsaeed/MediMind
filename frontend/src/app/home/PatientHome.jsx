'use client';
import React, { useState } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { WelcomeBanner, TimelineCard, HealthSummary, CaregiverCard, QuickActions, } from '@/modules/dashboard';
import { DashboardMedicationCabinet as MedicationCabinet } from '@/modules/medication';
import { useTranslation } from '@/shared/lib/i18nContext';

export function PlantGrowthTimeline() {
  const { locale } = useTranslation();
  const isRtl = locale === 'ar';
  const [activeStep, setActiveStep] = useState(2);
  const [celebrate, setCelebrate] = useState(false);

  const milestones = [
    {
      step: 0,
      dayTextAr: "اليوم 0",
      dayTextEn: "Day 0",
      titleAr: "البذرة والبداية",
      titleEn: "Seed & Start",
      icon: "potted_plant",
      badgeAr: "شارة البداية",
      badgeEn: "Starter Badge",
      descAr: "بداية رحلتك الصحية الحقيقية. كل خطوة صغيرة اليوم تصنع فارقاً كبيراً غداً.",
      descEn: "The beginning of your health journey. Small habits create big change."
    },
    {
      step: 1,
      dayTextAr: "اليوم 7",
      dayTextEn: "Day 7",
      titleAr: "إنبات برعم الصبر",
      titleEn: "First Sprout",
      icon: "eco",
      badgeAr: "وسام أسبوع الالتزام",
      badgeEn: "1-Week Habit Badge",
      descAr: "ممتاز! أتممت أسبوعاً كاملاً بانتظام، وبدأت عادتك الصحية بالتشكل والثبات.",
      descEn: "Great job! Completed 1 full week, your healthy habit is taking root."
    },
    {
      step: 2,
      dayTextAr: "اليوم 30",
      dayTextEn: "Day 30",
      titleAr: "نمو الشتلة بانتظام",
      titleEn: "Growing Strong",
      icon: "local_florist",
      badgeAr: "درع الشهر الذهبي",
      badgeEn: "30-Day Golden Shield",
      descAr: "أحسنت! أتممت 30 يوماً متواصلة من الالتزام، وتم تقليل خطورة نسيان الجرعات بنسبة 80%!",
      descEn: "Amazing! 30 continuous days completed. Reduced missed doses risk by 80%!"
    },
    {
      step: 3,
      dayTextAr: "اليوم 60",
      dayTextEn: "Day 60",
      titleAr: "تفتح الأوراق والزهر",
      titleEn: "Blooming Leaves",
      icon: "nature",
      badgeAr: "وسام الشفاء المستدام",
      badgeEn: "Sustainable Health Badge",
      descAr: "إنجاز استثنائي! 60 يوماً من الانضباط التام وتحسن كبير في المؤشرات الطبية.",
      descEn: "Exceptional achievement! 60 days of discipline and notable health improvements."
    },
    {
      step: 4,
      dayTextAr: "اليوم +90",
      dayTextEn: "Day 90+",
      titleAr: "شجرة الصحة المزهرة",
      titleEn: "Blooming Health Tree",
      icon: "forest",
      badgeAr: "تاج الصحة الدائمة",
      badgeEn: "Crown of Health",
      descAr: "نمط حياتك أصبح نموذجاً بالصحة والازدهار الكامل.",
      descEn: "Outstanding! Your health routine is a model of full vitality."
    }
  ];

  const current = milestones[activeStep];

  const handleStepClick = (stepIndex) => {
    setActiveStep(stepIndex);
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 1500);
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900/90 rounded-[28px] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs relative overflow-hidden transition-all duration-200">
      {celebrate && (
        <div className="absolute inset-0 bg-teal-500/10 pointer-events-none animate-pulse transition-all"></div>
      )}

      {/* Title Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[11px] font-extrabold text-teal-700 dark:text-teal-400 uppercase tracking-widest mb-1 block">
            {isRtl ? "شاهد نفسك تزهر وتنمو" : "PLANT GROWTH TIMELINE"}
          </span>
          <h2 className="text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isRtl ? "مراحل ازدهار الالتزام الصحي" : "Milestones of Health Blooming"}
          </h2>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center shadow-xs">
          <span className="material-symbols-outlined text-xl">forest</span>
        </div>
      </div>

      {/* Timeline Node Connector Line Container */}
      <div className="relative my-6 px-1">
        {/* Circle Buttons & Connector Line Row */}
        <div className="relative h-12 flex justify-between items-center z-10">
          {/* Background Line */}
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 dark:bg-slate-800 rounded-full -translate-y-1/2 z-0"></div>

          {/* Dynamic Filled Progress Line */}
          <div
            className="absolute top-1/2 h-1 bg-teal-500 rounded-full -translate-y-1/2 z-0 transition-all duration-500 shadow-xs"
            style={{
              left: isRtl ? "auto" : "1rem",
              right: isRtl ? "1rem" : "auto",
              width: `calc((100% - 2rem) * ${activeStep / (milestones.length - 1)})`
            }}
          ></div>

          {/* Milestone Circle Nodes */}
          {milestones.map((m) => {
            const isSelected = activeStep === m.step;
            const isPassed = activeStep >= m.step;

            return (
              <div
                key={m.step}
                onClick={() => handleStepClick(m.step)}
                className="relative flex items-center justify-center cursor-pointer group z-10"
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isSelected
                      ? "bg-teal-600 dark:bg-teal-500 text-white scale-110 shadow-md ring-4 ring-teal-500/20"
                      : isPassed
                      ? "bg-teal-100 dark:bg-teal-950/90 text-teal-700 dark:text-teal-400 border border-teal-300 dark:border-teal-800/60 hover:scale-105"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 hover:scale-105"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{m.icon}</span>
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
              <div key={m.step} className="w-11 text-center">
                <span
                  className={`text-xs font-black block transition-colors ${
                    isSelected ? "text-teal-600 dark:text-teal-400" : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {isRtl ? m.dayTextAr : m.dayTextEn}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Milestone Detail Box */}
      <div className="mt-6 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-2xl">{current.icon}</span>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isRtl ? current.titleAr : current.titleEn}
            </h3>
            <span className="bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 px-3 py-1 rounded-full text-xs font-extrabold border border-teal-200 dark:border-teal-700/50">
              {isRtl ? current.badgeAr : current.badgeEn}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            {isRtl ? current.descAr : current.descEn}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PatientHome() {
    return (<MainLayout activePath="/home">
      {/* Container with optimal maximum width */}
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Hero Welcome Banner */}
        <WelcomeBanner />

        {/* Dashboard CSS Grid Layout (Left 2fr, Right 1fr, Gap 24px) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN (2fr) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Timeline Card */}
            <TimelineCard />

            {/* Medication Cabinet List View */}
            <MedicationCabinet />
          </div>

          {/* RIGHT COLUMN (1fr) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Health Summary Panel / Biometric Waveform */}
            <HealthSummary />

            {/* Plant Growth Timeline Section */}
            <PlantGrowthTimeline />

            {/* Caregivers Circle Card */}
            <CaregiverCard />
          </div>
        </div>

        {/* Bottom Quick Action Cards */}
        <QuickActions />
      </div>
    </MainLayout>);
}
