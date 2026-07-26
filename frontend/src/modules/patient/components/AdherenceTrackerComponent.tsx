"use client";

import Link from "next/link";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useAdherenceTracker } from "../hooks/useAdherenceTracker";

export default function AdherenceTrackerComponent() {
  const { t, locale, toggleLanguage } = useTranslation();

  const {
    currentDate,
    selectedDate,
    setSelectedDate,
    doses,
    loading,
    error,
    takenCount,
    missedCount,
    skippedCount,
    pendingCount,
    adherenceRate,
    confirmDose,
    skipDose,
    changeMonth
  } = useAdherenceTracker();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(year, month, d));
  }

  const monthNamesEN = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthNamesAR = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const monthNames = locale === "ar" ? monthNamesAR : monthNamesEN;
  const daysOfWeek = locale === "ar"
    ? ["ح", "ن", "ث", "ر", "خ", "ج", "س"]
    : ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen pb-32">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md flex justify-between items-center px-margin-mobile h-16 border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">
            M
          </div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">MediMind</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary-container/20 border border-primary/30 text-primary transition-all duration-200"
          >
            {locale === "en" ? "العربية" : "EN"}
          </button>
          <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full">
            <span className="font-label-md text-label-md text-on-surface font-bold">
              {monthNames[month]} {year}
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-margin-mobile max-w-container-max mx-auto space-y-6">
        <section>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-1">{t("patient.adherence.title")}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">{t("patient.adherence.subtitle")}</p>
        </section>

        {/* Circular Progress & Quick Stats Card */}
        <section className="bg-surface-container border border-outline-variant/10 rounded-2xl p-6 flex flex-col items-center shadow-sm">
          <div className="relative w-40 h-40 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" className="stroke-surface-container-highest fill-none" strokeWidth="12" />
              <circle
                cx="80"
                cy="80"
                r="70"
                className="stroke-primary fill-none transition-all duration-500"
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 70}
                strokeDashoffset={2 * Math.PI * 70 * (1 - adherenceRate / 100)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display-lg text-3xl font-extrabold text-primary">{adherenceRate}%</span>
              <span className="font-label-sm text-xs text-on-surface-variant/80 mt-1">{t("patient.adherence.daily")}</span>
            </div>
          </div>
          <div className="w-full grid grid-cols-3 gap-4 border-t border-outline-variant/10 pt-6">
            <div className="flex flex-col items-center">
              <span className="font-headline-md text-headline-md font-bold text-secondary">
                {takenCount}
              </span>
              <span className="font-label-sm text-xs text-on-surface-variant/80 mt-1">{t("patient.adherence.taken")}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-headline-md text-headline-md font-bold text-error">
                {missedCount}
              </span>
              <span className="font-label-sm text-xs text-on-surface-variant/80 mt-1">{t("patient.adherence.missed")}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-headline-md text-headline-md font-bold text-outline">
                {skippedCount}
              </span>
              <span className="font-label-sm text-xs text-on-surface-variant/80 mt-1">{t("patient.adherence.skipped")}</span>
            </div>
          </div>
        </section>

        {/* Month Selector Buttons */}
        <section className="flex justify-between items-center bg-surface-container border border-outline-variant/10 p-3 rounded-xl">
          <button onClick={() => changeMonth(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-primary">chevron_left</span>
          </button>
          <span className="text-sm font-bold text-on-surface">{monthNames[month]} {year}</span>
          <button onClick={() => changeMonth(1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-primary">chevron_right</span>
          </button>
        </section>

        {/* Calendar Grid */}
        <section className="bg-surface-container border border-outline-variant/10 p-5 rounded-2xl">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {daysOfWeek.map((day, idx) => (
              <div key={idx} className="text-center font-label-sm text-xs text-on-surface-variant/50 font-bold">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-3">
            {calendarDays.map((dateObj, idx) => {
              if (!dateObj) {
                return <div key={`pad-${idx}`} className="h-10"></div>;
              }

              const isSelected = dateObj.toDateString() === selectedDate.toDateString();
              const isToday = dateObj.toDateString() === new Date().toDateString();

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(dateObj)}
                  className={`flex flex-col items-center justify-center h-10 rounded-xl relative ${
                    isSelected
                      ? "bg-primary-container/20 ring-1 ring-primary/40 font-bold cursor-pointer"
                      : isToday
                      ? "bg-surface-container-high font-bold border border-primary/20 cursor-pointer"
                      : "hover:bg-surface-container-high cursor-pointer"
                  }`}
                >
                  <span className={`font-body-md text-sm ${isSelected ? "text-primary" : "text-on-surface"}`}>
                    {dateObj.getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Dose Logs List */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {t("patient.adherence.logsFor")} {selectedDate.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { month: "short", day: "numeric" })}
            </h3>
            <span className="text-xs text-slate-500">
              {pendingCount} {locale === "ar" ? "معلقة" : "Pending"}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-6 text-slate-500">Loading daily logs...</div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center">
              {error}
            </div>
          ) : doses.length > 0 ? (
            <div className="flex flex-col gap-3">
              {doses.map((log) => {
                let statusColor = "border-l-outline";
                let badgeColor = "text-outline bg-outline/10";
                let statusText = locale === "ar" ? "معلقة" : "Pending";
                let statusIcon = "schedule";

                if (log.status === "TAKEN") {
                  statusColor = "border-l-secondary";
                  badgeColor = "text-secondary bg-secondary/10";
                  statusText = locale === "ar" ? "تم أخذها" : "Taken";
                  statusIcon = "check_circle";
                } else if (log.status === "MISSED") {
                  statusColor = "border-l-error";
                  badgeColor = "text-error bg-error/10";
                  statusText = locale === "ar" ? "فائتة" : "Missed";
                  statusIcon = "warning";
                } else if (log.status === "SKIPPED") {
                  statusColor = "border-l-slate-400";
                  badgeColor = "text-slate-400 bg-slate-400/10";
                  statusText = locale === "ar" ? "تم تخطيها" : "Skipped";
                  statusIcon = "block";
                }

                return (
                  <div
                    key={log.doseEventId}
                    className={`bg-surface-container border border-outline-variant/10 p-4 rounded-2xl flex flex-col gap-3 border-l-4 ${statusColor} transition-all`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${badgeColor}`}>
                        <span className="material-symbols-outlined">medication</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-label-md text-label-md font-bold text-on-surface">
                            {log.medicationName}
                          </h4>
                          <span className="font-label-sm text-xs text-on-surface-variant">
                            {new Date(log.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${badgeColor} bg-transparent p-0`}>
                          <span className="material-symbols-outlined text-sm">{statusIcon}</span>
                          <span className="font-label-sm text-xs font-bold">{statusText}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons if Pending */}
                    {log.status === "PENDING" && (
                      <div className="flex gap-2 pt-2 border-t border-outline-variant/5">
                        <button
                          onClick={() => confirmDose(log.doseEventId)}
                          className="flex-1 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all"
                        >
                          {t("patient.adherence.confirmTaken")}
                        </button>
                        <button
                          onClick={() => skipDose(log.doseEventId)}
                          className="flex-1 py-2 border border-outline-variant text-on-surface text-xs font-bold rounded-lg hover:bg-surface-variant/20 active:scale-95 transition-all"
                        >
                          {t("patient.adherence.skipDose")}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-8 text-center text-slate-500">
              {t("patient.adherence.noDoses")}
            </div>
          )}
        </section>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface-container/90 backdrop-blur-xl border-t border-outline-variant/10 shadow-lg">
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-transform duration-300" href="/home">
          <span className="material-symbols-outlined">home</span>
          <span className="font-label-sm text-label-sm">{t("patient.nav.home")}</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-transform duration-300" href="/medications">
          <span className="material-symbols-outlined">medication</span>
          <span className="font-label-sm text-label-sm">{t("patient.nav.meds")}</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-primary px-3 py-1 scale-100 font-bold" href="/adherence">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>query_stats</span>
          <span className="font-label-sm text-label-sm">{t("patient.nav.adherence")}</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-transform duration-300" href="/caregivers">
          <span className="material-symbols-outlined">groups</span>
          <span className="font-label-sm text-label-sm">{t("patient.nav.care")}</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-transform duration-300" href="/profile">
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-sm text-label-sm">{t("patient.nav.profile")}</span>
        </Link>
      </nav>
    </div>
  );
}
