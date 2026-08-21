'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/shared/lib/i18nContext';

export function LandingCaregivers({ isUserLoggedIn }) {
  const { locale, dir } = useTranslation();
  const isRtl = locale === 'ar' || dir === 'rtl';

  const caregiversHref = isUserLoggedIn ? "/caregivers" : "/register";
  const card1Href = isUserLoggedIn ? "/caregivers" : "/register";
  const card2Href = isUserLoggedIn ? "/caregivers" : "/register";
  const card3Href = isUserLoggedIn ? "/caregivers" : "/register";

  return (
    <section id="caregivers" className="py-28 px-6 sm:px-12 md:px-16 bg-white dark:bg-[#0b1120] scroll-mt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.05)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.04)_0%,transparent_60%)] pointer-events-none" />
      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-600/8 border border-teal-500/20 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-widest mb-5">
              <span className="material-symbols-outlined text-base">people</span>
              {isRtl ? 'فريق الرعاية' : 'Care Team'}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0a1628] dark:text-slate-50 tracking-tight mb-4">
              {isRtl ? "مقدمو رعاية متميزون لمنح عائلتك الأمان" : "Dedicated Caregivers for Your Family's Safety"}
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
              {isRtl ? "اختر مقدم الرعاية المناسب لمتابعة الحالة الصحية وتنسيق الجدول الدوائي." : "Choose qualified caregivers to manage health adherence and dose scheduling."}
            </p>
          </div>
          <Link href={caregiversHref} className="group text-teal-600 dark:text-teal-400 font-bold flex items-center gap-2 hover:gap-3 transition-all whitespace-nowrap shrink-0 bg-teal-600/8 hover:bg-teal-600/15 px-5 py-2.5 rounded-full border border-teal-500/20 hover:border-teal-500/40">
            <span>{isRtl ? "عرض جميع مقدمي الرعاية" : "View All Caregivers"}</span>
            <span className="material-symbols-outlined rtl:rotate-180 group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Sarah Johnson', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80', bio: isRtl ? 'ممرضة متخصصة في رعاية كبار السن وإدارة الأدوية المزمنة.' : 'Senior care nurse specializing in chronic medication management.', price: '$25', href: card1Href },
            { name: 'Michael Torres', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80', bio: isRtl ? 'مقدم رعاية محترف ذو خبرة 8 سنوات في الرعاية المنزلية.' : 'Professional caregiver with 8+ years experience in home care.', price: '$28', href: card2Href, featured: true },
            { name: 'Amina Al-Farsi', img: 'https://images.unsplash.com/photo-1594824813566-88855ce78961?w=150&auto=format&fit=crop&q=80', bio: isRtl ? 'أخصائية متابعة التزام دوائي ورعاية صحية عائلية.' : 'Medication adherence specialist and family healthcare coordinator.', price: '$30', href: card3Href }
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
                  <span className="text-slate-500 dark:text-slate-400 text-sm">{isRtl ? '/ ساعة' : '/ hr'}</span>
                </div>
                <Link
                  href={caregiver.href}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-md shadow-teal-600/20"
                >
                  {isRtl ? 'اختيار' : 'Select'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LandingCaregivers;
