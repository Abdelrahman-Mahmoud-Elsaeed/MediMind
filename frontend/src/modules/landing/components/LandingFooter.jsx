'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/shared/lib/i18nContext';

export function LandingFooter({ isUserLoggedIn }) {
  const { t, locale } = useTranslation();
  const isRtl = locale === 'ar';

  const heroBtnHref = isUserLoggedIn ? "/home" : "/register";

  return (
    <footer className="bg-[#050a14] text-white border-t border-slate-800/60 relative overflow-hidden">
      {/* Footer ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(16,185,129,0.04)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

      {/* Main footer content */}
      <div className="relative z-10 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 px-6 sm:px-12 md:px-16 max-w-[1440px] mx-auto mb-14">
          <div className="space-y-5 lg:col-span-1">
            <div className="text-xl font-black flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-500/15">
                <img
                  src="/images/logo.png"
                  alt="MediMind Logo"
                  className="h-8 w-auto object-contain"
                />
              </div>
              <span className="tracking-tight">
                <span className="text-[#60a5fa]">Medi</span>
                <span className="text-[#34d399]">Mind</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              {t('landing.footer.desc')}
            </p>
            {/* Trust badges */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                {isRtl ? 'آمن ومشفر' : 'HIPAA Safe'}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase tracking-widest text-xs pb-2 border-b border-slate-800/80">{t('landing.footer.patientCare')}</h4>
            <nav className="flex flex-col gap-2.5 text-sm">
              <a className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group" href="#">
                <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                {t('landing.footer.startTracking')}
              </a>
              <a
                className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group"
                href="#caregivers"
                onClick={(e) => { e.preventDefault(); document.getElementById('caregivers')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                {t('landing.nav.caregivers')}
              </a>
              <a
                className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group"
                href="#plant-journey"
                onClick={(e) => { e.preventDefault(); document.getElementById('plant-journey')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                {t('landing.nav.plantJourney')}
              </a>
              <a className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group" href="#">
                <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                {t('landing.footer.safety')}
              </a>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase tracking-widest text-xs pb-2 border-b border-slate-800/80">
              {isRtl ? 'بوابات المهنيين' : 'Professional Portals'}
            </h4>
            <nav className="flex flex-col gap-2.5 text-sm">
              <Link
                href="/register/pharmacy"
                className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group"
              >
                <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                {isRtl ? 'تسجيل الصيدليات' : 'Pharmacy Registration'}
              </Link>
              <Link
                href="/register/doctor"
                className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group"
              >
                <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                {isRtl ? 'تسجيل الأطباء' : 'Doctor Registration'}
              </Link>
              <Link
                href="/register/caregiver"
                className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group"
              >
                <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                {isRtl ? 'تسجيل مقدمي الرعاية' : 'Caregiver Registration'}
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase tracking-widest text-xs pb-2 border-b border-slate-800/80">{t('landing.footer.company')}</h4>
            <nav className="flex flex-col gap-2.5 text-sm">
              <a className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group" href="#">
                <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                {t('landing.footer.mission')}
              </a>
              <a className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group" href="#">
                <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                {t('landing.footer.privacy')}
              </a>
              <a className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group" href="#">
                <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                {t('landing.footer.terms')}
              </a>
              <a className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group" href="#">
                <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-teal-500 transition-all" />
                {t('landing.footer.support')}
              </a>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase tracking-widest text-xs pb-2 border-b border-slate-800/80">{t('landing.footer.platform')}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{t('landing.footer.healthSystem')}</p>
            <Link href={heroBtnHref} className="group mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-teal-600/20">
              <span>{isRtl ? 'ابدأ مجاناً' : 'Get Started Free'}</span>
              <span className="material-symbols-outlined text-base rtl:rotate-180 group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </Link>
          </div>
        </div>

        <div className="px-6 sm:px-12 md:px-16 max-w-[1440px] mx-auto border-t border-slate-800/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">{t('landing.footer.rights')}</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <span className="material-symbols-outlined text-sm text-teal-500">favorite</span>
              {isRtl ? 'مصنوع بشغف في مصر' : 'Made with passion in Egypt'}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
