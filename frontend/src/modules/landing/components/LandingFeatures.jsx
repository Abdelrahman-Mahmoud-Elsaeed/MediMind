'use client';

import React from 'react';
import { useTranslation } from '@/shared/lib/i18nContext';

export function LandingFeatures() {
  const { t, locale, dir } = useTranslation();
  const isRtl = locale === 'ar' || dir === 'rtl';

  const features = [
    { icon: 'notifications_active', title: isRtl ? "تنبيهات جرعات ذكية" : "Smart Medication Alerts", desc: isRtl ? "تنبيهات فورية قابلة للتخصيص عبر الواتساب والإشعارات لحمايتك من نسيان أي جرعة." : "Customizable instant push & WhatsApp notifications to never miss a dose.", color: 'from-teal-500 to-emerald-500' },
    { icon: 'eco', title: isRtl ? "رحلة العافية التفاعلية" : "Interactive Wellness Journey", desc: isRtl ? "نظام تحفيزي بفيزياء نمو النبتة لتشجيعك على الالتزام اليومي وجعل العلاج ممتعاً." : "Gamified progress system where your plant blooms with every timely dose taken.", color: 'from-emerald-500 to-green-500' },
    { icon: 'diversity_1', title: isRtl ? "دائرة الرعاية العائلية" : "Family Care Circle", desc: isRtl ? "ربط فوري بين المريض ومقدم الرعاية العائلي لمتابعة الالتزام وتلقي إنذارات الطوارئ." : "Seamless patient-caregiver linking for adherence tracking & missed dose alerts.", color: 'from-teal-400 to-cyan-500' },
    { icon: 'monitoring', title: isRtl ? "تحليلات صحية دقيقة" : "Precision Health Analytics", desc: isRtl ? "تقارير أسبوعية وشهرية شاملة لمعدل الالتزام والنتائج الصحية لمشاركتها مع طبيبك." : "Comprehensive weekly & monthly adherence reporting for your doctor.", color: 'from-cyan-500 to-teal-500' }
  ];

  return (
    <section id="features" className="py-28 px-6 sm:px-12 md:px-16 bg-white dark:bg-[#0b1120] scroll-mt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(20,184,166,0.06)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="max-w-[1440px] mx-auto text-center mb-20 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-600/8 dark:bg-teal-400/8 border border-teal-500/20 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-widest mb-5">
          <span className="material-symbols-outlined text-base">auto_awesome</span>
          {isRtl ? 'ما يميزنا' : 'Our Features'}
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0a1628] dark:text-slate-50 mb-5 tracking-tight">
          {t('landing.features.title')}
        </h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t('landing.features.subtitle')}
        </p>
      </div>

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {features.map((feature, i) => (
          <div key={i} className="group relative p-7 rounded-3xl overflow-hidden bg-white dark:bg-slate-900/80 backdrop-blur-xl hover:bg-gradient-to-br hover:from-teal-50/80 hover:to-white dark:hover:from-teal-950/40 dark:hover:to-slate-900 transition-all duration-300 border border-slate-200/80 dark:border-slate-800/60 hover:border-teal-300/60 dark:hover:border-teal-700/50 text-center shadow-sm hover:shadow-xl hover:shadow-teal-500/8 hover:scale-[1.03] hover:-translate-y-2 cursor-default">
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
  );
}

export default LandingFeatures;
