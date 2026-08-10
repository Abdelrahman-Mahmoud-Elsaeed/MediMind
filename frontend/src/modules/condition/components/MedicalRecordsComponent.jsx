"use client";
import React from "react";
import Link from "next/link";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useMedicalRecords } from "../hooks/useMedicalRecords";
import {
  FolderPlus,
  UploadCloud,
  FileText,
  Activity,
  Plus,
  Trash2,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Eye,
  AlertCircle
} from "lucide-react";

export default function MedicalRecordsComponent() {
    const { t, locale } = useTranslation();
    const isAr = locale === "ar";
    const {
      conditions,
      uploadedDocs,
      loading,
      submitting,
      validationError,
      diseaseName,
      setDiseaseName,
      isChronic,
      setIsChronic,
      diagnosedDate,
      setDiagnosedDate,
      notes,
      setNotes,
      addCondition,
      deleteCondition,
      uploadSimulatedDocument,
      deleteDocument
    } = useMedicalRecords();
    
    const handleConditionSubmit = (e) => {
        e.preventDefault();
        addCondition(e);
    };
    
    const handleDeleteConditionClick = (conditionId) => {
        if (confirm(isAr ? "هل أنت متأكد من حذف هذا السجل الطبية؟" : "Are you sure you want to delete this condition record?")) {
            deleteCondition(conditionId);
        }
    };
    
    const handleDeleteDocClick = (docId) => {
        if (confirm(isAr ? "هل أنت متأكد من حذف هذا المستند نهائياً؟" : "Are you sure you want to delete this document from your secure vault?")) {
            deleteDocument(docId);
        }
    };

    return (
      <MainLayout activePath="/medical-records">
        <div className="max-w-[1400px] mx-auto space-y-8">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 p-6 sm:p-7 rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-xl rtl:rotate-180">arrow_back</span>
              </Link>
              <div>
                <span className="text-[11px] font-extrabold text-teal-700 dark:text-teal-400 uppercase tracking-widest block mb-0.5">
                  {isAr ? "السجل الطبي والتأمين" : "HEALTH RECORDS & VAULT"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {t("patient.profile.medicalRecords")}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/medical-records/conditions"
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-xs transition-all flex items-center gap-2"
              >
                <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{isAr ? "إدارة الحالات الطبية" : "Manage Conditions"}</span>
              </Link>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Upload & Add Condition */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Upload Zone */}
              <section
                onClick={uploadSimulatedDocument}
                className="bg-white dark:bg-slate-900/90 border-2 border-dashed border-teal-500/30 dark:border-teal-500/20 hover:border-teal-500 dark:hover:border-teal-400 hover:bg-teal-500/5 transition-all duration-300 p-8 rounded-[28px] text-center cursor-pointer group shadow-xs relative overflow-hidden"
              >
                <div className="flex flex-col items-center gap-3 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xs">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                      {t("patient.records.uploadDocs")}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs mt-1 leading-relaxed">
                      {t("patient.records.uploadDesc")}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold mt-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isAr ? "تشفير آمن متاح" : "Secure HIPAA Encrypted Vault"}</span>
                  </span>
                </div>
              </section>

              {/* Add New Condition Form */}
              <section className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 rounded-[28px] shadow-xs space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {t("patient.records.addCondition")}
                  </h2>
                </div>

                {validationError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3.5 rounded-2xl text-center text-xs font-bold flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                <form onSubmit={handleConditionSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      {t("patient.records.conditionName")}
                    </label>
                    <input
                      required
                      value={diseaseName}
                      onChange={(e) => setDiseaseName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3 outline-none text-slate-900 dark:text-slate-100 font-medium transition-all text-xs sm:text-sm placeholder:text-slate-400"
                      placeholder="e.g. Hypertension"
                      type="text"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        {t("patient.records.diagnosedDate")}
                      </label>
                      <input
                        type="date"
                        value={diagnosedDate}
                        onChange={(e) => setDiagnosedDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3 outline-none text-slate-900 dark:text-slate-100 font-medium transition-all text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        {t("patient.records.conditionType")}
                      </label>
                      <select
                        value={isChronic ? "chronic" : "acute"}
                        onChange={(e) => setIsChronic(e.target.value === "chronic")}
                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3 outline-none text-slate-900 dark:text-slate-100 font-medium transition-all text-xs sm:text-sm"
                      >
                        <option value="chronic">{t("patient.records.chronicType")}</option>
                        <option value="acute">{t("patient.records.acuteType")}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      {t("patient.records.remarks")}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3 outline-none text-slate-900 dark:text-slate-100 font-medium transition-all text-xs sm:text-sm resize-none placeholder:text-slate-400"
                      placeholder="Observations from your specialist..."
                      rows={3}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-teal-500/20 transition-all text-xs sm:text-sm disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (isAr ? "جاري الإضافة..." : "Saving...") : t("patient.records.submitRecord")}
                  </button>
                </form>
              </section>
            </div>

            {/* Right Column: Conditions List & Vault Documents */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Active Conditions Section */}
              <section className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 rounded-[28px] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {t("patient.profile.medicalConditions")}
                    </h2>
                  </div>
                  <Link
                    href="/medical-records/conditions"
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                  >
                    <span>{isAr ? "عرض الكل" : "View All"}</span>
                    <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </Link>
                </div>

                {loading ? (
                  <div className="py-8 text-center text-slate-500 text-xs font-bold">
                    {isAr ? "جاري تحميل الحالات..." : "Loading conditions..."}
                  </div>
                ) : conditions.length > 0 ? (
                  <div className="space-y-3">
                    {conditions.map((cond) => (
                      <div
                        key={cond.conditionId || cond._id}
                        className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:border-teal-500/40 transition-all group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                              {cond.diseaseName}
                            </h4>
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                cond.isChronic
                                  ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                  : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              }`}
                            >
                              {cond.isChronic ? t("patient.records.chronicType") : t("patient.records.acuteType")}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {isAr ? "تاريخ التشخيص: " : "Diagnosed: "}
                            {cond.diagnosedDate
                              ? new Date(cond.diagnosedDate).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })
                              : "N/A"}
                            {cond.notes ? ` • ${cond.notes}` : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteConditionClick(cond.conditionId || cond._id)}
                          className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
                        >
                          {isAr ? "حذف" : "Remove"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-500 dark:text-slate-400 text-xs font-bold">
                    {isAr ? "لا توجد حالات طبية مسجلة حالياً." : "No medical conditions listed. Add one to link medications."}
                  </div>
                )}
              </section>

              {/* Secure Document Vault Section */}
              <section className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 rounded-[28px] shadow-xs space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {t("patient.records.secureVault")}
                  </h2>
                </div>

                {uploadedDocs.length > 0 ? (
                  <div className="space-y-3">
                    {uploadedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-teal-500/40 transition-all group"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                              {doc.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                              <span className="bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                {doc.category}
                              </span>
                              <span>•</span>
                              <span>{doc.date}</span>
                              <span>•</span>
                              <span>{doc.fileSize}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => showInfo(isAr ? `جاري فتح المعاينة لملف ${doc.fileName}...` : `Opening simulated viewer for ${doc.fileName}...`, isAr ? 'معلومة' : 'Information')}
                            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <span>{isAr ? "عرض" : "View"}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteDocClick(doc.id)}
                            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isAr ? "حذف" : "Delete"}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-bold">
                    {isAr ? "خزينة المستندات فارغة حالياً." : "Secure vault is empty. Upload medical documents or reports above."}
                  </div>
                )}
              </section>
            </div>

          </div>
        </div>
      </MainLayout>
    );
}
