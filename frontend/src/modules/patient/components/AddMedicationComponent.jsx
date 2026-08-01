"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useAddMedication } from "../hooks/useAddMedication";
import { Card, Button, Badge } from "@/shared/components/ui";
import { ArrowLeft, Camera, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

export default function AddMedicationComponent() {
  const router = useRouter();
  const { t, locale } = useTranslation();
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
    submitForm,
  } = useAddMedication(() => {
    router.push("/medications");
  });

  if (isScanning) {
    return (
      <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col overflow-hidden relative z-50">
        {/* Scanner Header */}
        <header className="w-full bg-background/80 backdrop-blur-lg flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <Button variant="ghost" size="icon" onClick={cancelScan} className="rounded-full">
            <ArrowLeft className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </Button>
          <h1 className="font-headline-md text-lg font-bold text-teal-700 dark:text-teal-400">{t("patient.add.scanTitle")}</h1>
          <div className="w-10"></div>
        </header>

        {/* Viewfinder area */}
        <main className="flex-1 flex flex-col items-center justify-start px-6 pt-4 pb-32">
          <div className="relative w-full aspect-[3/4] max-w-md bg-zinc-900 rounded-[32px] overflow-hidden shadow-2xl border border-white/10">
            <div className="absolute inset-0 w-full h-full bg-zinc-950 flex items-center justify-center">
              <span className="text-zinc-500 text-xs font-medium">Simulated Camera Feed Active...</span>
            </div>

            {/* Scanner Reticle Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <div className="relative w-full aspect-square max-w-[240px] border-2 border-teal-400/40 rounded-2xl overflow-hidden animate-pulse">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-lg"></div>

                {/* Scan Line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)] animate-bounce"></div>
              </div>
            </div>

            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10">
              <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                LIVE AI OCR
              </span>
            </div>
          </div>

          <p className="mt-6 text-center text-slate-500 dark:text-slate-400 text-sm max-w-xs">
            {t("patient.add.alignDesc")}
          </p>

          {/* Shutter controls */}
          <div className="mt-auto mb-4 w-full max-w-md flex items-center justify-evenly">
            <Button variant="ghost" onClick={() => captureScan(true)} className="text-xs text-red-400 font-bold hover:bg-red-500/10">
              {locale === "ar" ? "فشل" : "FAIL"}
            </Button>
            <button onClick={() => captureScan(false)} className="group relative flex items-center justify-center w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-white/20 scale-110"></div>
              <div className="w-16 h-16 bg-white rounded-full shadow-lg active:scale-95 transition-transform"></div>
            </button>
            <Button variant="ghost" onClick={() => captureScan(false)} className="text-xs text-emerald-400 font-bold hover:bg-emerald-500/10">
              {locale === "ar" ? "نجاح" : "PASS"}
            </Button>
          </div>
        </main>

        {/* Scan Result bottom sheet */}
        {scanResult === "success" && scannedMedInfo && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 text-white rounded-t-3xl p-6 shadow-2xl border-t border-slate-800 max-w-2xl mx-auto">
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-6"></div>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{scannedMedInfo.name}</h3>
                  <Badge variant="success">
                    {Math.round(scannedMedInfo.confidenceScore * 100)}% Match
                  </Badge>
                </div>
                <p className="text-slate-400 text-sm mt-0.5">{scannedMedInfo.formType}</p>
              </div>
            </div>
            <Button onClick={autofill} className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg h-auto">
              {t("patient.add.autofill")}
            </Button>
          </div>
        )}

        {scanResult === "error" && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 text-white rounded-t-3xl p-6 shadow-2xl border-t border-slate-800 max-w-2xl mx-auto">
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-6"></div>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{t("patient.add.unclearScan")}</h3>
                  <Badge variant="destructive">Low Confidence</Badge>
                </div>
                <p className="text-slate-400 text-sm mt-0.5">{t("patient.add.scanError")}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={triggerScan} className="flex-1 py-3 text-slate-200 border-slate-700">
                {t("patient.add.retake")}
              </Button>
              <Button variant="default" onClick={cancelScan} className="flex-1 py-3 bg-teal-600 text-white">
                {t("patient.add.enterManually")}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <MainLayout activePath="/medications">
      <div className="max-w-[1000px] mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/medications">
              <ArrowLeft className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-on-surface">{t("patient.add.title")}</h1>
        </div>

        {/* AI OCR Scanner Entry Card */}
        <Card onClick={() => router.push('/ocr-scan')} className="bg-gradient-to-r from-teal-500/10 to-teal-600/5 dark:from-teal-950/40 dark:to-slate-900 border border-teal-500/20 hover:border-teal-500/40 transition-all p-6 rounded-2xl text-center cursor-pointer group shadow-none">
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-teal-600/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Camera className="w-7 h-7" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-on-surface">{t("patient.add.scanPackage")}</h3>
              <Badge variant="default" className="bg-teal-600 text-white text-[10px] font-bold px-2">AI OCR</Badge>
            </div>
            <p className="text-on-surface-variant text-xs max-w-sm">
              {t("patient.add.scanDesc")}
            </p>
          </div>
        </Card>

        {/* Regular Form */}
        <Card className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 p-8 rounded-2xl shadow-xs">
          {validationError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-xs font-bold mb-6">
              {validationError}
            </div>
          )}

          <form onSubmit={submitForm} className="space-y-6">
            {conditions.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {t("patient.add.medCondition")}
                </label>
                <select
                  value={selectedConditionId}
                  onChange={(e) => setSelectedConditionId(e.target.value)}
                  className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
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
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                {t("patient.add.medName")}
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium placeholder:text-on-surface-variant/40"
                placeholder="e.g. Amoxicillin"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {t("patient.add.dosageStrength")}
                </label>
                <input
                  type="text"
                  required
                  value={form.strength}
                  onChange={(e) => setForm({ ...form, strength: e.target.value })}
                  className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium placeholder:text-on-surface-variant/40"
                  placeholder="e.g. 500mg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {t("patient.add.formFactor")}
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {t("patient.add.frequency")}
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
                >
                  <option value="DAILY">{locale === "ar" ? "يومياً" : "Daily"}</option>
                  <option value="2x Daily">{locale === "ar" ? "مرتين يومياً" : "2x Daily"}</option>
                  <option value="WEEKLY">{locale === "ar" ? "أسبوعياً" : "Weekly"}</option>
                  <option value="AS_NEEDED">{locale === "ar" ? "عند الحاجة" : "As Needed"}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {t("patient.add.doseTime")}
                </label>
                <input
                  type="time"
                  required
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {t("patient.add.relationToMeals")}
                </label>
                <select
                  value={form.relationToMeals}
                  onChange={(e) => setForm({ ...form, relationToMeals: e.target.value })}
                  className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
                >
                  <option value="NONE">{locale === "ar" ? "لا يوجد" : "None"}</option>
                  <option value="BEFORE_MEALS">{locale === "ar" ? "قبل الوجبات" : "Before Meals"}</option>
                  <option value="AFTER_MEALS">{locale === "ar" ? "بعد الوجبات" : "After Meals"}</option>
                  <option value="WITH_FOOD">{locale === "ar" ? "مع الطعام" : "With Food"}</option>
                  <option value="ON_EMPTY_STOMACH">{locale === "ar" ? "على معدة فارغة" : "On Empty Stomach"}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {t("patient.add.totalDoses")}
                </label>
                <input
                  type="number"
                  required
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium placeholder:text-on-surface-variant/40"
                  placeholder="e.g. 60"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 transition-all mt-8 h-auto text-base"
            >
              {submitting ? t("patient.add.submitting") : t("patient.add.submit")}
            </Button>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
