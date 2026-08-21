'use client';

import React from 'react';
import { useTranslation } from '@/shared/lib/i18nContext';

export function LandingTestimonials() {
  const { locale, dir } = useTranslation();
  const isRtl = locale === 'ar' || dir === 'rtl';

  const testimonials = [
    { text: isRtl ? "غير هذا التطبيق حياتي كلياً. أستطيع متابعة جميع أدوية والدي البالغ من العمر 78 عاماً بكل سهولة ودون أي قلق." : "This app completely transformed my peace of mind. I can easily track all medications for my 78-year-old father with total confidence.", author: "Hoda El-Sayed", age: isRtl ? "مقدمة رعاية عائلية، القاهرة" : "Family Caregiver, Cairo", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80", featured: false },
    { text: isRtl ? "التنبيهات الفورية وشجرة العافية التفاعلية جعلت التزامي بجرعات السكري والضغط 100% لأول مرة منذ سنوات!" : "Instant reminders and the interactive health plant boosted my diabetes and blood pressure adherence to 100% for the first time in years!", author: "Tariq Ziad", age: isRtl ? "مريض، 52 عاماً، دبي" : "Patient, 52 yrs, Dubai", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", featured: true },
    { text: isRtl ? "أوصي بـ MediMind لجميع مرضاي. التقارير الأسبوعية والشهرية تساعدني كطبيب على ضبط الخطة العلاجية بدقة." : "I recommend MediMind to all my chronic patients. The detailed adherence reports help me refine treatment plans effectively.", author: "Dr. Laila Mansour", age: isRtl ? "استشارية أمراض باطنة، الرياض" : "Internal Medicine Consultant, Riyadh", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80", featured: false }
  ];

  return (
    <section className="py-28 px-6 sm:px-12 md:px-16 bg-gradient-to-br from-[#f0f5ff] to-white dark:from-[#080d1a] dark:to-[#0b1120] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-600/8 border border-teal-500/20 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-widest mb-5">
            <span className="material-symbols-outlined text-base">format_quote</span>
            {isRtl ? 'آراء عملائنا' : 'Patient Stories'}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0a1628] dark:text-slate-50 tracking-tight">
            {isRtl ? "قصص نجاح واقعية مع MediMind" : "Real Success Stories with MediMind"}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t2, i) => (
            <div key={i} className={`relative p-8 rounded-3xl flex flex-col justify-between transition-all duration-300 ${
              t2.featured
                ? 'bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-2xl shadow-teal-600/25 scale-[1.03] hover:scale-[1.06]'
                : 'bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/60 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl'
            }`}>
              <div className={`absolute top-6 ${isRtl ? 'left-7' : 'right-7'} text-5xl font-black leading-none select-none ${t2.featured ? 'text-white/20' : 'text-teal-500/15 dark:text-teal-400/10'}`}>&ldquo;</div>
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
  );
}

export default LandingTestimonials;
