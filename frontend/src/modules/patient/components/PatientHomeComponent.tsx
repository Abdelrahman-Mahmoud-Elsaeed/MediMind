"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useTranslation } from "@/shared/lib/i18nContext";
import { usePatientDashboard } from "../hooks/usePatientDashboard";
import { useTheme } from "next-themes";

// ==========================================
// SUB-COMPONENT: SIDEBAR (Aside)
// ==========================================
function Sidebar({ userName, userAvatarLetter, locale, toggleLanguage, t }) {
  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col border-r border-outline-variant bg-surface backdrop-blur-md bg-surface/50 transition-all">
      <div className="p-8">
        <h1 className="text-xl font-bold text-primary mb-1">MediMind</h1>
        <p className="text-xs text-on-surface-variant font-medium">Healthcare Dashboard</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <Link href="/home" className="flex items-center gap-3 px-4 py-3 bg-surface-container-lowest shadow-md text-primary rounded-xl font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span>{t("patient.nav.home")}</span>
        </Link>
        <Link href="/medications" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-lowest/50 rounded-xl font-medium transition-all hover:scale-[1.01] active:scale-[0.99]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span>{t("patient.nav.meds")}</span>
        </Link>
        <Link href="/adherence" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-lowest/50 rounded-xl font-medium transition-all hover:scale-[1.01] active:scale-[0.99]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span>{t("patient.nav.adherence")}</span>
        </Link>
        <Link href="/caregivers" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-lowest/50 rounded-xl font-medium transition-all hover:scale-[1.01] active:scale-[0.99]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span>{t("patient.nav.care")}</span>
        </Link>
        <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-lowest/50 rounded-xl font-medium transition-all hover:scale-[1.01] active:scale-[0.99]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span>{t("patient.nav.profile")}</span>
        </Link>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-outline-variant/30 space-y-6">
        {/* Language Toggle */}
        <div className="flex items-center bg-primary-container/10 rounded-full p-1 w-max mx-auto border border-outline-variant/35">
          <button
            onClick={() => locale !== "en" && toggleLanguage()}
            className={`px-6 py-1.5 rounded-full text-sm font-bold transition-colors cursor-pointer ${
              locale === "en" ? "bg-primary text-on-primary shadow-sm" : "text-primary opacity-60 hover:opacity-100 bg-transparent"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => locale !== "ar" && toggleLanguage()}
            className={`px-6 py-1.5 rounded-full text-sm font-bold transition-colors cursor-pointer ${
              locale === "ar" ? "bg-primary text-on-primary shadow-sm" : "text-primary opacity-60 hover:opacity-100 bg-transparent"
            }`}
          >
            AR
          </button>
        </div>

        {/* User Block */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-surface-container-lowest shadow-sm bg-primary-container/20 text-primary font-bold flex items-center justify-center">
            {userAvatarLetter}
          </div>
          <div>
            <h4 className="font-bold text-sm text-on-surface leading-tight">{userName}</h4>
            <p className="text-xs text-on-surface-variant font-medium">{t("patient.nav.profile")}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ==========================================
// SUB-COMPONENT: DESKTOP HEADER
// ==========================================
function DesktopHeader({ resolvedTheme, setTheme, mounted }) {
  return (
    <header className="hidden lg:flex h-20 px-10 items-center justify-end gap-6 shrink-0 border-b border-outline-variant/30 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <button
        type="button"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        aria-label="Toggle theme"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </button>
      <Link href="/notifications" className="text-on-surface-variant hover:text-on-surface transition-colors relative">
        <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border border-surface-container-lowest"></span>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </Link>
    </header>
  );
}

// ==========================================
// SUB-COMPONENT: MOBILE HEADER
// ==========================================
function MobileHeader({ locale, toggleLanguage, resolvedTheme, setTheme, mounted }) {
  return (
    <header className="lg:hidden fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md flex justify-between items-center px-6 h-16 border-b border-outline-variant/10">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary font-black shadow-sm">
          M
        </div>
        <h1 className="font-black text-lg text-primary tracking-tight">MediMind</h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleLanguage}
          className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary-container/10 border border-primary/20 text-primary transition-all duration-200"
        >
          {locale === "en" ? "العربية" : "EN"}
        </button>
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container border border-outline-variant/20 transition-colors cursor-pointer"
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined !text-[20px]">
            {mounted && resolvedTheme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>
        <Link href="/notifications" className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:bg-surface-container rounded-full border border-outline-variant/20 transition-colors">
          <span className="material-symbols-outlined !text-[20px]">notifications</span>
        </Link>
      </div>
    </header>
  );
}

// ==========================================
// SUB-COMPONENT: WELCOME BANNER
// ==========================================
function WelcomeBanner({ userName, currentDateFormatted }) {
  return (
    <div className="p-6 lg:p-10 flex flex-col gap-8">
      <header className="relative w-full h-48 rounded-3xl overflow-hidden shadow-lg border border-outline-variant/10">
        {/* Banner Background Image */}
        <img
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000"
          alt="Medical background"
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-90 dark:opacity-40"
        />
        {/* Dark Overlay for Readability */}
        <div className="absolute inset-0 bg-slate-900/70"></div>

        {/* Header Content */}
        <div className="relative z-10 p-10 flex flex-col justify-center h-full text-white">
          <span className="text-sm font-bold tracking-widest uppercase opacity-80 mb-2">Dashboard</span>
          <h2 className="text-3xl lg:text-4xl font-bold mb-1 leading-tight">Welcome back, {userName}</h2>
          <p className="text-blue-100/90 text-base lg:text-lg">{currentDateFormatted}</p>
        </div>
      </header>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: ACTIVE TIMELINE
// ==========================================
function ActiveTimeline({ doses, nextDose, confirmDose, skipDose, locale, t }) {
  const isRtl = locale === "ar";
  
  // Choose absolute line placement classes depending on current document language direction (LTR/RTL)
  const timelineLineClass = isRtl
    ? "absolute right-6 translate-x-1/2 top-2 h-[45%] w-[3px] bg-gradient-to-b from-primary/10 via-primary/50 to-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
    : "absolute left-6 -translate-x-1/2 top-2 h-[45%] w-[3px] bg-gradient-to-b from-primary/10 via-primary/50 to-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]";

  const timelineFadeLineClass = isRtl
    ? "absolute right-6 translate-x-1/2 top-[45%] bottom-4 w-[1px] bg-primary/20"
    : "absolute left-6 -translate-x-1/2 top-[45%] bottom-4 w-[1px] bg-primary/20";

  // Speech bubble arrow classes based on alignment direction
  const activeArrowClass = isRtl
    ? "absolute top-[50px] -right-[8px] w-0 h-0 border-y-[8px] border-y-transparent border-l-[8px] border-l-surface-container-lowest"
    : "absolute top-[50px] -left-[8px] w-0 h-0 border-y-[8px] border-y-transparent border-r-[8px] border-r-surface-container-lowest";

  return (
    <section className="p-6 bg-surface-container-lowest rounded-[2rem] shadow-[0_20px_50px_rgba(4,47,31,0.02)] border border-outline-variant/30 text-on-surface">
      <h2 className="text-2xl font-bold mb-8 text-on-surface">Active Timeline</h2>

      <div className="relative">
        {doses.length > 0 && (
          <>
            <div className={timelineLineClass}></div>
            <div className={timelineFadeLineClass}></div>
          </>
        )}

        {doses.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <span className="material-symbols-outlined text-4xl text-primary/45 mb-3">clinical_notes</span>
            <h4 className="font-bold text-on-surface text-sm">{t("patient.home.allCaughtUp")}</h4>
            <p className="text-xs text-on-surface-variant mt-1">{t("patient.home.noPendingDoses")}</p>
          </div>
        ) : (
          doses.map((dose, idx) => {
            const isTaken = dose.status === "TAKEN";
            const isNext = nextDose && nextDose.doseEventId === dose.doseEventId;
            const isSkipped = dose.status === "SKIPPED";
            const timeStr = new Date(dose.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (isTaken) {
              return (
                <div key={dose.doseEventId || idx} className="flex gap-4 mb-8 items-center">
                  <div className="w-12 flex justify-center items-center shrink-0">
                    <div className="w-3 h-3 rounded-full bg-primary/20 z-10"></div>
                  </div>
                  <div className="flex-1 flex items-center justify-between bg-primary-container/5 backdrop-blur-md border border-outline-variant/20 rounded-2xl px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center text-primary/60 shadow-sm border border-outline-variant/15">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{timeStr}</p>
                        <h4 className="text-base font-bold text-on-surface/85">{dose.medicationName}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else if (isNext) {
              return (
                <div key={dose.doseEventId || idx} className="flex gap-4 mb-8 items-start">
                  <div className="w-12 flex justify-center items-center shrink-0 mt-12">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-8 h-8 rounded-full bg-primary/30 animate-pulse"></div>
                      <div className="w-5 h-5 rounded-full border-[3px] border-surface bg-primary shadow-md z-10"></div>
                    </div>
                  </div>

                  <div className="relative bg-surface-container-lowest rounded-[2rem] p-6 flex-1 shadow-md border border-outline-variant/40">
                    <div className={activeArrowClass}></div>
                    <div className="flex items-center gap-1.5 mb-2 text-primary font-semibold text-sm">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-bold">{timeStr}</span>
                    </div>

                    <h3 className="text-xl lg:text-2xl font-extrabold text-on-surface mb-1 leading-tight">
                      {dose.medicationName}
                    </h3>
                    <p className="text-on-surface-variant text-sm mb-6">
                      Take 1 pill with food
                    </p>

                    <div className="flex gap-4 items-center">
                      <button
                        onClick={() => confirmDose(dose.doseEventId)}
                        className="bg-primary hover:brightness-115 text-on-primary px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-sm text-sm cursor-pointer"
                      >
                        Take Dose Now
                      </button>
                      <button
                        onClick={() => skipDose(dose.doseEventId)}
                        className="text-primary/60 font-bold hover:text-primary transition-all text-sm px-2 cursor-pointer"
                      >
                        Skip Dose
                      </button>
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={dose.doseEventId || idx} className="flex gap-4 items-center pb-4 last:pb-0">
                  <div className="w-12 flex justify-center items-center shrink-0">
                    <div className="w-3 h-3 rounded-full border-2 border-outline-variant/50 bg-transparent z-10"></div>
                  </div>
                  <div className="flex-1 flex items-center justify-between px-2 opacity-65">
                    <div>
                      <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                        {isSkipped ? "Skipped" : "Upcoming"}
                      </p>
                      <p className="text-sm font-bold text-on-surface/70">{timeStr}</p>
                    </div>
                  </div>
                </div>
              );
            }
          })
        )}
      </div>
    </section>
  );
}

// ==========================================
// SUB-COMPONENT: MEDICATIONS CABINET
// ==========================================
function CabinetQuickView({ medications, t }) {
  return (
    <section className="mt-8">
      <div className="flex items-end justify-between mb-6 border-b border-outline-variant/30 pb-4">
        <h2 className="text-2xl font-bold text-on-surface">Medications Cabinet</h2>
        <Link href="/medications" className="text-sm font-semibold text-primary hover:underline">
          View All
        </Link>
      </div>

      <div className="flex flex-col">
        {medications.length > 0 ? (
          medications.slice(0, 4).map((med, idx) => {
            const stockLeft = ((idx + 2) * 5) % 30 || 24;
            const percentage = Math.round((stockLeft / 30) * 100);

            // Determine stock level styling based on limits (Emerald -> Blue -> Amber -> Red)
            let levelColor = "text-primary";
            let barColor = "bg-primary";
            let bgColor = "bg-primary-container/10";
            let statusText = "Optimal Stock";

            if (stockLeft <= 6) {
              levelColor = "text-error";
              barColor = "bg-error";
              bgColor = "bg-error-container/20";
              statusText = "Refill Needed";
            } else if (stockLeft <= 12) {
              levelColor = "text-amber-600 dark:text-amber-400";
              barColor = "bg-amber-500";
              bgColor = "bg-amber-500/10";
              statusText = `Refill in ${Math.round(stockLeft / 2)} days`;
            } else if (stockLeft <= 20) {
              levelColor = "text-blue-600 dark:text-blue-400";
              barColor = "bg-blue-500";
              bgColor = "bg-blue-500/10";
              statusText = "Healthy Stock";
            }

            return (
              <div
                key={med.medicationId}
                className="group flex items-center gap-6 py-5 border-b border-outline-variant/20 hover:bg-surface-container-low px-4 -mx-4 rounded-2xl transition-all duration-200"
              >
                {/* Icon Container with level background */}
                <div className={`w-12 h-12 rounded-2xl ${bgColor} ${levelColor} flex items-center justify-center flex-shrink-0`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <h4 className="font-bold text-lg text-on-surface">{med.name}</h4>
                    <p className="text-sm text-on-surface-variant capitalize">{String(med.formType).toLowerCase()} • {med.schedule?.frequency}</p>
                  </div>
                  <div className="hidden md:block">
                    <p className={`text-sm font-bold ${levelColor}`}>{stockLeft} doses remaining</p>
                    <p className={`text-xs font-semibold ${levelColor}`}>{statusText}</p>
                  </div>
                  <div className="flex items-center justify-end md:justify-start w-full">
                    <div className="w-full max-w-[120px] bg-surface-container rounded-full h-1.5 overflow-hidden">
                      <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                </div>

                <button className="opacity-0 group-hover:opacity-100 p-2 text-on-surface-variant hover:text-on-surface transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            );
          })
        ) : (
          <div className="bg-surface-container/30 border border-outline-variant/10 rounded-2xl p-8 text-center">
            <p className="text-sm text-on-surface-variant font-medium">{t("patient.home.noMedications")}</p>
            <div className="mt-4">
              <Link href="/medications/add" className="inline-block px-5 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold hover:brightness-110 transition-all">
                {t("patient.home.addMedication")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ==========================================
// SUB-COMPONENT: HEALTH SUMMARY (WAVEFORM)
// ==========================================
function HealthSummary({ adherenceRate, takenDoses, totalDoses }) {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1 opacity-80">
          Health Summary Panel
        </p>
        <h2 className="text-3xl font-bold text-on-surface tracking-tight">
          Biometric Waveform
        </h2>
      </div>

      <div className="relative w-full aspect-[4/2.2] bg-transparent rounded-2xl flex flex-col justify-end overflow-visible">
        <div className="absolute inset-0 z-0 pointer-events-none -mx-2">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 200">
            <defs>
              <linearGradient id="grad-teal" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: "var(--primary)", stopOpacity: 0.45 }}></stop>
                <stop offset="70%" style={{ stopColor: "var(--primary)", stopOpacity: 0.05 }}></stop>
                <stop offset="100%" style={{ stopColor: "var(--surface-container)", stopOpacity: 0 }}></stop>
              </linearGradient>
              <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur"></feGaussianBlur>
                <feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
              </filter>
            </defs>
            <path d="M -10,170 C 40,170 60,110 100,110 C 140,110 170,170 210,170 C 250,170 250,40 280,40 C 310,40 330,150 360,150 C 380,150 390,90 410,90 L 410,220 L -10,220 Z" fill="url(#grad-teal)"></path>
            <path d="M -10,170 C 40,170 60,110 100,110 C 140,110 170,170 210,170 C 250,170 250,40 280,40 C 310,40 330,150 360,150 C 380,150 390,90 410,90" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round"></path>
            <circle cx="100" cy="110" r="4.5" fill="var(--primary)" stroke="#ffffff" strokeWidth="2.5" filter="url(#node-glow)"></circle>
            <circle cx="280" cy="40" r="5" fill="var(--primary)" stroke="#ffffff" strokeWidth="3" filter="url(#node-glow)"></circle>
            <circle cx="360" cy="150" r="4.5" fill="var(--primary)" stroke="#ffffff" strokeWidth="2.5" filter="url(#node-glow)"></circle>
          </svg>
        </div>

        <div className="absolute top-0 right-2 z-10 text-right">
          <p className="text-[42px] font-extrabold text-on-surface leading-none tracking-tight">
            {adherenceRate}%
          </p>
          <p className="text-xs font-semibold text-on-surface-variant mt-1.5 leading-snug">
            {takenDoses} of {totalDoses} doses<br />taken today
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <span className="text-[10px] font-bold tracking-widest text-primary uppercase opacity-80">
          Weekly Compliance
        </span>

        <div className="relative z-10 flex justify-between px-1">
          {[
            { day: "M", status: "taken" },
            { day: "T", status: "taken" },
            { day: "W", status: "taken" },
            { day: "T", status: "missed" },
            { day: "F", status: "pending" },
            { day: "S", status: "pending" },
            { day: "S", status: "pending" }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${
                item.status === "taken" ? "bg-primary" : item.status === "missed" ? "bg-error" : "border-2 border-outline-variant bg-transparent opacity-60"
              }`}></div>
              <span className={`text-[10px] font-bold text-primary uppercase ${
                item.status === "pending" ? "opacity-60" : ""
              }`}>{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==========================================
// SUB-COMPONENT: CAREGIVERS CIRCLE
// ==========================================
function CareCircle() {
  return (
    <section className="mt-4">
      <h4 className="text-xs font-bold tracking-widest text-primary uppercase mb-5 opacity-80">
        Caregivers Circle
      </h4>
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-4 p-2 hover:bg-surface-container-lowest/40 rounded-xl transition-all duration-200">
          <div className="w-12 h-12 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center flex-shrink-0 shadow-inner">
            JW
          </div>
          <div className="flex-1">
            <h5 className="font-bold text-on-surface text-sm leading-tight">
              Dr. James<br />Wilson
            </h5>
            <p className="text-[11px] text-on-surface-variant mt-0.5 leading-tight">
              Primary Physician
            </p>
          </div>
          <div className="flex gap-2">
            <a href="tel:+123456789" className="w-8 h-8 rounded-full bg-primary-container/10 text-primary flex items-center justify-center hover:bg-primary-container/20 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>
            <Link href="/caregivers" className="w-8 h-8 rounded-full bg-primary-container/10 text-primary flex items-center justify-center hover:bg-primary-container/20 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 p-2 hover:bg-surface-container-lowest/40 rounded-xl transition-all duration-200">
          <div className="w-12 h-12 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center flex-shrink-0 shadow-inner">
            MS
          </div>
          <div className="flex-1">
            <h5 className="font-bold text-on-surface text-sm leading-tight">
              Martha<br />Sarah
            </h5>
            <p className="text-[11px] text-on-surface-variant mt-0.5 leading-tight">
              Family Member
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/caregivers" className="w-8 h-8 rounded-full bg-primary-container/10 text-primary flex items-center justify-center hover:bg-primary-container/20 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
            <Link href="/caregivers" className="w-8 h-8 rounded-full bg-primary-container/10 text-primary flex items-center justify-center hover:bg-primary-container/20 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18m-3-6L6 18M6 6l12 12" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-2">
        <Link href="/caregivers" className="block w-full py-3 rounded-xl border border-primary/30 hover:border-primary/60 text-on-surface font-bold text-sm tracking-wide bg-transparent hover:bg-surface-container-lowest/30 transition-all text-center">
          Invite New Caregiver
        </Link>
      </div>
    </section>
  );
}

// ==========================================
// SUB-COMPONENT: MOBILE NAVIGATION
// ==========================================
function MobileNav({ t }) {
  return (
    <nav className="lg:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface-container/90 backdrop-blur-xl border-t border-outline-variant/10 shadow-lg">
      <Link className="flex flex-col items-center justify-center text-primary px-3 py-1 scale-100 font-bold" href="/home">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
        <span className="font-label-sm text-[10px] mt-0.5">{t("patient.nav.home")}</span>
      </Link>
      <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-all duration-200" href="/medications">
        <span className="material-symbols-outlined">medication</span>
        <span className="font-label-sm text-[10px] mt-0.5">{t("patient.nav.meds")}</span>
      </Link>
      <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-all duration-200" href="/adherence">
        <span className="material-symbols-outlined">query_stats</span>
        <span className="font-label-sm text-[10px] mt-0.5">{t("patient.nav.adherence")}</span>
      </Link>
      <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-all duration-200" href="/caregivers">
        <span className="material-symbols-outlined">groups</span>
        <span className="font-label-sm text-[10px] mt-0.5">{t("patient.nav.care")}</span>
      </Link>
      <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-all duration-200" href="/profile">
        <span className="material-symbols-outlined">person</span>
        <span className="font-label-sm text-[10px] mt-0.5">{t("patient.nav.profile")}</span>
      </Link>
    </nav>
  );
}

// ==========================================
// MAIN PATIENT HOME DASHBOARD COMPONENT
// ==========================================
export default function PatientHomeComponent() {
  const { user } = useAuth();
  
  // Dynamically resolve full display name based on user profile firstName/lastName, falling back to name/email
  const userName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user?.name || user?.email || "";
    
  const userAvatarLetter = (userName[0] || "U").toUpperCase();

  const { t, locale, toggleLanguage } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    medications,
    doses,
    loading,
    error,
    adherenceRate,
    nextDose,
    takenDoses,
    totalDoses,
    confirmDose,
    skipDose
  } = usePatientDashboard();

  const currentDateFormatted = new Date().toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div 
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="bg-background text-on-surface font-sans antialiased min-h-screen flex overflow-hidden selection:bg-primary-container selection:text-on-primary-container"
    >
      {/* 1. Sidebar Component (Aside) */}
      <Sidebar 
        userName={userName}
        userAvatarLetter={userAvatarLetter}
        locale={locale}
        toggleLanguage={toggleLanguage}
        t={t}
      />

      {/* Main Content View */}
      <main className="flex-1 flex flex-col overflow-y-auto pb-20 lg:pb-0 h-screen">
        
        {/* 2. Desktop Header */}
        <DesktopHeader 
          resolvedTheme={resolvedTheme} 
          setTheme={setTheme} 
          mounted={mounted} 
        />

        {/* 3. Mobile Header */}
        <MobileHeader 
          locale={locale} 
          toggleLanguage={toggleLanguage} 
          resolvedTheme={resolvedTheme} 
          setTheme={setTheme} 
          mounted={mounted} 
        />

        {/* 4. Welcome Banner */}
        <WelcomeBanner 
          userName={userName} 
          currentDateFormatted={currentDateFormatted} 
        />

        {/* Inner Content Grid */}
        <div className="p-6 lg:p-10 flex-1 grid grid-cols-12 gap-8 lg:gap-12 pt-0">
          {loading ? (
            <div className="col-span-12 text-center py-16 text-on-surface-variant font-medium">
              Loading your clinical schedule...
            </div>
          ) : error ? (
            <div className="col-span-12 bg-error-container/20 border border-error/20 text-error p-5 rounded-2xl text-center font-bold text-sm">
              {error}
            </div>
          ) : (
            <>
              {/* Left Column: Timeline & Medications Cabinet */}
              <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col gap-8 lg:gap-12">
                {/* 5. Active Timeline Section */}
                <ActiveTimeline 
                  doses={doses} 
                  nextDose={nextDose} 
                  confirmDose={confirmDose} 
                  skipDose={skipDose} 
                  locale={locale}
                  t={t} 
                />

                {/* 6. Cabinet Quick View Section */}
                <CabinetQuickView 
                  medications={medications} 
                  t={t} 
                />
              </div>

              {/* Right Column: Health Summary & Caregivers Circle */}
              <div className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col gap-8 lg:gap-12">
                {/* 7. Health Summary Section (Biometric Waveform) */}
                <HealthSummary 
                  adherenceRate={adherenceRate} 
                  takenDoses={takenDoses} 
                  totalDoses={totalDoses} 
                />

                {/* 8. Caregivers Circle Section */}
                <CareCircle />
              </div>
            </>
          )}
        </div>
      </main>

      {/* 9. Mobile Navigation Bar (Mobile only) */}
      <MobileNav t={t} />

    </div>
  );
}
