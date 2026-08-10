"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useAddConditionMutation } from "@/modules/patient/hooks/usePatientQueries";
import { Card, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui";
import { showSuccess, showError } from "@/shared/components/ui/toast";
import { Plus, Save, Activity, AlertCircle } from "lucide-react";

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
        showSuccess(isAr ? "تمت إضافة الحالة الطبية بنجاح!" : "Medical condition added successfully!", isAr ? "تم بنجاح" : "Success");
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
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900/90 p-6 sm:p-7 rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <Link
            href="/medical-records/conditions"
            className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-xl rtl:rotate-180">arrow_back</span>
          </Link>
          <div>
            <span className="text-[11px] font-extrabold text-teal-700 dark:text-teal-400 uppercase tracking-widest block mb-0.5">
              {isAr ? "إضافة حالة طبية" : "NEW CONDITION RECORD"}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isAr ? "تسجيل حالة طبية جديدة" : "Add Medical Condition"}
            </h1>
          </div>
        </div>

        {/* Form Card */}
        <Card className="p-6 sm:p-8 rounded-[28px] bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {isAr ? "اسم الحالة / المرض" : "Condition Name"}
              </label>
              <input
                type="text"
                required
                value={diseaseName}
                onChange={(e) => setDiseaseName(e.target.value)}
                placeholder={isAr ? "مثال: السكري من النوع الثاني" : "e.g. Type 2 Diabetes"}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3.5 outline-none text-slate-900 dark:text-slate-100 font-medium text-sm placeholder:text-slate-400 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {isAr ? "تاريخ التشخيص" : "Diagnosed Date"}
                </label>
                <input
                  type="date"
                  value={diagnosedDate}
                  onChange={(e) => setDiagnosedDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3.5 outline-none text-slate-900 dark:text-slate-100 font-medium text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {isAr ? "نوع الحالة" : "Condition Type"}
                </label>
                <Select
                  value={isChronic ? "chronic" : "acute"}
                  onValueChange={(val) => setIsChronic(val === "chronic")}
                >
                  <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3.5 h-auto text-slate-900 dark:text-slate-100 font-medium text-sm transition-all">
                    <SelectValue placeholder={isAr ? "اختر نوع الحالة" : "Select condition type"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50">
                    <SelectItem value="chronic">{isAr ? "مزمنة (Chronic)" : "Chronic"}</SelectItem>
                    <SelectItem value="acute">{isAr ? "حادّة (Acute)" : "Acute"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {isAr ? "ملاحظات وتوجيهات الطبيب" : "Notes & Specialist Observations"}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder={isAr ? "اكتب أي تفاصيل إضافية عن الحالة والجرعات..." : "Add any extra details or specialist instructions..."}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3.5 outline-none text-slate-900 dark:text-slate-100 font-medium text-sm placeholder:text-slate-400 transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/medical-records/conditions")}
                className="px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={addConditionMutation.isPending}
                className="px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-teal-500/20 transition-all text-xs disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4 mr-2" />
                {addConditionMutation.isPending ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ الحالة" : "Save Condition")}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
