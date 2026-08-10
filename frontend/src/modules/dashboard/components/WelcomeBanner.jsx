'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/shared/lib/i18nContext';
import { usePatientProfileQuery } from '@/modules/patient/hooks/usePatientQueries';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { usePatientDashboard } from '@/modules/patient/hooks/usePatientDashboard';

export const WelcomeBanner = ({ firstName: customFirstName, currentDateFormatted: customDate }) => {
  const { locale, t } = useTranslation();
  const { user } = useAuth();
  const { data: profile } = usePatientProfileQuery();
  const dashboard = usePatientDashboard();

  const isRtl = locale === 'ar';
  const [showRemainingPopover, setShowRemainingPopover] = useState(false);
  const popoverRef = useRef(null);

  const firstName = customFirstName || profile?.firstName || user?.name?.split(' ')[0] || (isRtl ? 'المريض' : 'Patient');
  
  const currentDateFormatted = customDate || new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const takenDoses = dashboard?.takenDoses || 0;
  const totalDoses = dashboard?.totalDoses || 0;
  const doses = dashboard?.doses || [];

  let motivationalSubtitle = "";
  if (totalDoses > 0 && takenDoses === totalDoses) {
    motivationalSubtitle = t("patient.home.allCompleted") || (isRtl ? "تم إكمال جميع جرعات اليوم! عمل ممتاز! 🎉" : "All doses completed for today! Great job! 🎉");
  } else if (totalDoses > 0) {
    motivationalSubtitle = isRtl
      ? `أنت على الطريق الصحيح اليوم — تم تناول ${takenDoses} من ${totalDoses} جرعات.`
      : `You are on track today — ${takenDoses} of ${totalDoses} doses taken.`;
  } else {
    motivationalSubtitle = t("patient.home.noDoses") || (isRtl ? "لا توجد جرعات مجدولة اليوم. نتمنى لك يوماً سعيداً! 🌿" : "No doses scheduled for today. Have a peaceful day! 🌿");
  }

  const remainingDoses = totalDoses - takenDoses;
  const pendingDoses = doses?.filter(d => d.status !== "TAKEN" && d.status !== "SKIPPED") || [];

  useEffect(() => {
    function handleOutsideClick(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowRemainingPopover(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const textGradOverlay = isRtl
    ? "bg-gradient-to-l from-[#090d16]/98 via-[#090d16]/85 to-[#090d16]/25"
    : "bg-gradient-to-r from-[#090d16]/98 via-[#090d16]/85 to-[#090d16]/25";

  return (
    <header className="relative w-full rounded-3xl shadow-xl dark:shadow-2xl border border-emerald-600/30 dark:border-emerald-500/30 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 dark:bg-[#090d16] transition-all duration-300 mb-8">
      {/* BRAND HARMONIZED EMERALD TECH BACKGROUND */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 dark:bg-[#090d16]"></div>
        <img
          src="/images/patient-dashboard-bg.png"
          alt="Medical tech background"
          className="absolute inset-0 w-full h-full object-cover opacity-60 dark:opacity-70 filter brightness-110 contrast-110 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/35 via-teal-500/20 to-emerald-400/10 mix-blend-overlay pointer-events-none"></div>
        <div className={`absolute inset-0 ${textGradOverlay}`}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 dark:from-[#090d16]/50 via-transparent to-slate-950/60 dark:to-[#090d16]/70"></div>
        <div className={`absolute top-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-500/25 via-emerald-400/15 to-transparent rounded-full blur-3xl pointer-events-none ${isRtl ? "-left-10" : "-right-10"}`}></div>
      </div>

      {/* Banner Content Container */}
      <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-10 lg:px-12">
        {/* TEXT CONTENT COLUMN */}
        <div className={`flex-1 w-full flex flex-col justify-center text-white ${isRtl ? "items-center md:items-start text-center md:text-right" : "items-center md:items-start text-center md:text-left"}`}>
          {/* Top badge row */}
          <div className={`flex items-center gap-2 mb-3 flex-wrap ${isRtl ? "flex-row-reverse" : ""}`}>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 dark:bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-extrabold uppercase tracking-widest backdrop-blur-md shadow-xs">
              {t("patient.nav.home") || (isRtl ? "الرئيسية" : "Overview")}
            </span>
            <span className="text-emerald-200/80 dark:text-slate-400 text-xs font-semibold">• {currentDateFormatted}</span>
          </div>

          {/* Greeting Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-black text-white mb-2 leading-tight tracking-tight drop-shadow-xs">
            {isRtl ? (
              <span dir="rtl" className="inline-flex items-center flex-wrap gap-x-2">
                <span>أهلاً بك مجدداً،</span>
                <span className="inline-flex items-baseline gap-x-1">
                  <bdi className="text-emerald-300 dark:text-emerald-300">{firstName}</bdi>
                  <span>!</span>
                </span>
                <span>👋</span>
              </span>
            ) : (
              <span dir="ltr" className="inline-flex items-center flex-wrap gap-x-2">
                <span>Welcome back,</span>
                <span className="inline-flex items-baseline gap-x-1">
                  <bdi className="text-emerald-300 dark:text-emerald-300">{firstName}</bdi>
                  <span>!</span>
                </span>
                <span>👋</span>
              </span>
            )}
          </h2>

          {/* Subtitle */}
          <p className="text-emerald-100/90 dark:text-slate-300 text-xs sm:text-sm font-medium max-w-md leading-relaxed mb-5">
            {motivationalSubtitle}
          </p>

          {/* Interactive Translucent Stat Pills */}
          {totalDoses > 0 && (
            <div className={`flex items-center gap-3 flex-wrap ${isRtl ? "flex-row-reverse" : ""}`}>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 dark:bg-emerald-500/10 border border-emerald-400/30 dark:border-emerald-500/20 text-emerald-200 dark:text-emerald-400 text-xs font-extrabold shadow-xs select-none backdrop-blur-md">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>{takenDoses} {isRtl ? "مكتملة" : "Done"}</span>
              </div>

              <div className="relative" ref={popoverRef}>
                <button
                  onClick={() => setShowRemainingPopover(prev => !prev)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 dark:bg-amber-500/10 border border-amber-400/30 dark:border-amber-500/20 text-amber-200 dark:text-amber-400 text-xs font-extrabold hover:bg-amber-500/30 dark:hover:bg-amber-500/20 transition-all cursor-pointer shadow-xs backdrop-blur-md"
                >
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>{remainingDoses} {isRtl ? "متبقية" : "Remaining"}</span>
                  <span className="material-symbols-outlined text-xs opacity-60">{showRemainingPopover ? "keyboard_arrow_up" : "keyboard_arrow_down"}</span>
                </button>

                {showRemainingPopover && (
                  <div className={`absolute top-full mt-2 z-50 w-60 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 shadow-2xl text-slate-900 dark:text-white overflow-hidden ${isRtl ? "right-0" : "left-0"}`}>
                    <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/90">
                      <p className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                        {isRtl ? "الجرعات المتبقية اليوم" : "Remaining Doses Today"}
                      </p>
                    </div>
                    <ul className="py-1 max-h-44 overflow-y-auto">
                      {pendingDoses.length === 0 ? (
                        <li className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 text-center">
                          {isRtl ? "لا توجد جرعات متبقية" : "No pending doses"}
                        </li>
                      ) : (
                        pendingDoses.map((d, idx) => {
                          const timeStr = d.scheduledFor
                            ? new Date(d.scheduledFor).toLocaleTimeString(isRtl ? "ar-EG" : "en-US", { hour: "numeric", minute: "2-digit" })
                            : "";
                          return (
                            <li key={d.doseEventId || idx} className={`flex items-center justify-between px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors ${isRtl ? "flex-row-reverse" : ""}`}>
                              <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                                <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 flex-shrink-0"></div>
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">{d.medicationName}</span>
                              </div>
                              {timeStr && <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex-shrink-0">{timeStr}</span>}
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ILLUSTRATION COLUMN */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48">
            <div className="absolute inset-2 rounded-full bg-emerald-500/8 animate-pulse"></div>
            <div className="absolute inset-4 rounded-full border border-emerald-400/15"></div>

            <svg viewBox="0 -10 200 230" className="w-full h-full drop-shadow-[0_0_28px_rgba(16,185,129,0.30)]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="bwGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="bwShield" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0047ba" stopOpacity="0.92" />
                  <stop offset="100%" stopColor="#00a396" stopOpacity="0.92" />
                </linearGradient>
                <linearGradient id="bwHeart" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="bwPlant" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6ee7b7" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>

              <circle cx="100" cy="105" r="90" fill="url(#bwGlow)" />
              <path d="M100 15 L165 45 V105 C165 152 100 188 100 188 C100 188 35 152 35 105 V45 Z" fill="url(#bwShield)" stroke="#34d399" strokeWidth="2" strokeOpacity="0.6" />
              <rect x="94" y="88" width="12" height="32" rx="3" fill="white" opacity="0.9" />
              <rect x="83" y="100" width="34" height="12" rx="3" fill="white" opacity="0.9" />
              <path d="M100 165 L100 150" stroke="url(#bwPlant)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M100 158 Q92 150 88 143 Q96 143 100 152 Q104 143 112 143 Q108 150 100 158" fill="url(#bwPlant)" opacity="0.85" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};
