"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { useTranslation } from "@/shared/lib/i18nContext";
import {
  usePatientConditionsQuery,
  useUpdateConditionMutation,
  useDeleteConditionMutation
} from "@/modules/patient/hooks/usePatientQueries";
import { Card, Button } from "@/shared/components/ui";
import { ArrowLeft, Save, Trash2, Activity, AlertCircle } from "lucide-react";

export default function EditConditionPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const conditionId = unwrappedParams?.id;

  const { locale } = useTranslation();
  const isAr = locale === "ar";

  const { data: conditions = [], isLoading } = usePatientConditionsQuery();
  const updateConditionMutation = useUpdateConditionMutation();
  const deleteConditionMutation = useDeleteConditionMutation();

  const condition = conditions.find(
    (c) => String(c.id || c._id || c.conditionId) === String(conditionId)
  );

  const [diseaseName, setDiseaseName] = useState("");
  const [isChronic, setIsChronic] = useState(true);
  const [diagnosedDate, setDiagnosedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (condition) {
      setDiseaseName(condition.diseaseName || "");
      setIsChronic(Boolean(condition.isChronic));
      setDiagnosedDate(
        condition.diagnosedDate ? condition.diagnosedDate.split("T")[0] : ""
      );
      setNotes(condition.notes || "");
    }
  }, [condition]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!condition || !diseaseName.trim()) return;

    setErrorMsg("");

    const payload = {
      diseaseName: diseaseName.trim(),
      isChronic,
      diagnosedDate: diagnosedDate ? new Date(diagnosedDate).toISOString() : undefined,
      notes: notes.trim(),
    };

    updateConditionMutation.mutate(
      { conditionId: condition._id || condition.conditionId || condition.id, payload },
      {
        onSuccess: () => {
          alert(isAr ? "تم تحديث الحالة الطبية بنجاح!" : "Condition updated successfully!");
          router.push("/medical-records/conditions");
        },
        onError: (err) => {
          setErrorMsg(
            err?.response?.data?.message || (isAr ? "تعذر تحديث الحالة الطبية." : "Failed to update condition.")
          );
        },
      }
    );
  };

  const handleDelete = () => {
    if (!condition) return;
    if (confirm(isAr ? "هل أنت تأكد من رغبتك في حذف هذه الحالة الطبية؟" : "Are you sure you want to delete this condition?")) {
      deleteConditionMutation.mutate(condition._id || condition.conditionId || condition.id, {
        onSuccess: () => {
          router.push("/medical-records/conditions");
        },
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout activePath="/profile">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          <p className="text-sm text-on-surface-variant">{isAr ? "جاري تحميل تفاصيل الحالة..." : "Loading condition details..."}</p>
        </div>
      </MainLayout>
    );
  }

  if (!condition) {
    return (
      <MainLayout activePath="/profile">
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-on-surface">{isAr ? "لم يتم العثور على الحالة الطبية" : "Condition Not Found"}</h2>
          <Button onClick={() => router.push("/medical-records/conditions")} className="bg-teal-600 text-white">
            {isAr ? "العودة لقائمة الحالات" : "Return to Conditions"}
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout activePath="/profile">
      <div className="max-w-[800px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full">
              <Link href="/medical-records/conditions">
                <ArrowLeft className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-on-surface">
                {isAr ? `تعديل ${condition.diseaseName}` : `Edit ${condition.diseaseName}`}
              </h1>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                {isAr ? "تحديث التوصيات الطبية وتفاصيل التشخيص" : "Update medical recommendations and diagnosis details."}
              </p>
            </div>
          </div>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteConditionMutation.isPending}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isAr ? "حذف الحالة" : "Delete Condition"}
          </Button>
        </div>

        {/* Edit Form Card */}
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
                {isAr ? "اسم الحالة / التشخيص الطبي" : "Condition Name"}
              </label>
              <input
                type="text"
                required
                value={diseaseName}
                onChange={(e) => setDiseaseName(e.target.value)}
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
                className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" type="button" onClick={() => router.push("/medical-records/conditions")}>
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" disabled={updateConditionMutation.isPending} className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
                <Save className="w-4 h-4 mr-2" />
                {updateConditionMutation.isPending ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ التغييرات" : "Save Changes")}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
