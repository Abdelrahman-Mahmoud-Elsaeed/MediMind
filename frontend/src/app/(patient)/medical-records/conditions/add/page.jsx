"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useAddConditionMutation } from "@/modules/patient/hooks/usePatientQueries";
import { Card, Button } from "@/shared/components/ui";
import { ArrowLeft, Save, Activity, AlertCircle } from "lucide-react";

export default function AddConditionPage() {
  const router = useRouter();
  const { locale } = useTranslation();
  const isAr = locale === "ar";

  const [diseaseName, setDiseaseName] = useState("");
  const [isChronic, setIsChronic] = useState(true);
  const [diagnosedDate, setDiagnosedDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const addConditionMutation = useAddConditionMutation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!diseaseName.trim()) return;

    setErrorMsg("");

    const payload = {
      diseaseName: diseaseName.trim(),
      isChronic,
      diagnosedDate: diagnosedDate ? new Date(diagnosedDate).toISOString() : undefined,
      notes: notes.trim(),
    };

    addConditionMutation.mutate(payload, {
      onSuccess: () => {
        alert(isAr ? "تمت إضافة الحالة الطبية بنجاح!" : "Medical condition added successfully!");
        router.push("/medical-records/conditions");
      },
      onError: (err) => {
        setErrorMsg(
          err?.response?.data?.message || (isAr ? "تعذر إضافة الحالة الطبية. يرجى المحاولة لاحقاً." : "Failed to add condition. Please try again.")
        );
      },
    });
  };

  return (
    <MainLayout activePath="/profile">
      <div className="max-w-[800px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/medical-records/conditions">
              <ArrowLeft className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">
              {isAr ? "إضافة حالة طبية جديدة" : "Add Medical Condition"}
            </h1>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">
              {isAr ? "سجل التشخيصات أو الأمراض المزمنة في ملفك الصحي" : "Log diagnoses or chronic conditions into your medical profile."}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 p-8 rounded-3xl shadow-xs space-y-6">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                {isAr ? "اسم الحالة / التشخيص الطبي" : "Condition / Disease Name"}
              </label>
              <input
                type="text"
                required
                value={diseaseName}
                onChange={(e) => setDiseaseName(e.target.value)}
                placeholder="e.g. Type 2 Diabetes, Asthma"
                className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {isAr ? "تاريخ التشخيص" : "Diagnosed Date"}
                </label>
                <input
                  type="date"
                  value={diagnosedDate}
                  onChange={(e) => setDiagnosedDate(e.target.value)}
                  className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {isAr ? "تصنيف الحالة" : "Condition Type"}
                </label>
                <select
                  value={isChronic ? "chronic" : "acute"}
                  onChange={(e) => setIsChronic(e.target.value === "chronic")}
                  className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
                >
                  <option value="chronic">{isAr ? "حالة مزمنة (Chronic)" : "Chronic Condition"}</option>
                  <option value="acute">{isAr ? "حالة حادة (Acute)" : "Acute Condition"}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                {isAr ? "ملاحظات وتوصيات الطبيب" : "Clinical Notes / Remarks"}
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add doctor recommendations or symptoms..."
                className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={addConditionMutation.isPending}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 transition-all h-auto text-base"
            >
              <Save className="w-5 h-5 mr-2" />
              {addConditionMutation.isPending ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ الحالة الطبية" : "Save Medical Condition")}
            </Button>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
