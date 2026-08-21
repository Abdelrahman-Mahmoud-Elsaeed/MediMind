'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/shared/lib/i18nContext';

export function LandingHero({ isUserLoggedIn }) {
  const { t, locale, dir } = useTranslation();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const isRtl = locale === 'ar' || dir === 'rtl';

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.75;
    }
  }, [isVideoLoaded]);

  const heroBtnHref = isUserLoggedIn ? "/home" : "/register";
  const heroBtnText = isUserLoggedIn ? (isRtl ? "لوحة التحكم" : "Dashboard") : t('landing.nav.goJourney');

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-[#f0f5ff] to-[#e5eeff] dark:from-[#080d1a] dark:to-[#0d1528]">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#0c1322]">
        <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/50 via-slate-900 to-emerald-950/60 z-0" />

        <video
          ref={videoRef}
          src="/videos/hero-bg-merged.mp4"
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={() => {
            setIsVideoLoaded(true);
            if (videoRef.current) videoRef.current.playbackRate = 1.75;
          }}
          className={`w-full h-full object-cover object-right md:object-center scale-105 transition-opacity duration-700 pointer-events-none ${
            isVideoLoaded ? "opacity-90 dark:opacity-80" : "opacity-0"
          }`}
        />
        <div className={`absolute inset-0 ${isRtl ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-[#f0f5ff]/90 via-[#f0f5ff]/55 to-transparent dark:from-[#080d1a]/95 dark:via-[#080d1a]/65 dark:to-[#080d1a]/20`} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f5ff]/20 via-transparent to-[#f0f5ff]/85 dark:from-[#080d1a]/20 dark:via-transparent dark:to-[#080d1a]/85" />
        <div className="w-full h-full absolute inset-0 bg-[radial-gradient(#006c4e_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#14b8a6_1.5px,transparent_1.5px)] [background-size:28px_28px] opacity-8 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 dark:bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-20 px-6 sm:px-12 md:px-16 max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-20">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-teal-600/12 dark:bg-teal-400/10 border border-teal-600/25 dark:border-teal-400/20 text-teal-700 dark:text-teal-300 font-bold text-xs uppercase tracking-widest backdrop-blur-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 animate-pulse inline-block"></span>
            {t('landing.hero.badge')}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4rem] font-black text-[#0a1628] dark:text-slate-50 leading-[1.1] tracking-tight">
            {t('landing.hero.title1')} <br />
            {t('landing.hero.title2')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500 dark:from-teal-400 dark:to-emerald-300">{t('landing.hero.title3')}</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-lg leading-relaxed">
            {t('landing.hero.description')}
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href={heroBtnHref}
              className="group bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-emerald-500 text-white px-9 py-4 rounded-full font-bold text-lg active:scale-95 transition-all flex items-center gap-2.5 shadow-xl shadow-teal-600/30 dark:shadow-teal-900/50 hover:scale-105 hover:shadow-teal-500/40"
            >
              <span>{heroBtnText}</span>
              <span className="material-symbols-outlined rtl:rotate-180 group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </Link>
            <Link
              href="#features"
              onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="px-8 py-4 rounded-full font-semibold text-base border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 backdrop-blur-sm transition-all hover:scale-105"
            >
              {t('landing.nav.features')}
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap gap-6 sm:gap-10 items-center">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-100/80 dark:bg-teal-950/60 backdrop-blur-sm flex items-center justify-center text-teal-700 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40 shadow-sm">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <div>
                <div className="font-black text-[#0a1628] dark:text-slate-50 text-2xl leading-none">{t('landing.hero.stat1Value')}</div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{t('landing.hero.stat1Label')}</div>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-300/60 dark:bg-slate-700/60" />
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-100/80 dark:bg-teal-950/60 backdrop-blur-sm flex items-center justify-center text-teal-700 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40 shadow-sm">
                <span className="material-symbols-outlined text-2xl">sentiment_satisfied</span>
              </div>
              <div>
                <div className="font-black text-[#0a1628] dark:text-slate-50 text-2xl leading-none">{t('landing.hero.stat2Value')}</div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{t('landing.hero.stat2Label')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Card Graphic (Translucent Glassmorphism) */}
        <div className="relative flex justify-center lg:justify-end items-center">
          <div className="w-full max-w-[320px] bg-white/40 dark:bg-slate-950/40 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-white/40 dark:border-slate-800/40 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#0b1c30] dark:text-slate-100">{t('landing.hero.todayMeds')}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">{t('landing.hero.todayDate')}</p>
              </div>
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-300/50 dark:stroke-slate-700/50" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-teal-600 dark:stroke-teal-400" strokeWidth="3" strokeDasharray="75, 100" strokeLinecap="round" />
                </svg>
                <span className="absolute text-[11px] font-extrabold text-teal-700 dark:text-teal-400">75%</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 bg-teal-500/10 dark:bg-teal-950/30 backdrop-blur-sm rounded-xl border border-teal-500/20 dark:border-teal-900/30">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg text-teal-600 dark:text-teal-400">check_circle</span>
                  <div>
                    <div className="font-bold text-sm text-[#0b1c30] dark:text-slate-100">Glucophage 500mg</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">8:00 AM • {isRtl ? "تم التناول" : "Taken"}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-teal-500/10 dark:bg-teal-950/30 backdrop-blur-sm rounded-xl border border-teal-500/20 dark:border-teal-900/30">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg text-teal-600 dark:text-teal-400">check_circle</span>
                  <div>
                    <div className="font-bold text-sm text-[#0b1c30] dark:text-slate-100">Concor 5mg</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">8:00 AM • {isRtl ? "تم التناول" : "Taken"}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/30 dark:border-slate-800/30">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg text-slate-400">circle</span>
                  <div>
                    <div className="font-bold text-sm text-[#0b1c30] dark:text-slate-100">Glucophage 500mg</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">8:00 PM • {isRtl ? "معلق" : "Pending"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-300/30 dark:border-slate-800/40 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                <span className="material-symbols-outlined text-base text-teal-600 dark:text-teal-400">schedule</span>
                {isRtl ? "الجرعة القادمة: 8:00 مساءً" : "Next Dose: 8:00 PM"}
              </div>
              <span className="material-symbols-outlined text-base text-teal-600 dark:text-teal-400 animate-bounce">notifications_active</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LandingHero;
