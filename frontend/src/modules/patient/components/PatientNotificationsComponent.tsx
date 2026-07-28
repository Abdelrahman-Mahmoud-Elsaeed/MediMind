"use client";

import Link from "next/link";
import { useTranslation } from "@/shared/lib/i18nContext";
import { usePatientNotifications } from "../hooks/usePatientNotifications";

export default function PatientNotificationsComponent() {
  const { t, locale, toggleLanguage } = useTranslation();
  const { alerts, loading, error } = usePatientNotifications();

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen pb-32">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md flex justify-between items-center px-margin-mobile h-16 border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <Link href="/home" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/20 transition-colors duration-200">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">
            {locale === "ar" ? "الإشعارات" : "Notifications"}
          </h1>
        </div>
        <button
          onClick={toggleLanguage}
          className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary-container/20 border border-primary/30 text-primary transition-all duration-200"
        >
          {locale === "en" ? "العربية" : "EN"}
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-margin-mobile max-w-container-max mx-auto space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading notifications...</div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : (
          <section className="flex flex-col gap-3">
            {alerts.map((notification) => (
              <div
                key={notification.id}
                className="bg-surface-container border border-outline-variant/10 rounded-2xl p-5 flex items-start gap-4 transition-all hover:bg-surface-container-high"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${notification.color}`}>
                  <span className="material-symbols-outlined">
                    {notification.icon === "pill" ? "medication" : notification.icon}
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-label-md text-label-md font-bold text-on-surface">{notification.title}</h4>
                    <span className="text-xs font-label-sm text-on-surface-variant/60">{notification.time}</span>
                  </div>
                  <p className="text-on-surface-variant font-body-md text-sm leading-snug">{notification.description}</p>
                </div>
              </div>
            ))}
          </section>
        )}
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
