"use client";

import Link from "next/link";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useMedicalRecords } from "../hooks/useMedicalRecords";

export default function MedicalRecordsComponent() {
  const { t, locale, toggleLanguage } = useTranslation();

  const {
    conditions,
    uploadedDocs,
    loading,
    error,
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
    if (confirm(locale === "ar" ? "هل أنت متأكد من حذف هذا السجل؟" : "Are you sure you want to delete this condition record?")) {
      deleteCondition(conditionId);
    }
  };

  const handleDeleteDocClick = (docId) => {
    if (confirm(locale === "ar" ? "هل أنت متأكد من حذف هذا المستند نهائياً؟" : "Are you sure you want to delete this document from your secure vault?")) {
      deleteDocument(docId);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen pb-32">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md flex justify-between items-center px-margin-mobile h-16 border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <Link href="/profile" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/20 transition-colors duration-200">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">{t("patient.profile.medicalRecords")}</h1>
        </div>
        <button
          onClick={toggleLanguage}
          className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary-container/20 border border-primary/30 text-primary transition-all duration-200"
        >
          {locale === "en" ? "العربية" : "EN"}
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-margin-mobile max-w-container-max mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left Column: Upload and New Record */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Upload Zone */}
            <section onClick={uploadSimulatedDocument} className="bg-surface-container border border-dashed border-outline-variant hover:bg-surface-container-high transition-colors p-8 rounded-2xl text-center cursor-pointer group">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface">{t("patient.records.uploadDocs")}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
                  {t("patient.records.uploadDesc")}
                </p>
              </div>
            </section>

            {/* Add New Condition Form */}
            <section className="bg-surface-container border border-outline-variant/10 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">add_box</span>
                <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">{t("patient.records.addCondition")}</h2>
              </div>

              {validationError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-center text-xs font-bold mb-4">
                  {validationError}
                </div>
              )}

              <form onSubmit={handleConditionSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">{t("patient.records.conditionName")}</label>
                  <input
                    required
                    value={diseaseName}
                    onChange={(e) => setDiseaseName(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g. Hypertension"
                    type="text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">{t("patient.records.diagnosedDate")}</label>
                    <input
                      type="date"
                      value={diagnosedDate}
                      onChange={(e) => setDiagnosedDate(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">{t("patient.records.conditionType")}</label>
                    <select
                      value={isChronic ? "chronic" : "acute"}
                      onChange={(e) => setIsChronic(e.target.value === "chronic")}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="chronic">{t("patient.records.chronicType")}</option>
                      <option value="acute">{t("patient.records.acuteType")}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">{t("patient.records.remarks")}</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    placeholder="Observations from your specialist..."
                    rows="3"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary-container text-on-primary-container font-semibold py-4 rounded-lg active:scale-95 hover:brightness-110 transition-all shadow-lg disabled:opacity-50"
                >
                  {submitting ? "..." : t("patient.records.submitRecord")}
                </button>
              </form>
            </section>
          </div>

          {/* Right Column: Conditions and Document List */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div>
              <h2 className="font-headline-md text-headline-md font-semibold text-on-surface mb-4">{t("patient.profile.medicalConditions")}</h2>
              {loading ? (
                <div className="text-slate-500 text-sm">Loading conditions...</div>
              ) : conditions.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {conditions.map((cond) => (
                    <div
                      key={cond.conditionId || cond._id}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-4 flex items-center justify-between hover:border-primary/20 transition-all"
                    >
                      <div>
                        <h4 className="font-label-md text-base font-bold text-on-surface">
                          {cond.diseaseName}
                        </h4>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Diagnosed: {cond.diagnosedDate ? new Date(cond.diagnosedDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                          {cond.notes ? ` • ${cond.notes}` : ""}
                        </p>
                        <span className={`inline-block mt-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          cond.isChronic ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                        }`}>
                          {cond.isChronic ? t("patient.records.chronicType") : t("patient.records.acuteType")}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteConditionClick(cond.conditionId || cond._id)}
                        className="text-error text-xs hover:underline p-2 font-bold"
                      >
                        {locale === "ar" ? "حذف" : "Remove"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface-container border border-dashed border-outline-variant/30 rounded-xl p-6 text-center text-slate-500 text-sm">
                  No medical conditions listed. Add one to link medications.
                </div>
              )}
            </div>

            <div className="border-t border-outline-variant/10 pt-6">
              <h2 className="font-headline-md text-headline-md font-semibold text-on-surface mb-4">{t("patient.records.secureVault")}</h2>
              {uploadedDocs.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {uploadedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-surface-container border border-outline-variant/10 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 group hover:border-primary/20 transition-all"
                    >
                      <div className="w-14 h-14 rounded-lg bg-surface-container-highest flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-3xl">description</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-headline-md text-headline-md text-on-surface mb-1 group-hover:text-primary transition-colors">
                          {doc.title}
                        </h3>
                        <div className="flex items-center gap-3 text-on-surface-variant font-label-sm text-label-sm">
                          <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">{doc.category}</span>
                          <span>•</span>
                          <span>{doc.date}</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-outline font-label-sm text-label-sm bg-surface-container-low w-fit px-3 py-1.5 rounded-lg border border-outline-variant/30">
                          <span className="material-symbols-outlined text-sm">
                            {doc.type === "pdf" ? "picture_as_pdf" : "image"}
                          </span>
                          <span>{doc.fileName} ({doc.fileSize})</span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                        <button
                          onClick={() => alert(`Opening simulated viewer for ${doc.fileName}...`)}
                          className="flex-1 sm:flex-none border border-outline-variant hover:bg-surface-variant/20 px-4 py-2 rounded-lg font-label-sm text-label-sm transition-colors active:scale-95"
                        >
                          {locale === "ar" ? "عرض" : "View"}
                        </button>
                        <button
                          onClick={() => handleDeleteDocClick(doc.id)}
                          className="flex-1 sm:flex-none text-error hover:bg-error-container/10 px-4 py-2 rounded-lg font-label-sm text-label-sm transition-colors active:scale-95"
                        >
                          {locale === "ar" ? "حذف" : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface-container border border-dashed border-outline-variant/30 rounded-xl p-8 text-center text-slate-500 text-sm">
                  Secure vault is empty. Upload medical documents or reports above.
                </div>
              )}
            </div>
          </div>
        </div>
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
        <Link className="flex flex-col items-center justify-center text-primary px-3 py-1 scale-100 font-bold" href="/profile">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="font-label-sm text-label-sm">{t("patient.nav.profile")}</span>
        </Link>
      </nav>
    </div>
  );
}
