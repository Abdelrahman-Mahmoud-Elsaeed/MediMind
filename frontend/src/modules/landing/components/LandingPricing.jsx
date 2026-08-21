'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/shared/lib/i18nContext';

export function LandingPricing({ isUserLoggedIn }) {
  const { locale, dir } = useTranslation();
  const isRtl = locale === 'ar' || dir === 'rtl';

  const planBtnHref = isUserLoggedIn ? "/home" : "/register";

  const plans = [
    { name: isRtl ? "الباقة المجانية" : "Free Plan", price: "$0", desc: isRtl ? "مثالية للأفراد لمتابعة الأدوية والتنبيهات الأساسية." : "Ideal for individuals starting personal dose management.", features: [isRtl ? "تتبع حتى 5 أدوية" : "Up to 5 medications", isRtl ? "تنبيهات الهاتف الأساسية" : "Push notifications", isRtl ? "سجل الالتزام لآخر 7 أيام" : "7-day adherence logs"], popular: false },
    { name: isRtl ? "الباقة الاحترافية" : "Pro Plan", price: "$9.99", desc: isRtl ? "تنبيهات الواتساب ومشاركة دائرة الرعاية بدون حدود." : "WhatsApp alerts & full Care Circle sharing for peace of mind.", features: [isRtl ? "عدد لا محدود من الأدوية" : "Unlimited medications", isRtl ? "تنبيهات عبر الواتساب والإشعارات" : "WhatsApp + Push alerts", isRtl ? "ربط 3 مقدمي رعاية" : "Connect up to 3 caregivers", isRtl ? "تقارير طبية شاملة" : "Comprehensive medical reports"], popular: true },
    { name: isRtl ? "الباقة العائلية" : "Family Plan", price: "$19.99", desc: isRtl ? "رعاية صحية متكاملة لجميع أفراد الأسرة في حساب واحد." : "Complete healthcare management for the whole family.", features: [isRtl ? "حسابات متعددة للعائلة" : "Multiple family profiles", isRtl ? "ربط غير محدود لمقدمي الرعاية" : "Unlimited caregiver linking", isRtl ? "دعم طبي ذكي على مدار الساعة" : "24/7 Priority support"], popular: false }
  ];

  return (
    <section className="py-28 px-6 sm:px-12 md:px-16 bg-slate-50/70 dark:bg-slate-950/50">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-600/8 border border-teal-500/20 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-widest mb-5">
            <span className="material-symbols-outlined text-base">payments</span>
            {isRtl ? 'خطط الأسعار' : 'Pricing Plans'}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0a1628] dark:text-slate-50 tracking-tight">
            {isRtl ? "اختر الخطة المناسبة لاحتياجاتك" : "Choose the Right Plan for You"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div key={i} className={`relative p-8 rounded-3xl backdrop-blur-xl transition-all duration-300 border flex flex-col justify-between hover:shadow-2xl hover:scale-[1.03] ${
              plan.popular
                ? 'bg-gradient-to-br from-teal-50/90 via-white to-emerald-50/90 dark:from-teal-950/70 dark:via-slate-900 dark:to-emerald-950/50 border-teal-500/60 dark:border-teal-500/50 shadow-xl shadow-teal-500/10'
                : 'bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800/60'
            }`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-md">
                  {isRtl ? 'الأكثر اختياراً' : 'Most Popular'}
                </div>
              )}
              <div>
                <h3 className="font-bold text-xl text-[#0a1628] dark:text-slate-100 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-black text-teal-600 dark:text-teal-400">{plan.price}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{isRtl ? '/ شهرياً' : '/ month'}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium">{plan.desc}</p>
                <ul className="space-y-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 font-medium">
                      <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-lg">check_circle</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-8">
                <Link
                  href={planBtnHref}
                  className={`w-full text-center block py-3.5 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-md ${
                    plan.popular
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-teal-600 hover:text-white text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {isRtl ? 'ابدأ الآن' : 'Get Started'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LandingPricing;
