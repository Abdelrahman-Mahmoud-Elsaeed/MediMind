'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/shared/lib/i18nContext';

export function LandingCTA({ isUserLoggedIn }) {
  const { t, locale, dir } = useTranslation();
  const isRtl = locale === 'ar' || dir === 'rtl';

  const ctaBtnHref = isUserLoggedIn ? "/home" : "/register";
  const ctaBtnText = isUserLoggedIn ? (isRtl ? "لوحة التحكم" : "Dashboard") : t('landing.cta.startFree');

  return (
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
  );
}

export default LandingCTA;
