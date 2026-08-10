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
import { Plus, Search, Edit3, Trash2, Activity, Calendar, FileText, AlertCircle } from "lucide-react";

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 p-6 sm:p-7 rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-4">
            <Link
              href="/medical-records"
              className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 flex items-center justify-center transition-all cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-xl rtl:rotate-180">arrow_back</span>
            </Link>
            <div>
              <span className="text-[11px] font-extrabold text-teal-700 dark:text-teal-400 uppercase tracking-widest block mb-0.5">
                {isAr ? "التشخيصات والحالات الطبية" : "DIAGNOSIS & PROFILE"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isAr ? "الحالات والتشخيصات الطبية" : "Medical Conditions"}
              </h1>
            </div>
          </div>

          <Button
            onClick={() => router.push("/medical-records/conditions/add")}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold px-5 py-3 rounded-2xl shadow-lg shadow-teal-500/20 transition-all text-xs sm:text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isAr ? "إضافة حالة جديدة" : "Add Condition"}
          </Button>
        </div>

        {/* Search & Filter Controls */}
        <Card className="p-4 rounded-[24px] bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحث عن حالة طبية..." : "Search conditions..."}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === "all"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {isAr ? "الكل" : "All"} ({conditions.length})
            </button>
            <button
              onClick={() => setFilterType("chronic")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === "chronic"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {isAr ? "مزمنة" : "Chronic"} ({conditions.filter((c) => c.isChronic).length})
            </button>
            <button
              onClick={() => setFilterType("acute")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === "acute"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
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
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{isAr ? "جاري تحميل الحالات الطبية..." : "Loading medical conditions..."}</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-bold text-center">
            {isAr ? "تعذر تحميل الحالات الطبية من السيرفر." : "Failed to load medical conditions."}
          </div>
        ) : filteredConditions.length === 0 ? (
          <Card className="p-12 text-center rounded-[28px] bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-xs">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {isAr ? "لا توجد حالات طبية مسجلة" : "No Medical Conditions Found"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
              {isAr ? "لم تقم بإضافة أي حالات أو تشخيصات طبية بعد. انقر فوق الزر أدناه لإضافة حالة." : "You have not logged any medical conditions yet. Click below to add a new condition."}
            </p>
            <Button
              onClick={() => router.push("/medical-records/conditions/add")}
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg shadow-teal-500/20 text-xs cursor-pointer"
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
                  className="p-6 rounded-[24px] bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/40 hover:shadow-md transition-all duration-200 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">{cond.diseaseName}</h3>
                          {dateFormatted && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {isAr ? `تاريخ التشخيص: ${dateFormatted}` : `Diagnosed: ${dateFormatted}`}
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-3 py-1 rounded-full border shrink-0 ${
                          cond.isChronic
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        }`}
                      >
                        {cond.isChronic ? (isAr ? "مزمن" : "Chronic") : (isAr ? "حاد" : "Acute")}
                      </span>
                    </div>

                    {cond.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 leading-relaxed font-medium">
                        {cond.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/medical-records/conditions/${condId}/edit`)}
                      className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                      {isAr ? "تعديل" : "Edit"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(condId, cond.diseaseName)}
                      className="text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
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
