"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useAddMedication } from "../hooks/useAddMedication";
import { Card, Button, Badge, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Pill,
  Clock,
  PackageCheck,
  FileText,
  Lock,
  Plus,
  ShieldCheck,
  Calendar,
  AlertCircle,
  ChevronDown
} from "lucide-react";

export default function AddMedicationComponent() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const isAr = locale === "ar";

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

  const getFormUnit = (type) => {
    switch (type) {
      case "CAPSULE": return t("medications.units.capsule");
      case "TABLET": return t("medications.units.tablet");
      case "SYRUP": return t("medications.units.syrup");
      case "INJECTION": return t("medications.units.injection");
      case "DROP": return t("medications.units.drop");
      case "CREAM": return t("medications.units.cream");
      default: return t("medications.units.unit");
    }
  };

  const formUnit = getFormUnit(form.type);

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
              {isAr ? "فشل" : "FAIL"}
            </Button>
            <button onClick={() => captureScan(false)} className="group relative flex items-center justify-center w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-white/20 scale-110"></div>
              <div className="w-16 h-16 bg-white rounded-full shadow-lg active:scale-95 transition-transform"></div>
            </button>
            <Button variant="ghost" onClick={() => captureScan(false)} className="text-xs text-emerald-400 font-bold hover:bg-emerald-500/10">
              {isAr ? "نجاح" : "PASS"}
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
        
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 p-6 sm:p-7 rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-4">
            <Link
              href="/medications"
              className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 flex items-center justify-center transition-all cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-xl rtl:rotate-180">arrow_back</span>
            </Link>
            <div>
              <span className="text-[11px] font-extrabold text-teal-700 dark:text-teal-400 uppercase tracking-widest block mb-0.5">
                {isAr ? "إدارة الأدوية والعلاجات" : "MEDICATION MANAGEMENT"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t("patient.add.title")}
              </h1>
            </div>
          </div>
        </div>

        {/* AI OCR Scanner Entry Card */}
        <Card onClick={() => router.push('/ocr-scan')} className="bg-gradient-to-r from-teal-500/10 to-teal-600/5 dark:from-teal-950/40 dark:to-slate-900 border border-teal-500/20 hover:border-teal-500/40 transition-all p-6 sm:p-7 rounded-[28px] text-center cursor-pointer group shadow-none">
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

        {/* Main Form Form */}
        <form onSubmit={submitForm} className="space-y-6">
          
          {validationError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 p-4 rounded-2xl text-center text-xs font-bold flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: General Information */}
          <section className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-[28px] shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {isAr ? "معلومات الدواء الأساسية" : "Basic Medication Details"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isAr ? "الاسم التجاري، النموذج الطبي، والحالة المرتبطة" : "Medication brand name, form factor, and linked medical condition."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                  {t("patient.add.medName")}
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3.5 outline-none text-slate-900 dark:text-slate-100 font-medium transition-all text-xs sm:text-sm placeholder:text-slate-400"
                  placeholder="e.g. Lipitor / Amoxicillin"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                  {t("patient.add.formFactor")}
                </label>
                <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                  <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3.5 h-auto text-slate-900 dark:text-slate-100 font-medium text-xs sm:text-sm cursor-pointer shadow-2xs">
                    <SelectValue placeholder={isAr ? "اختر الشكل الصيدلاني" : "Select Form Factor"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50">
                    <SelectItem value="CAPSULE">{isAr ? "كبسولة (Capsule)" : "Capsule"}</SelectItem>
                    <SelectItem value="TABLET">{isAr ? "قرص (Tablet)" : "Tablet"}</SelectItem>
                    <SelectItem value="SYRUP">{isAr ? "شراب / سائل (Liquid / Syrup)" : "Liquid / Syrup"}</SelectItem>
                    <SelectItem value="INJECTION">{isAr ? "حقنة (Injection)" : "Injection"}</SelectItem>
                    <SelectItem value="DROP">{isAr ? "قطرات (Drops)" : "Drops"}</SelectItem>
                    <SelectItem value="CREAM">{isAr ? "دهان / كريم (Cream)" : "Cream"}</SelectItem>
                    <SelectItem value="OTHER">{isAr ? "غير ذلك (Other)" : "Other"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                {t("patient.add.medCondition")} <span className="text-slate-400 font-normal">({isAr ? "اختياري" : "Optional"})</span>
              </label>
              <Select
                value={selectedConditionId || "none"}
                onValueChange={(val) => setSelectedConditionId(val === "none" ? "" : val)}
              >
                <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3.5 h-auto text-slate-900 dark:text-slate-100 font-medium text-xs sm:text-sm cursor-pointer shadow-2xs">
                  <SelectValue placeholder={isAr ? "اختر الحالة الطبية" : "Select Condition"} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50">
                  <SelectItem value="none">{isAr ? "بدون حالة طبية (اختياري)" : "None / Unspecified (Optional)"}</SelectItem>
                  {conditions.map((cond) => (
                    <SelectItem key={cond._id || cond.conditionId} value={cond._id || cond.conditionId}>
                      {cond.diseaseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Section 2: Dosing & Schedule */}
          <section className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-[28px] shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {isAr ? "مواعيد الجرعات والجدول" : "Dosage Strength & Intake Schedule"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isAr ? "حدد تركيز الدواء، تكرار الجرعات، والعلاقة بالوجبات" : "Configure dosage strength, daily frequency, and meal relations."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                  {t("patient.add.dosageStrength")}
                </label>
                <input
                  type="text"
                  required
                  value={form.strength}
                  onChange={(e) => setForm({ ...form, strength: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3.5 outline-none text-slate-900 dark:text-slate-100 font-medium transition-all text-xs sm:text-sm placeholder:text-slate-400"
                  placeholder="e.g. 500mg"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                  {t("patient.add.frequency")}
                </label>
                <Select value={form.frequency} onValueChange={(val) => setForm({ ...form, frequency: val })}>
                  <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3.5 h-auto text-slate-900 dark:text-slate-100 font-medium text-xs sm:text-sm cursor-pointer shadow-2xs">
                    <SelectValue placeholder={isAr ? "اختر النمط والتكرار" : "Select Frequency"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50">
                    <SelectItem value="DAILY_1">{isAr ? "مرة واحدة يومياً (كل 24 ساعة)" : "1x Daily (Every 24 Hours)"}</SelectItem>
                    <SelectItem value="DAILY_2">{isAr ? "مرتين يومياً (كل 12 ساعة)" : "2x Daily (Every 12 Hours)"}</SelectItem>
                    <SelectItem value="DAILY_3">{isAr ? "3 مرات يومياً (كل 8 ساعات)" : "3x Daily (Every 8 Hours)"}</SelectItem>
                    <SelectItem value="DAILY_4">{isAr ? "4 مرات يومياً (كل 6 ساعات)" : "4x Daily (Every 6 Hours)"}</SelectItem>
                    <SelectItem value="WEEKLY">{isAr ? "أسبوعياً (كل 7 أيام)" : "Weekly (Every 7 Days)"}</SelectItem>
                    <SelectItem value="AS_NEEDED">{isAr ? "عند الحاجة (PRN)" : "As Needed (PRN)"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.frequency === "AS_NEEDED" ? (
                <div>
                  <label className="text-xs font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2 block">
                    {isAr ? "الحد الأقصى للجرعات يومياً (PRN)" : "Max Doses Allowed Per Day"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    required
                    value={form.maxDosesPerDay || 1}
                    onChange={(e) => setForm({ ...form, maxDosesPerDay: e.target.value })}
                    className="w-full bg-teal-500/5 dark:bg-slate-800/60 border border-teal-500/40 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3.5 outline-none text-slate-900 dark:text-slate-100 font-extrabold transition-all text-xs sm:text-sm"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                    {t("patient.add.doseTime")}
                  </label>
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3.5 outline-none text-slate-900 dark:text-slate-100 font-medium transition-all text-xs sm:text-sm"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                  {isAr ? `كمية الجرعة الواحدة (بالـ ${formUnit})` : `Dose Amount per Intake (in ${formUnit})`}
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={form.doseAmount}
                  onChange={(e) => setForm({ ...form, doseAmount: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3.5 outline-none text-slate-900 dark:text-slate-100 font-medium transition-all text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                  {t("patient.add.relationToMeals")}
                </label>
                <Select value={form.relationToMeals} onValueChange={(val) => setForm({ ...form, relationToMeals: val })}>
                  <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3.5 h-auto text-slate-900 dark:text-slate-100 font-medium text-xs sm:text-sm cursor-pointer shadow-2xs">
                    <SelectValue placeholder={isAr ? "العلاقة بالوجبات" : "Relation to Meals"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50">
                    <SelectItem value="NONE">{isAr ? "لا يوجد علاقة بالوجبات" : "None"}</SelectItem>
                    <SelectItem value="BEFORE_MEALS">{isAr ? "قبل الوجبات" : "Before Meals"}</SelectItem>
                    <SelectItem value="AFTER_MEALS">{isAr ? "بعد الوجبات" : "After Meals"}</SelectItem>
                    <SelectItem value="WITH_FOOD">{isAr ? "مع الطعام" : "With Food"}</SelectItem>
                    <SelectItem value="ON_EMPTY_STOMACH">{isAr ? "على معدة فارغة" : "On Empty Stomach"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Section 3: Stock & Inventory */}
          <section className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-[28px] shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {isAr ? "إدارة المخزون والتاريخ" : "Stock Inventory & Dates"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isAr ? "تتبع الكميات المتوفرة، حد التنبيه، وتاريخ الانتهاء" : "Track initial stock quantity, refill notifications, and expiration dates."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                  {t("patient.add.totalDoses")} ({formUnit})
                </label>
                <input
                  type="number"
                  required
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value, currentStock: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3.5 outline-none text-slate-900 dark:text-slate-100 font-medium transition-all text-xs sm:text-sm placeholder:text-slate-400"
                  placeholder="e.g. 60"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                  {isAr ? "حد إشعار التعبئة (Refill Threshold)" : "Refill Threshold"}
                </label>
                <input
                  type="number"
                  required
                  value={form.refillThreshold}
                  onChange={(e) => setForm({ ...form, refillThreshold: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3.5 outline-none text-slate-900 dark:text-slate-100 font-medium transition-all text-xs sm:text-sm"
                  placeholder="e.g. 5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                  {isAr ? "تاريخ البدء" : "Start Date"}
                </label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3.5 outline-none text-slate-900 dark:text-slate-100 font-medium transition-all text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                  {isAr ? "تاريخ انتهاء الصلاحية" : "Expiration Date"}
                </label>
                <input
                  type="date"
                  required
                  value={form.expirationDate}
                  onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3.5 outline-none text-slate-900 dark:text-slate-100 font-medium transition-all text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <input
                type="checkbox"
                id="isChronic"
                checked={form.isChronic}
                onChange={(e) => setForm({ ...form, isChronic: e.target.checked })}
                className="w-5 h-5 accent-teal-600 rounded-lg cursor-pointer shrink-0"
              />
              <label htmlFor="isChronic" className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 cursor-pointer select-none">
                {isAr ? "علاج مزمن (استخدام مستمر طويل الأجل)" : "Chronic Medication (Ongoing long-term treatment)"}
              </label>
            </div>
          </section>

          {/* Section 4: Metadata & Special Notes */}
          <section className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-[28px] shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {isAr ? "التعليمات والملاحظات الإضافية" : "Special Instructions & Provider Notes"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isAr ? "إرشادات الاستخدام المخصصة ومعلومات الطبيب والصيدلية" : "Enter specific dosage instructions, warnings, or specialist notes."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>{isAr ? "الطبيب المعالج" : "Prescribing Doctor"}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    {isAr ? "قراءة فقط" : "Read Only"}
                  </span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={form.prescribingDoctor}
                  className="w-full bg-slate-100/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed text-xs sm:text-sm rounded-2xl px-4 py-3.5 font-medium outline-none"
                  placeholder={isAr ? "سيتم تفعيلها في تحديث قادم..." : "Will be implemented in a future update"}
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>{isAr ? "الصيدلية المزودة" : "Dispensing Pharmacy"}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    {isAr ? "قراءة فقط" : "Read Only"}
                  </span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={form.pharmacyName}
                  className="w-full bg-slate-100/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed text-xs sm:text-sm rounded-2xl px-4 py-3.5 font-medium outline-none"
                  placeholder={isAr ? "سيتم تفعيلها في تحديث قادم..." : "Will be implemented in a future update"}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
                {isAr ? "الملاحظات والتعليمات الخاصة" : "Instructions & Special Notes"}
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3.5 outline-none text-slate-900 dark:text-slate-100 font-medium text-xs sm:text-sm placeholder:text-slate-400 transition-all resize-none"
                placeholder={isAr ? "أدخل أي تعليمات خاصة للاستخدام أو تحذيرات طارئة..." : "Enter specific usage instructions, dosage notes or warnings..."}
              />
            </div>
          </section>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-teal-500/25 transition-all duration-200 text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              <span>{submitting ? (isAr ? "جاري الإضافة..." : "Adding Medication...") : t("patient.add.submit")}</span>
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
