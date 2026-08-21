'use client';

import React from 'react';
import { useTranslation } from '@/shared/lib/i18nContext';

export function LandingFullManagement() {
  const { locale, dir } = useTranslation();
  const isRtl = locale === 'ar' || dir === 'rtl';

  return (
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0a1628] dark:text-slate-50 tracking-tight leading-tight">
              {isRtl ? "إدارة كاملة لخطتك العلاجية في مكان واحد" : "Comprehensive Care Management All In One Place"}
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
              {isRtl 
                ? "تابع أدويتك، جدول الجرعات، وتواصل مع مقدم الرعاية الصحية بسهولة ودقة متناهية."
                : "Monitor medications, dose schedules, and care circle connections with total precision."}
            </p>
            <ul className="space-y-4 pt-2">
              {[
                isRtl ? "تنبيهات جرعات ذكية عبر الواتساب والإشعارات" : "Smart dose alerts via WhatsApp and push notifications",
                isRtl ? "متابعة فورية للجرعات الفائتة وتحديثات الأدوية" : "Instant missed dose tracking & inventory updates",
                isRtl ? "ربط فوري بين المريض ومقدم الرعاية العائلي" : "Seamless connection between patient & family caregiver"
              ].map((item, i) => (
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

          <h3 className="font-bold text-2xl mb-4 text-[#0b1c30] dark:text-slate-100">
            {isRtl ? "جدول أدوية اليوم" : "Today's Medication Schedule"}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-teal-50/70 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-900/60 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold shadow-sm">
                  <span className="material-symbols-outlined">done</span>
                </div>
                <div>
                  <div className="font-bold text-[#0b1c30] dark:text-slate-100">Atorvastatin 20mg</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">8:00 AM • {isRtl ? "تم التناول" : "Taken"}</div>
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
                  <div className="text-sm text-slate-500 dark:text-slate-400">12:30 PM • {isRtl ? "معلق" : "Pending"}</div>
                </div>
              </div>
              <button className="bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-teal-700 transition cursor-pointer">
                {isRtl ? "تأكيد التناول" : "Mark Taken"}
              </button>
            </div>

            <div className="flex items-center justify-between p-5 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 opacity-60">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <div className="font-bold text-[#0b1c30] dark:text-slate-100">Lisinopril 10mg</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">8:00 PM • {isRtl ? "قادم" : "Upcoming"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LandingFullManagement;
