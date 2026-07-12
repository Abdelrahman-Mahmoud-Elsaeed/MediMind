"use client";

import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useTranslation } from "@/shared/lib/i18nContext";
import { usePatientDashboard } from "../hooks/usePatientDashboard";

export default function PatientHomeComponent() {
  const { user } = useAuth();
  const userName = user?.name || "Sarah Smith";

  const { t, locale, toggleLanguage } = useTranslation();
  
  const {
    medications,
    loading,
    error,
    adherenceRate,
    nextDose,
    takenDoses,
    totalDoses,
    confirmDose,
    skipDose
  } = usePatientDashboard();

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
          <Link href="/notifications" className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-all duration-200">
            <span className="material-symbols-outlined">notifications</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-margin-mobile max-w-container-max mx-auto space-y-6">
        {/* Welcome Section */}
        <section className="mt-4">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-1">
            {t("patient.home.welcome")}, {userName}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">{t("patient.home.subtitle")}</p>
        </section>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading your schedule...</div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : (
          <>
            {/* Daily Progress Card */}
            <section className="bg-surface-container border border-outline-variant/10 rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <h3 className="font-headline-md text-body-lg font-bold text-on-surface">{t("patient.home.dailyAdherence")}</h3>
                <p className="text-on-surface-variant font-label-md text-label-md">
                  {t("patient.home.dosesTaken").replace("{{taken}}", takenDoses).replace("{{total}}", totalDoses)}
                </p>
              </div>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" className="stroke-surface-container-highest fill-none" strokeWidth="6" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="stroke-primary fill-none transition-all duration-500"
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - adherenceRate / 100)}
                  />
                </svg>
                <span className="absolute text-xs font-bold text-primary">{adherenceRate}%</span>
              </div>
            </section>

            {/* Next Dose Alert */}
            <section className="bg-primary-container/10 border border-primary/20 rounded-2xl p-6 space-y-4">
              {nextDose ? (
                <>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">alarm</span>
                    </div>
                    <div className="flex-1">
                      <span className="bg-primary/20 text-primary px-2.5 py-0.5 rounded-full font-label-sm text-label-sm">
                        {t("patient.home.nextDose")}
                      </span>
                      <h4 className="font-headline-md text-body-lg font-bold text-on-surface mt-2">
                        {nextDose.medicationName}
                      </h4>
                      <p className="text-on-surface-variant font-label-md text-label-md">
                        {t("patient.home.scheduledFor")} {new Date(nextDose.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => confirmDose(nextDose.doseEventId)}
                      className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all text-center"
                    >
                      {t("patient.home.takeNow")}
                    </button>
                    <button
                      onClick={() => skipDose(nextDose.doseEventId)}
                      className="flex-1 py-3 border border-outline-variant text-on-surface font-label-md rounded-xl hover:bg-surface-variant/20 transition-all text-center"
                    >
                      {t("patient.home.skip")}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-4">
                  <span className="material-symbols-outlined text-4xl text-primary mb-2">task_alt</span>
                  <h4 className="font-headline-md text-body-lg font-bold text-on-surface">{t("patient.home.allCaughtUp")}</h4>
                  <p className="text-on-surface-variant font-label-md text-label-md">
                    {t("patient.home.noPendingDoses")}
                  </p>
                </div>
              )}
            </section>

            {/* Cabinet Quick View */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-headline-md text-headline-md text-on-surface">{t("patient.home.cabinetQuickView")}</h3>
                <Link href="/medications" className="text-primary font-label-md text-label-md hover:underline">
                  {t("patient.home.viewCabinet")}
                </Link>
              </div>
              {medications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medications.slice(0, 4).map((med) => (
                    <div
                      key={med.medicationId}
                      className="bg-surface-container border border-outline-variant/10 rounded-2xl p-5 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 bg-secondary/15 rounded-xl flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined">
                          {med.formType === "TABLET" || med.formType === "CAPSULE" ? "pill" : "medication"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-label-md text-label-md font-bold text-on-surface">
                          {med.name}
                        </h4>
                        <p className="text-on-surface-variant font-label-sm text-label-sm">
                          {med.formType} • {med.schedule?.frequency}
                        </p>
                      </div>
                      <span className="text-secondary font-label-sm bg-secondary/10 px-2.5 py-0.5 rounded-full">
                        {med.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-8 text-center text-slate-500">
                  {t("patient.home.noMedications")}
                  <div className="mt-3">
                    <Link href="/medications/add" className="text-primary font-bold hover:underline">
                      {t("patient.home.addMedication")}
                    </Link>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface-container/90 backdrop-blur-xl border-t border-outline-variant/10 shadow-lg">
        <Link className="flex flex-col items-center justify-center text-primary px-3 py-1 scale-100 font-bold" href="/home">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="font-label-sm text-label-sm">{t("patient.nav.home")}</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-transform duration-300" href="/medications">
          <span className="material-symbols-outlined">medication</span>
          <span className="font-label-sm text-label-sm">{t("patient.nav.meds")}</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-transform duration-300" href="/adherence">
          <span className="material-symbols-outlined">query_stats</span>
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
