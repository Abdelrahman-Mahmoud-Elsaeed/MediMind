"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { useTranslation } from "@/shared/lib/i18nContext";
import {
  usePatientConditionsQuery,
  useDeleteConditionMutation
} from "@/modules/patient/hooks/usePatientQueries";
import { Card, Badge, Button } from "@/shared/components/ui";
import { ArrowLeft, Plus, Search, Edit3, Trash2, Activity, Calendar, FileText, AlertCircle } from "lucide-react";

export default function PatientConditionsPage() {
  const router = useRouter();
  const { locale } = useTranslation();
  const isAr = locale === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'chronic' | 'acute'

  const { data: conditions = [], isLoading, error } = usePatientConditionsQuery();
  const deleteConditionMutation = useDeleteConditionMutation();

  const handleDelete = (id, name) => {
    if (confirm(isAr ? `هل أنت تأكد من رغبتك في حذف الحالة الطبية "${name}"؟` : `Are you sure you want to delete condition "${name}"?`)) {
      deleteConditionMutation.mutate(id);
    }
  };

  const filteredConditions = useMemo(() => {
    return conditions.filter((c) => {
      const nameMatch = c.diseaseName?.toLowerCase().includes(searchQuery.toLowerCase()) || c.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      if (filterType === "chronic") return nameMatch && c.isChronic;
      if (filterType === "acute") return nameMatch && !c.isChronic;
      return nameMatch;
    });
  }, [conditions, searchQuery, filterType]);

  return (
    <MainLayout activePath="/profile">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full">
              <Link href="/medical-records">
                <ArrowLeft className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-on-surface">
                {isAr ? "الحالات والتشخيصات الطبية" : "Medical Conditions"}
              </h1>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                {isAr ? "إدارة ومتابعة حالتك الصحية وتاريخ التشخيص" : "Manage your diagnosed medical conditions and chronic health profile."}
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push("/medical-records/conditions/add")}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isAr ? "إضافة حالة جديدة" : "Add Condition"}
          </Button>
        </div>

        {/* Search & Filter Controls */}
        <Card className="p-4 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحث عن حالة طبية..." : "Search conditions..."}
              className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 text-on-surface"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === "all" ? "bg-teal-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {isAr ? "الكل" : "All"} ({conditions.length})
            </button>
            <button
              onClick={() => setFilterType("chronic")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === "chronic" ? "bg-teal-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {isAr ? "مزمنة" : "Chronic"} ({conditions.filter((c) => c.isChronic).length})
            </button>
            <button
              onClick={() => setFilterType("acute")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === "acute" ? "bg-teal-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {isAr ? "حادّة" : "Acute"} ({conditions.filter((c) => !c.isChronic).length})
            </button>
          </div>
        </Card>

        {/* Content List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
            <p className="text-sm text-on-surface-variant">{isAr ? "جاري تحميل الحالات الطبية..." : "Loading medical conditions..."}</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center">
            {isAr ? "تعذر تحميل الحالات الطبية من السيرفر." : "Failed to load medical conditions."}
          </div>
        ) : filteredConditions.length === 0 ? (
          <Card className="p-12 text-center rounded-3xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 space-y-4">
            <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-on-surface">
              {isAr ? "لا توجد حالات طبية مسجلة" : "No Medical Conditions Found"}
            </h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              {isAr ? "لم تقم بإضافة أي حالات أو تشخيصات طبية بعد. انقر فوق الزر أدناه لإضافة حالة." : "You have not logged any medical conditions yet. Click below to add a new condition."}
            </p>
            <Button
              onClick={() => router.push("/medical-records/conditions/add")}
              className="bg-teal-600 text-white font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isAr ? "إضافة حالة جديدة" : "Add Condition"}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredConditions.map((cond) => {
              const condId = cond._id || cond.conditionId;
              const dateFormatted = cond.diagnosedDate
                ? new Date(cond.diagnosedDate).toLocaleDateString(isAr ? "ar-EG" : "en-US", { year: "numeric", month: "short", day: "numeric" })
                : null;

              return (
                <Card
                  key={condId}
                  className="p-6 rounded-3xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 hover:border-teal-500/40 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-on-surface">{cond.diseaseName}</h3>
                          {dateFormatted && (
                            <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {isAr ? `تاريخ التشخيص: ${dateFormatted}` : `Diagnosed: ${dateFormatted}`}
                            </p>
                          )}
                        </div>
                      </div>

                      <Badge variant={cond.isChronic ? "destructive" : "secondary"}>
                        {cond.isChronic ? (isAr ? "مزمن" : "Chronic") : (isAr ? "حاد" : "Acute")}
                      </Badge>
                    </div>

                    {cond.notes && (
                      <p className="text-xs text-on-surface-variant bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 leading-relaxed">
                        {cond.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/medical-records/conditions/${condId}/edit`)}
                      className="text-xs text-slate-700 dark:text-slate-300"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                      {isAr ? "تعديل" : "Edit"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(condId, cond.diseaseName)}
                      className="text-xs text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      {isAr ? "حذف" : "Delete"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
