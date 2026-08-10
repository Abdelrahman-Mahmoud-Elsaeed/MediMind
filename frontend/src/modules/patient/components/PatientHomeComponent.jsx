"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useTranslation } from "@/shared/lib/i18nContext";
import { usePatientDashboard } from "../hooks/usePatientDashboard";
import { useTheme } from "next-themes";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { AppButton } from "@/shared/components/ui/AppButton";
import { AppProgressBar } from "@/shared/components/ui/AppProgressBar";
import { WelcomeBanner } from "@/modules/dashboard";
// ==========================================
// SUB-COMPONENT: ACTIVE TIMELINE (Matching Image 1)
// ==========================================
// ==========================================
// SUB-COMPONENT: ACTIVE TIMELINE
// ==========================================
function ActiveTimeline({ doses, nextDose, confirmDose, skipDose, locale, t }) {
    const isRtl = locale === "ar";
    
    // Sort doses dynamically with priority: DUE/PENDING first, then UPCOMING, then TAKEN
    const sortedDoses = React.useMemo(() => {
        const raw = doses && doses.length > 0 ? doses : [
            {
                doseEventId: 'd1',
                medicationName: isRtl ? 'ليزينوبريل' : 'Lisinopril',
                scheduledFor: new Date().setHours(8, 0, 0, 0),
                status: 'TAKEN',
                timeSlotName: t('patient.home.morningDose'),
                subtext: isRtl ? 'ليزينوبريل • تم التناول الساعة 07:45 ص' : 'Lisinopril • Taken at 07:45 AM',
                formattedTime: '08:00 AM'
            },
            {
                doseEventId: 'd2',
                medicationName: isRtl ? 'أتورفاستاتين 10مجم' : 'Atorvastatin 10mg',
                scheduledFor: new Date().setHours(11, 0, 0, 0),
                status: 'DUE',
                timeSlotName: t('patient.home.lunchtimeDose'),
                subtext: isRtl ? 'أتورفاستاتين 10مجم • قرص واحد' : 'Atorvastatin 10mg • 1 Tablet',
                formattedTime: '11:00 AM'
            },
            {
                doseEventId: 'd3',
                medicationName: isRtl ? 'سيدوفاج/ميتفورمين 500مجم' : 'Metformin 500mg',
                scheduledFor: new Date().setHours(20, 0, 0, 0),
                status: 'UPCOMING',
                timeSlotName: t('patient.home.eveningDose'),
                subtext: isRtl ? 'سيدوفاج 500مجم • قادمة' : 'Metformin 500mg • Upcoming',
                formattedTime: '08:00 PM'
            }
        ];

        return [...raw].sort((a, b) => {
            const statusOrder = (s) => (s === 'DUE' || s === 'due' || s === 'PENDING' ? 0 : s === 'UPCOMING' || s === 'upcoming' ? 1 : 2);
            const p1 = statusOrder(a.status);
            const p2 = statusOrder(b.status);
            if (p1 !== p2) return p1 - p2;
            const t1 = a.scheduledFor ? new Date(a.scheduledFor).getTime() : 0;
            const t2 = b.scheduledFor ? new Date(b.scheduledFor).getTime() : 0;
            return t1 - t2;
        });
    }, [doses, isRtl, t]);

    const formattedHeaderDate = new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric'
    });

    return (
      <section className="p-6 sm:p-8 bg-surface-container-lowest dark:bg-surface-container-low rounded-[2rem] border border-outline-variant/30 text-on-surface shadow-xs">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">
              {t('patient.home.activeTimeline')}
            </h2>
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-3 py-1 rounded-full border border-teal-200/80 dark:border-teal-800/60">
              {sortedDoses.length} {isRtl ? 'جرعات اليوم' : 'Doses Today'}
            </span>
          </div>
          <span className="text-xs font-semibold text-on-surface-variant font-mono bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700/60">
            {t('patient.home.todayDate', { date: formattedHeaderDate })}
          </span>
        </div>

        {/* Timeline Items Scroll Container (Scales gracefully for 1 to 100+ items) */}
        <div className="max-h-[580px] overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {sortedDoses.map((dose, idx) => {
              const isTaken = dose.status === 'TAKEN' || dose.status === 'completed';
              const isDue = dose.status === 'DUE' || (nextDose && nextDose.doseEventId === dose.doseEventId) || dose.status === 'due';
              const status = isTaken ? 'completed' : isDue ? 'due' : 'upcoming';
              const timeStr = dose.formattedTime || new Date(dose.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
              const itemData = {
                  id: dose.doseEventId || String(idx),
                  timeSlot: dose.timeSlotName || dose.medicationName,
                  medication: dose.subtext || (isTaken ? `${dose.medicationName} • Taken` : `${dose.medicationName} • 1 Tablet`),
                  time: timeStr,
                  status,
                  doseEventId: dose.doseEventId,
                  timeSlotName: dose.timeSlotName,
                  subtext: dose.subtext,
                  formattedTime: timeStr,
              };
              return (
                <TimelineItem
                  key={dose.doseEventId || idx}
                  item={itemData}
                  index={idx}
                  isFirst={idx === 0}
                  isLast={idx === sortedDoses.length - 1}
                  onMarkAsTaken={(id) => confirmDose?.(id)}
                  onSnooze={(id) => skipDose?.(id)}
                />
              );
          })}
        </div>
      </section>
    );
}
// ==========================================
// SUB-COMPONENT: MEDICATIONS CABINET (List View Matching Image 2)
// ==========================================
function CabinetQuickView({ medications, t }) {
    const defaultList = [
        { id: '1', name: 'Metformin', currentStock: 24, totalStock: 30, formType: 'TABLET' },
        { id: '2', name: 'Lisinopril 5mg', currentStock: 18, totalStock: 30, formType: 'TABLET' },
        { id: '3', name: 'Lisinopril 15mg', currentStock: 4, totalStock: 30, formType: 'CAPSULE' },
        { id: '4', name: 'Metformin 500mg', currentStock: 12, totalStock: 30, formType: 'TABLET' },
    ];
    const items = medications && medications.length > 0 ? medications.slice(0, 4) : defaultList;
    return (<section className="mt-8 p-6 sm:p-8 bg-surface-container-lowest dark:bg-surface-container-low rounded-[2rem] border border-outline-variant/30 text-on-surface shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-on-surface tracking-tight">
          {t('patient.home.cabinetQuickView')}
        </h2>
        <Link href="/medications" className="text-sm font-bold text-primary hover:underline transition-colors">
          {t('patient.home.viewAll')}
        </Link>
      </div>

      {/* Clean List-Based Layout (Matching Image 2) */}
      <div className="space-y-3.5">
        {items.map((med) => {
            const current = Number(med.currentStock ?? med.currentQuantity ?? 20);
            const total = Number(med.totalStock ?? med.initialQuantity ?? 30);
            const percentage = Math.min(100, Math.max(0, Math.round((current / total) * 100)));
            const isCritical = current <= 6 || percentage <= 20;
            return (<div key={med.id || med.medicationId} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl transition-all duration-200 hover:shadow-md hover:border-primary/40 cursor-pointer">
              {/* Icon Container */}
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${isCritical
                    ? 'bg-error-container/30 text-error'
                    : 'bg-primary-container/20 text-primary'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                  </svg>
                </div>

                {/* Medication Title */}
                <h4 className="font-bold text-on-surface text-base sm:text-lg min-w-[140px]">
                  {med.name}
                </h4>
              </div>

              {/* Progress Bar Track Stretching Across */}
              <div className="flex-1 flex items-center gap-4 w-full">
                <div className="flex-1">
                  <AppProgressBar value={current} max={total} isCritical={isCritical}/>
                </div>

                {/* Counter & Icon Refill Action */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs sm:text-sm font-semibold font-mono ${isCritical ? 'text-error font-bold' : 'text-on-surface-variant'}`}>
                    {current}/{total} {t('patient.home.left')}
                  </span>

                  {/* Refill Action Button with Arrow Right Icon */}
                  <AppButton type="button" variant={isCritical ? 'errorContainer' : 'primaryContainer'} size="sm" onClick={(e) => {
                    e.stopPropagation();
                    showInfo(t('patient.home.refillRequested', { name: med.name }), isAr ? 'معلومة' : 'Information');
                }} rightIcon={<svg className="w-3.5 h-3.5 rtl:rotate-180 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                      </svg>}/>
                </div>
              </div>
            </div>);
        })}
      </div>
    </section>);
}
// ==========================================
// SUB-COMPONENT: HEALTH SUMMARY (WAVEFORM)
// ==========================================
function HealthSummary({ adherenceRate, takenDoses, totalDoses }) {
    return (<section className="flex flex-col gap-6">
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
        ].map((item, idx) => (<div key={idx} className="flex flex-col items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${item.status === "taken" ? "bg-primary" : item.status === "missed" ? "bg-error" : "border-2 border-outline-variant bg-transparent opacity-60"}`}></div>
              <span className={`text-[10px] font-bold text-primary uppercase ${item.status === "pending" ? "opacity-60" : ""}`}>{item.day}</span>
            </div>))}
        </div>
      </div>
    </section>);
}
// ==========================================
// SUB-COMPONENT: CAREGIVERS CIRCLE
// ==========================================
function CareCircle() {
    return (<section className="mt-4">
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            </a>
            <Link href="/caregivers" className="w-8 h-8 rounded-full bg-primary-container/10 text-primary flex items-center justify-center hover:bg-primary-container/20 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </Link>
            <Link href="/caregivers" className="w-8 h-8 rounded-full bg-primary-container/10 text-primary flex items-center justify-center hover:bg-primary-container/20 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18m-3-6L6 18M6 6l12 12"/>
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
    </section>);
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
    const { medications, doses, loading, error, adherenceRate, nextDose, takenDoses, totalDoses, confirmDose, skipDose } = usePatientDashboard();
    const currentDateFormatted = new Date().toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    return (<MainLayout activePath="/home">
      {/* Welcome Banner */}
      <WelcomeBanner userName={userName} currentDateFormatted={currentDateFormatted}/>

      {/* Inner Content Grid */}
      <div className="p-6 lg:p-10 flex-1 grid grid-cols-12 gap-8 lg:gap-12 pt-0">
        {loading ? (<div className="col-span-12 text-center py-16 text-on-surface-variant font-medium">
            Loading your clinical schedule...
          </div>) : error ? (<div className="col-span-12 bg-error-container/20 border border-error/20 text-error p-5 rounded-2xl text-center font-bold text-sm">
            {error}
          </div>) : (<>
            {/* Left Column: Timeline & Medications Cabinet */}
            <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col gap-8 lg:gap-12">
              {/* Active Timeline Section */}
              <ActiveTimeline doses={doses} nextDose={nextDose} confirmDose={confirmDose} skipDose={skipDose} locale={locale} t={t}/>

              {/* Cabinet Quick View Section */}
              <CabinetQuickView medications={medications} t={t}/>
            </div>

            {/* Right Column: Health Summary & Caregivers Circle */}
            <div className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col gap-8 lg:gap-12">
              {/* Health Summary Section (Biometric Waveform) */}
              <HealthSummary adherenceRate={adherenceRate} takenDoses={takenDoses} totalDoses={totalDoses}/>

              {/* Caregivers Circle Section */}
              <CareCircle />
            </div>
          </>)}
      </div>
    </MainLayout>);
}
