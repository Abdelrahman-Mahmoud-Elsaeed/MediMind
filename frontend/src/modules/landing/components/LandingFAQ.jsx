'use client';

import React from 'react';
import { useTranslation } from '@/shared/lib/i18nContext';

export function LandingFAQ() {
  const { locale, dir } = useTranslation();
  const isRtl = locale === 'ar' || dir === 'rtl';

  const faqItems = [
    {
      qEn: "How does MediMind send dose reminder notifications?",
      qAr: "كيف يرسل تطبيق MediMind تنبيهات التذكير بالجرعات؟",
      aEn: "MediMind automatically sends push notifications and WhatsApp alerts at your scheduled dose times.",
      aAr: "يرسل التطبيق تنبيهات منبثقة عبر الهاتف ورسائل واتساب فورية في المواعيد المحددة لجرعاتك.",
      open: true,
    },
    {
      qEn: "Can I connect my family members or caregiver?",
      qAr: "هل يمكنني ربط أفراد عائلتي أو مقدم الرعاية الخاص بي؟",
      aEn: "Yes! You can invite caregivers via email to join your Care Circle and monitor adherence in real-time.",
      aAr: "نعم! يمكنك دعوة مقدمي الرعاية عبر البريد الإلكتروني للانضمام لدائرة الرعاية ومتابعة الالتزام فورياً.",
    },
    {
      qEn: "Is my medical data secure and private?",
      qAr: "هل بياناتي الطبية آمنة وتتمتع بالخصوصية؟",
      aEn: "All data is encrypted with 256-bit SSL encryption and complies with healthcare privacy standards.",
      aAr: "جميع البيانات مشفرة باستخدام تشفير SSL 256-بت وتلتزم بمعايير الخصوصية الصحية.",
    },
    {
      qEn: "What happens if I miss a medication dose?",
      qAr: "ماذا يحدث إذا فاتني تناول إحدى الجرعات؟",
      aEn: "MediMind logs the missed dose and sends an alert to your designated caregiver so they can support you.",
      aAr: "يسجل التطبيق الجرعة الفائتة ويرسل تنبيهاً لمقدم الرعاية المرتبط بحسابك لمساعدتك.",
    },
  ];

  return (
    <section id="faq" className="py-28 px-6 sm:px-12 md:px-16 bg-white dark:bg-[#0b1120] scroll-mt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(20,184,166,0.05)_0%,transparent_60%)] pointer-events-none" />
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-600/8 border border-teal-500/20 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-widest mb-5">
            <span className="material-symbols-outlined text-base">help_outline</span>
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0a1628] dark:text-slate-50 tracking-tight">
            {isRtl ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
          </h2>
        </div>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="group bg-slate-50 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 hover:border-teal-300/50 dark:hover:border-teal-700/40 cursor-pointer shadow-none hover:shadow-lg transition-all duration-200"
              {...(item.open ? { open: true } : {})}
            >
              <summary className="flex justify-between items-center font-bold text-lg text-[#0a1628] dark:text-slate-100 list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none gap-4">
                <span>{isRtl ? item.qAr : item.qEn}</span>
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
              <p className="mt-4 text-slate-600 dark:text-slate-300 text-base font-medium leading-relaxed border-t border-slate-200/60 dark:border-slate-800/60 pt-4">
                {isRtl ? item.aAr : item.aEn}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LandingFAQ;
