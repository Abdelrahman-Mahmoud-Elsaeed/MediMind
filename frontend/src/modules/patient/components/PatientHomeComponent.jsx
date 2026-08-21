"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useTranslation } from "@/shared/lib/i18nContext";
import { usePatientDashboard } from "../hooks/usePatientDashboard";
import { useTheme } from "next-themes";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { AppButton } from "@/shared/components/ui/AppButton";
import { AppProgressBar } from "@/shared/components/ui/AppProgressBar";
import { WelcomeBanner } from "@/modules/dashboard";
import { TimelineItem } from "@/modules/dashboard/components/TimelineItem";
import { showInfo } from "@/shared/utils/toast";

// ==========================================
// SUB-COMPONENT: ACTIVE TIMELINE
// ==========================================
function ActiveTimeline({ doses, nextDose, confirmDose, skipDose, snoozeDose, locale, t }) {
  const isRtl = locale === "ar";
  const [timelineFilter, setTimelineFilter] = useState('ALL');

  // Sort doses dynamically with priority: DUE/PENDING first, then TAKEN, then MISSED
  const sortedDoses = useMemo(() => {
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
        status: 'PENDING',
        timeSlotName: t('patient.home.eveningDose'),
        subtext: isRtl ? 'سيدوفاج 500مجم • قادمة' : 'Metformin 500mg • Upcoming',
        formattedTime: '08:00 PM'
      }
    ];

    return [...raw].sort((a, b) => {
      const getStatusPriority = (s) => {
        const status = String(s || '').toUpperCase();
        if (status === 'DUE' || status === 'PENDING') return 0; // 1. Waiting for taking (Top)
        if (status === 'TAKEN' || status === 'COMPLETED') return 1; // 2. Taken (Middle)
        if (status === 'MISSED' || status === 'SKIPPED') return 2; // 3. Missed (Bottom)
        return 3;
      };

      const p1 = getStatusPriority(a.status);
      const p2 = getStatusPriority(b.status);
      if (p1 !== p2) return p1 - p2;

      const t1 = a.scheduledFor ? new Date(a.scheduledFor).getTime() : 0;
      const t2 = b.scheduledFor ? new Date(b.scheduledFor).getTime() : 0;
      return t1 - t2;
    });
  }, [doses, isRtl, t]);

  // Dynamic counts
  const pendingCount = useMemo(() => sortedDoses.filter(d => ['DUE', 'PENDING', 'due'].includes(String(d.status || '').toUpperCase() || d.status)).length, [sortedDoses]);
  const completedCount = useMemo(() => sortedDoses.filter(d => ['TAKEN', 'COMPLETED', 'completed'].includes(String(d.status || '').toUpperCase() || d.status)).length, [sortedDoses]);
  const missedCount = useMemo(() => sortedDoses.filter(d => ['MISSED', 'SKIPPED', 'missed'].includes(String(d.status || '').toUpperCase() || d.status)).length, [sortedDoses]);

  // Filtered list
  const filteredDoses = useMemo(() => {
    if (timelineFilter === 'PENDING') {
      return sortedDoses.filter(d => ['DUE', 'PENDING', 'due'].includes(String(d.status || '').toUpperCase() || d.status));
    }
    if (timelineFilter === 'COMPLETED') {
      return sortedDoses.filter(d => ['TAKEN', 'COMPLETED', 'completed'].includes(String(d.status || '').toUpperCase() || d.status));
    }
    if (timelineFilter === 'MISSED') {
      return sortedDoses.filter(d => ['MISSED', 'SKIPPED', 'missed'].includes(String(d.status || '').toUpperCase() || d.status));
    }
    return sortedDoses;
  }, [sortedDoses, timelineFilter]);

  const formattedHeaderDate = new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <section className="p-6 sm:p-8 bg-surface-container-lowest dark:bg-surface-container-low rounded-[2rem] border border-outline-variant/30 text-on-surface shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">
            {t('patient.home.activeTimeline')}
          </h2>
          <span className="text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-3 py-1 rounded-full border border-teal-200/80 dark:border-teal-800/60">
            {sortedDoses.length} {isRtl ? 'جرعات اليوم' : 'Doses Today'}
          </span>
        </div>

        <span className="text-xs font-semibold text-on-surface-variant font-mono bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700/60 self-start sm:self-auto">
          {t('patient.home.todayDate', { date: formattedHeaderDate })}
        </span>
      </div>

      {/* Dynamic Interactive Filter Tabs: All, Pending, Completed, Missed */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => setTimelineFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${timelineFilter === 'ALL'
            ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs border border-teal-200/60 dark:border-teal-800/60'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          {isRtl ? 'الكل' : 'All'} ({sortedDoses.length})
        </button>

        <button
          type="button"
          onClick={() => setTimelineFilter('PENDING')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${timelineFilter === 'PENDING'
            ? 'bg-teal-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          {isRtl ? 'قيد الانتظار' : 'Pending'} ({pendingCount})
        </button>

        <button
          type="button"
          onClick={() => setTimelineFilter('COMPLETED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${timelineFilter === 'COMPLETED'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          {isRtl ? 'المكتملة' : 'Completed'} ({completedCount})
        </button>

        <button
          type="button"
          onClick={() => setTimelineFilter('MISSED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${timelineFilter === 'MISSED'
            ? 'bg-rose-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          {isRtl ? 'الفائتة' : 'Missed'} ({missedCount})
        </button>
      </div>

      {/* Timeline Items Scroll Container (Tailwind CSS Scroll Snap: snap-y snap-mandatory) */}
      <div className="max-h-[580px] overflow-y-auto overflow-x-hidden snap-y snap-mandatory px-1.5 pr-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        {filteredDoses.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm font-semibold">
            {isRtl ? 'لا توجد جرعات في هذه الفئة' : 'No doses found in this category'}
          </div>
        ) : (
          filteredDoses.map((dose, idx) => {
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
                nextItem={filteredDoses[idx + 1]}
                index={idx}
                isFirst={idx === 0}
                isLast={idx === filteredDoses.length - 1}
                onMarkAsTaken={(id) => confirmDose?.(id)}
                onSnooze={(id) => snoozeDose?.(id)}
              />
            );
          })
        )}
      </div>
    </section>
  );
}

// ==========================================
// SUB-COMPONENT: MEDICATIONS CABINET (List View Responsive to Real Medication Data)
// ==========================================
function CabinetQuickView({ medications, locale, t }) {
  const isAr = locale === "ar";
  const [medFilter, setMedFilter] = useState('ALL');

  const defaultList = [
    { id: '1', name: 'Metformin', currentStock: 24, totalStock: 30, formType: 'TABLET', refillThreshold: 10, isActive: true },
    { id: '2', name: 'Lisinopril 5mg', currentStock: 18, totalStock: 30, formType: 'TABLET', refillThreshold: 10, isActive: true },
    { id: '3', name: 'Lisinopril 15mg', currentStock: 4, totalStock: 30, formType: 'CAPSULE', refillThreshold: 10, isActive: true },
    { id: '4', name: 'Metformin 500mg', currentStock: 12, totalStock: 30, formType: 'TABLET', refillThreshold: 10, isActive: true },
  ];

  const allMeds = useMemo(() => {
    return medications && medications.length > 0 ? medications : defaultList;
  }, [medications]);

  // Dynamic Counts Responsive to Real Medication Data
  const allCount = allMeds.length;

  const activeCount = useMemo(() => {
    return allMeds.filter(m => {
      const isInactive = m.isActive === false || m.status === 'INACTIVE' || m.status === 'FINISHED' || m.status === 'EXPIRED';
      return !isInactive;
    }).length;
  }, [allMeds]);

  const finishedCount = useMemo(() => {
    return allMeds.filter(m => {
      return m.isFinished === true || m.status === 'FINISHED' || m.status === 'EXPIRED';
    }).length;
  }, [allMeds]);

  // Helper to accurately resolve inventory stock & low stock status
  const getMedStockInfo = (m) => {
    const current = Number(
      m.currentStock ?? 
      m.currentQuantity ?? 
      m.inventory?.currentQuantity ?? 
      m.stock ?? 
      20
    );
    const thresh = Number(
      m.refillThreshold ?? 
      m.inventory?.refillThreshold ?? 
      10
    );
    const total = Number(
      m.totalStock ?? 
      m.initialQuantity ?? 
      m.inventory?.initialQuantity ?? 
      30
    );
    return { current, thresh, total, isLowStock: current <= thresh };
  };

  const lowStockCount = useMemo(() => {
    return allMeds.filter(m => getMedStockInfo(m).isLowStock).length;
  }, [allMeds]);

  // Filtered Medications List
  const displayMeds = useMemo(() => {
    if (medFilter === 'ACTIVE') {
      return allMeds.filter(m => m.isActive !== false && m.status !== 'FINISHED' && m.status !== 'EXPIRED');
    }
    if (medFilter === 'FINISHED') {
      return allMeds.filter(m => m.isFinished === true || m.status === 'FINISHED' || m.status === 'EXPIRED');
    }
    if (medFilter === 'LOW_STOCK') {
      return allMeds.filter(m => getMedStockInfo(m).isLowStock);
    }
    return allMeds;
  }, [allMeds, medFilter]);

  return (
    <section className="mt-8 p-6 sm:p-8 bg-surface-container-lowest dark:bg-surface-container-low rounded-[2rem] border border-outline-variant/30 text-on-surface shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-on-surface tracking-tight">
          {t('patient.home.cabinetQuickView')}
        </h2>
        <Link href="/medications" className="text-sm font-bold text-primary hover:underline transition-colors">
          {t('patient.home.viewAll')}
        </Link>
      </div>

      {/* Dynamic Responsive Filter Tabs: All, Active, Finished, Low Stock */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => setMedFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${medFilter === 'ALL'
            ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs border border-teal-200/60 dark:border-teal-800/60'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          {isAr ? 'الكل' : 'All'} ({allCount})
        </button>

        <button
          type="button"
          onClick={() => setMedFilter('ACTIVE')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${medFilter === 'ACTIVE'
            ? 'bg-teal-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          {isAr ? 'نشطة' : 'Active'} ({activeCount})
        </button>

        <button
          type="button"
          onClick={() => setMedFilter('FINISHED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${medFilter === 'FINISHED'
            ? 'bg-slate-700 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          {isAr ? 'منتهية' : 'Finished'} ({finishedCount})
        </button>

        <button
          type="button"
          onClick={() => setMedFilter('LOW_STOCK')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${medFilter === 'LOW_STOCK'
            ? 'bg-rose-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          {isAr ? 'مخزون منخفض' : 'Low Stock'} ({lowStockCount})
        </button>
      </div>

      {/* Clean List-Based Layout Responsive to Data */}
      <div className="space-y-3.5">
        {displayMeds.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm font-semibold">
            {isAr ? 'لا توجد أدوية تفي بهذا الفلتر' : 'No medications match this filter'}
          </div>
        ) : (
          displayMeds.map((med) => {
            const { current, total, isLowStock: isCritical } = getMedStockInfo(med);
            return (
              <div key={med.id || med.medicationId} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl transition-all duration-200 hover:shadow-md hover:border-primary/40 cursor-pointer">
                {/* Icon Container */}
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${isCritical
                    ? 'bg-error-container/30 text-error'
                    : 'bg-primary-container/20 text-primary'
                    }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
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
                    <AppProgressBar value={current} max={total} isCritical={isCritical} />
                  </div>

                  {/* Counter & Icon Refill Action */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs sm:text-sm font-semibold font-mono ${isCritical ? 'text-error font-bold' : 'text-on-surface-variant'}`}>
                      {current}/{total} {t('patient.home.left')}
                    </span>

                    {/* Refill Action Button with Arrow Right Icon */}
                    <AppButton
                      type="button"
                      variant={isCritical ? 'errorContainer' : 'primaryContainer'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        showInfo(t('patient.home.refillRequested', { name: med.name }), isAr ? 'معلومة' : 'Information');
                      }}
                      rightIcon={
                        <svg className="w-3.5 h-3.5 rtl:rotate-180 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

// ==========================================
// MAIN PATIENT HOME DASHBOARD
// ==========================================
export default function PatientHomeComponent() {
  const { user, isCaregiver, activePatient } = useAuth();
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { medications, doses, loading, error, adherenceRate, nextDose, takenDoses, totalDoses, confirmDose, skipDose, snoozeDose } = usePatientDashboard();

  const currentDateFormatted = new Date().toLocaleDateString(isAr ? "ar-EG" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <MainLayout activeTab="home">
      <div className="space-y-8 pb-12">
        {/* Welcome Banner */}
        <WelcomeBanner
          userName={user?.firstName || user?.fullName || "Patient"}
          dateString={currentDateFormatted}
          adherencePercentage={adherenceRate || 0}
          takenDoses={takenDoses || 0}
          totalDoses={totalDoses || 0}
          nextDose={nextDose}
          onConfirmDose={confirmDose}
          isAr={isAr}
        />

        {/* Main 2-Column Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Timeline & Medications Cabinet */}
          <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col gap-8 lg:gap-12">
            {/* Active Timeline Section */}
            <ActiveTimeline doses={doses} nextDose={nextDose} confirmDose={confirmDose} skipDose={skipDose} snoozeDose={snoozeDose} locale={locale} t={t} />

            {/* Cabinet Quick View Section */}
            <CabinetQuickView medications={medications} locale={locale} t={t} />
          </div>

          {/* Right Column: Quick Stats / Adherence Card */}
          <div className="col-span-12 lg:col-span-5 xl:col-span-4 space-y-6">
            <section className="p-6 sm:p-8 bg-surface-container-lowest dark:bg-surface-container-low rounded-[2rem] border border-outline-variant/30 text-on-surface shadow-xs">
              <h3 className="text-xl font-bold mb-4 tracking-tight">
                {isAr ? 'نسبة الالتزام بالجرعات' : 'Adherence Performance'}
              </h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 font-mono">
                  {adherenceRate}%
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  {takenDoses} / {totalDoses} {isAr ? 'تم تناوله' : 'Taken'}
                </span>
              </div>
              <AppProgressBar value={takenDoses} max={totalDoses || 1} />
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
