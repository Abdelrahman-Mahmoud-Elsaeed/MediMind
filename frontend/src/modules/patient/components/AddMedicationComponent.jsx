"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useAddMedication } from "../hooks/useAddMedication";

export default function AddMedicationComponent() {
  const router = useRouter();
  const { t, locale, toggleLanguage } = useTranslation();

  const {
    form,
    setForm,
    isScanning,
    scanResult,
    scannedMedInfo,
    conditions,
    selectedConditionId,
    setSelectedConditionId,
    submitting,
    validationError,
    triggerScan,
    captureScan,
    autofill,
    cancelScan,
    submitForm
  } = useAddMedication(() => {
    router.push("/medications");
  });

  if (isScanning) {
    return (
      <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col overflow-hidden relative z-50">
        {/* Scanner Header */}
        <header className="w-full bg-background/80 backdrop-blur-lg flex justify-between items-center px-6 py-4">
          <button onClick={cancelScan} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/20 transition-colors">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">{t("patient.add.scanTitle")}</h1>
          <div className="w-10"></div>
        </header>

        {/* Viewfinder area */}
        <main className="flex-1 flex flex-col items-center justify-start px-6 pt-4 pb-32">
          <div className="relative w-full aspect-[3/4] bg-surface-container-lowest rounded-[32px] overflow-hidden shadow-2xl border border-outline-variant/10">
            <div className="absolute inset-0 w-full h-full bg-zinc-900 flex items-center justify-center">
              <span className="text-on-surface/40 text-xs font-label-sm">Simulated Camera Feed Active...</span>
            </div>
            
            {/* Scanner Reticle Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <div className="relative w-full aspect-square max-w-[240px] border-2 border-primary/40 rounded-2xl overflow-hidden animate-pulse">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                
                {/* Scan Line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(149,204,255,0.8)] animate-bounce"></div>
              </div>
            </div>

            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur px-3 py-1 rounded-full border border-white/10">
              <span className="text-xs font-label-sm text-primary flex items-center gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                LIVE AI OCR
              </span>
            </div>
          </div>

          <p className="mt-6 text-center text-on-surface-variant font-label-md max-w-xs">
            {t("patient.add.alignDesc")}
          </p>

          {/* Shutter controls */}
          <div className="mt-auto mb-4 w-full flex items-center justify-evenly">
            <button
              onClick={() => captureScan(true)}
              className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-variant/40 transition-all text-xs text-red-400 font-bold"
            >
              {locale === "ar" ? "فشل" : "FAIL"}
            </button>
            <button onClick={() => captureScan(false)} className="group relative flex items-center justify-center w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-white/20 scale-110"></div>
              <div className="w-16 h-16 bg-white rounded-full shadow-lg active:scale-95 transition-transform"></div>
            </button>
            <button
              onClick={() => captureScan(false)}
              className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-variant/40 transition-all text-xs text-green-400 font-bold"
            >
              {locale === "ar" ? "نجاح" : "PASS"}
            </button>
          </div>
        </main>

        {/* Scan Result bottom sheet */}
        {scanResult === "success" && scannedMedInfo && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-high rounded-t-3xl p-6 shadow-2xl border-t border-outline-variant/10">
            <div className="w-12 h-1 bg-outline-variant/30 rounded-full mx-auto mb-6"></div>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-md text-on-surface text-lg font-bold">{scannedMedInfo.name}</h3>
                  <span className="text-secondary font-label-sm text-xs px-2 py-0.5 bg-secondary/10 rounded-full">
                    {Math.round(scannedMedInfo.confidenceScore * 100)}% Match
                  </span>
                </div>
                <p className="text-on-surface-variant font-body-md text-sm mt-0.5">{scannedMedInfo.formType}</p>
              </div>
            </div>
            <button onClick={autofill} className="w-full py-4 bg-primary text-on-primary font-bold rounded-2xl shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all">
              {t("patient.add.autofill")}
            </button>
          </div>
        )}

        {scanResult === "error" && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-high rounded-t-3xl p-6 shadow-2xl border-t border-outline-variant/10">
            <div className="w-12 h-1 bg-outline-variant/30 rounded-full mx-auto mb-6"></div>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center text-error">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-md text-on-surface text-lg font-bold">{t("patient.add.unclearScan")}</h3>
                  <span className="text-tertiary font-label-sm text-xs px-2 py-0.5 bg-tertiary/10 rounded-full">Low Confidence</span>
                </div>
                <p className="text-on-surface-variant font-body-md text-sm mt-0.5">{t("patient.add.scanError")}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setScanResult(null)} className="flex-1 py-4 border border-outline-variant text-on-surface font-label-md rounded-2xl hover:bg-surface-variant/20 transition-all">
                {t("patient.add.retake")}
              </button>
              <button onClick={cancelScan} className="flex-1 py-4 bg-tertiary text-on-tertiary font-label-md rounded-2xl shadow-lg hover:brightness-110 transition-all">
                {t("patient.add.enterManually")}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen pb-32">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md flex justify-between items-center px-margin-mobile h-16 border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <Link href="/medications" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/20 transition-colors duration-200">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">{t("patient.add.title")}</h1>
        </div>
        <button
          onClick={toggleLanguage}
          className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary-container/20 border border-primary/30 text-primary transition-all duration-200"
        >
          {locale === "en" ? "العربية" : "EN"}
        </button>
      </header>

      {/* Main Content Form */}
      <main className="pt-20 px-margin-mobile max-w-container-max mx-auto space-y-6">
        {/* AI Scan Package Trigger */}
        <section onClick={triggerScan} className="bg-surface-container border border-dashed border-outline-variant hover:bg-surface-container-high transition-all p-6 rounded-2xl text-center cursor-pointer group">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary mb-2 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-2xl">photo_camera</span>
            </div>
            <h3 className="font-headline-md text-body-lg font-bold text-on-surface">{t("patient.add.scanPackage")}</h3>
            <p className="text-on-surface-variant text-xs max-w-xs">
              {t("patient.add.scanDesc")}
            </p>
          </div>
        </section>

        {/* Regular Form */}
        <section className="bg-surface-container border border-outline-variant/10 p-6 rounded-2xl">
          {validationError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-xs font-bold mb-4">
              {validationError}
            </div>
          )}

          <form onSubmit={submitForm} className="space-y-5">
            {conditions.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">{t("patient.add.medCondition")}</label>
                <select
                  value={selectedConditionId}
                  onChange={(e) => setSelectedConditionId(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface"
                >
                  {conditions.map((cond) => (
                    <option key={cond._id || cond.conditionId} value={cond._id || cond.conditionId}>
                      {cond.diseaseName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">{t("patient.add.medName")}</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface placeholder:text-on-surface-variant/40"
                placeholder="e.g. Amoxicillin"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">{t("patient.add.dosageStrength")}</label>
                <input
                  type="text"
                  required
                  value={form.strength}
                  onChange={(e) => setForm({ ...form, strength: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface placeholder:text-on-surface-variant/40"
                  placeholder="e.g. 500mg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">{t("patient.add.formFactor")}</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface"
                >
                  <option value="CAPSULE">{locale === "ar" ? "كبسولة" : "Capsule"}</option>
                  <option value="TABLET">{locale === "ar" ? "قرص" : "Tablet"}</option>
                  <option value="SYRUP">{locale === "ar" ? "شراب / سائل" : "Liquid / Syrup"}</option>
                  <option value="INJECTION">{locale === "ar" ? "حقنة" : "Injection"}</option>
                  <option value="DROP">{locale === "ar" ? "قطرات" : "Drops"}</option>
                  <option value="CREAM">{locale === "ar" ? "دهان / كريم" : "Cream"}</option>
                  <option value="OTHER">{locale === "ar" ? "غير ذلك" : "Other"}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">{t("patient.add.frequency")}</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface"
                >
                  <option value="DAILY">{locale === "ar" ? "يومياً" : "Daily"}</option>
                  <option value="2x Daily">{locale === "ar" ? "مرتين يومياً" : "2x Daily"}</option>
                  <option value="WEEKLY">{locale === "ar" ? "أسبوعياً" : "Weekly"}</option>
                  <option value="AS_NEEDED">{locale === "ar" ? "عند الحاجة" : "As Needed"}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">{t("patient.add.doseTime")}</label>
                <input
                  type="time"
                  required
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">{t("patient.add.relationToMeals")}</label>
                <select
                  value={form.relationToMeals}
                  onChange={(e) => setForm({ ...form, relationToMeals: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface"
                >
                  <option value="NONE">{locale === "ar" ? "لا يوجد" : "None"}</option>
                  <option value="BEFORE_MEALS">{locale === "ar" ? "قبل الوجبات" : "Before Meals"}</option>
                  <option value="AFTER_MEALS">{locale === "ar" ? "بعد الوجبات" : "After Meals"}</option>
                  <option value="WITH_FOOD">{locale === "ar" ? "مع الطعام" : "With Food"}</option>
                  <option value="ON_EMPTY_STOMACH">{locale === "ar" ? "على معدة فارغة" : "On Empty Stomach"}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">{t("patient.add.totalDoses")}</label>
                <input
                  type="number"
                  required
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface placeholder:text-on-surface-variant/40"
                  placeholder="e.g. 60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center mt-6 disabled:opacity-50"
            >
              {submitting ? t("patient.add.submitting") : t("patient.add.submit")}
            </button>
          </form>
        </section>
      </main>

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
