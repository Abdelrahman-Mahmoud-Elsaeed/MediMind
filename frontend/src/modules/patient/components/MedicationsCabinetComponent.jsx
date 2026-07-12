"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useMedicationsCabinet } from "../hooks/useMedicationsCabinet";

export default function MedicationsCabinetComponent() {
  const { t, locale, toggleLanguage } = useTranslation();
  const [filter, setFilter] = useState("all");
  const { filteredMeds, loading, error } = useMedicationsCabinet(filter);

  const getFormTypeIcon = (formType) => {
    switch (formType) {
      case "TABLET":
      case "CAPSULE":
        return "pill";
      case "SYRUP":
        return "water_drop";
      case "INJECTION":
        return "syringe";
      case "DROP":
        return "opacity";
      case "CREAM":
        return "dry_cleaning";
      default:
        return "medication";
    }
  };

  const getRelationToMealsText = (relation) => {
    switch (relation) {
      case "BEFORE_MEALS":
        return locale === "ar" ? "قبل الوجبات" : "Before meals";
      case "AFTER_MEALS":
        return locale === "ar" ? "بعد الوجبات" : "After meals";
      case "WITH_FOOD":
        return locale === "ar" ? "مع الطعام" : "With food";
      case "ON_EMPTY_STOMACH":
        return locale === "ar" ? "على معدة فارغة" : "On an empty stomach";
      default:
        return locale === "ar" ? "لا توجد علاقة محددة بالوجبات" : "No specific meal relation";
    }
  };

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
          <Link href="/notifications" className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-all">
            <span className="material-symbols-outlined text-primary">notifications</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-margin-mobile max-w-container-max mx-auto space-y-6">
        <section>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-1">{t("patient.cabinet.title")}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">{t("patient.cabinet.subtitle")}</p>
        </section>

        {/* Filter Chips */}
        <section className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-full font-label-sm text-xs font-bold transition-all ${
              filter === "all"
                ? "bg-primary text-on-primary"
                : "bg-surface-container border border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {t("patient.cabinet.all")}
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-1.5 rounded-full font-label-sm text-xs font-bold transition-all ${
              filter === "active"
                ? "bg-primary text-on-primary"
                : "bg-surface-container border border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {t("patient.cabinet.active")}
          </button>
          <button
            onClick={() => setFilter("refill")}
            className={`px-4 py-1.5 rounded-full font-label-sm text-xs font-bold transition-all ${
              filter === "refill"
                ? "bg-primary text-on-primary"
                : "bg-surface-container border border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {t("patient.cabinet.lowStock")}
          </button>
        </section>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading cabinet...</div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : filteredMeds.length > 0 ? (
          /* Medications Cards List */
          <section className="flex flex-col gap-4">
            {filteredMeds.map((med) => {
              const currentStock = med.inventory.currentQuantity;
              const totalStock = med.inventory.initialQuantity || currentStock || 100;
              const isLowStock = currentStock <= med.inventory.refillThreshold;
              const mealText = getRelationToMealsText(med.instructions?.relationToMeals);
              const customNotes = med.instructions?.notes ? ` • ${med.instructions.notes}` : "";

              return (
                <div
                  key={med.medicationId}
                  className="bg-surface-container border border-outline-variant/10 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:border-primary/20 transition-all"
                >
                  <div className="flex items-start gap-4 justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-secondary/15 text-secondary">
                        <span className="material-symbols-outlined text-2xl">
                          {getFormTypeIcon(med.formType)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-body-lg font-bold text-on-surface flex items-center gap-2">
                          {med.name}
                          <span className="text-xs font-normal text-on-surface-variant/75">
                            ({med.inventory.doseAmount} {locale === "ar" ? "جرعة" : "dose"})
                          </span>
                        </h3>
                        <p className="text-on-surface-variant text-xs mt-1 leading-snug">
                          {mealText}{customNotes}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      med.isActive ? "bg-secondary/10 text-secondary" : "bg-slate-500/10 text-slate-400"
                    }`}>
                      {med.isActive ? (locale === "ar" ? "نشط" : "Active") : (locale === "ar" ? "غير نشط" : "Inactive")}
                    </span>
                  </div>

                  {/* Progress Count / Refill alert */}
                  <div className="pt-2 border-t border-outline-variant/10 flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-label-sm text-on-surface-variant/80">
                      <span>Cabinet Stock</span>
                      <span>
                        {currentStock} / {totalStock} {t("patient.cabinet.remaining")}
                      </span>
                    </div>
                    <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLowStock ? "bg-error" : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(100, (currentStock / totalStock) * 100)}%` }}
                      ></div>
                    </div>
                    {isLowStock && (
                      <div className="flex items-center gap-1.5 text-error text-xs font-bold mt-1">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        {t("patient.cabinet.refillNeeded").replace("{{stock}}", currentStock)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        ) : (
          <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-8 text-center text-slate-500">
            {t("patient.cabinet.noMeds")}
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) */}
      <Link
        href="/medications/add"
        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </Link>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface-container/90 backdrop-blur-xl border-t border-outline-variant/10 shadow-lg">
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-transform duration-300" href="/home">
          <span className="material-symbols-outlined">home</span>
          <span className="font-label-sm text-label-sm">{t("patient.nav.home")}</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-primary px-3 py-1 scale-100 font-bold" href="/medications">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>medication</span>
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
