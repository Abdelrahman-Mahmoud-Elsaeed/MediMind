"use client";
import React from "react";
import Link from "next/link";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { useTranslation } from "@/shared/lib/i18nContext";
import { usePatientNotifications } from "../hooks/usePatientNotifications";
export default function PatientNotificationsComponent() {
    const { t, locale } = useTranslation();
    const { alerts, loading, error } = usePatientNotifications();
    return (<MainLayout activePath="/notifications">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/home" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/20 transition-colors duration-200">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <h1 className="text-2xl font-bold text-on-surface">
            {locale === "ar" ? "الإشعارات" : "Notifications"}
          </h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
            <p className="text-sm text-on-surface-variant">{locale === "ar" ? "جاري تحميل الإشعارات..." : "Loading notifications..."}</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-center font-medium border border-red-500/20">
            {error}
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 text-slate-400">notifications_off</span>
            <p className="text-sm font-bold">{locale === "ar" ? "لا توجد إشعارات جديدة حالياً" : "No new notifications right now"}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {alerts.map((notification) => (
              <div key={notification.id} className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 flex items-start gap-4 transition-all hover:bg-surface-container-high">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${notification.color}`}>
                  <span className="material-symbols-outlined">
                    {notification.icon === "pill" ? "medication" : notification.icon}
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-on-surface text-base">{notification.title}</h4>
                    <span className="text-xs text-on-surface-variant">{notification.time}</span>
                  </div>
                  <p className="text-on-surface-variant text-sm leading-snug">{notification.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>);
}
