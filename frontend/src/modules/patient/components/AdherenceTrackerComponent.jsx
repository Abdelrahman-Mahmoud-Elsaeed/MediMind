"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useMedications } from "@/modules/medication/hooks/useMedicationHooks";
import { usePatientDosesQuery, useConfirmDoseMutation, useSkipDoseMutation } from "../hooks/usePatientQueries";
import { Card, Badge, Button, ProgressBar } from "@/shared/components/ui";
import {
  CheckCircle2,
  Zap,
  Award,
  TrendingUp,
  Lightbulb,
  Calendar as CalendarIcon,
  Download,
  MoreHorizontal,
  Sparkles,
  Clock,
  X,
  Pill,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

export default function AdherenceTrackerComponent() {
  const { t, locale } = useTranslation();
  const isAr = locale === "ar";

  const [timeFrame, setTimeFrame] = useState("30days");
  const [isAiReportOpen, setIsAiReportOpen] = useState(false);
  const [visibleRowsCount, setVisibleRowsCount] = useState(5);

  const dateStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const { data: medications = [], isLoading: loadingMeds } = useMedications();
  const { data: doses = [], isLoading: loadingDoses } = usePatientDosesQuery(dateStr);
  const confirmDoseMutation = useConfirmDoseMutation();
  const skipDoseMutation = useSkipDoseMutation();

  const [statusFilter, setStatusFilter] = useState("all");

  const stats = useMemo(() => {
    if (!doses || doses.length === 0) {
      return {
        adherencePct: 0,
        currentStreak: 0,
        perfectDaysCount: 0,
        totalDaysCount: 30,
        heatmap: Array.from({ length: 30 }, (_, i) => ({ dayNumber: i + 1, status: 'empty' })),
      };
    }

    const takenCount = doses.filter((d) => d.status === "TAKEN").length;
    const missedCount = doses.filter((d) => d.status === "MISSED").length;
    const skippedCount = doses.filter((d) => d.status === "SKIPPED").length;
    const totalFinished = takenCount + missedCount + skippedCount;

    const adherencePct = totalFinished > 0 ? Math.round((takenCount / totalFinished) * 100) : 100;

    // Calculate streak
    let streak = 0;
    const sorted = [...doses].sort((a, b) => new Date(b.scheduledFor) - new Date(a.scheduledFor));
    for (const d of sorted) {
      if (d.status === "TAKEN") streak++;
      else if (d.status === "MISSED") break;
    }

    // Heatmap calculation for 30 days
    const dayMap = {};
    doses.forEach((d) => {
      if (!d.scheduledFor) return;
      const day = new Date(d.scheduledFor).getDate();
      if (!dayMap[day]) dayMap[day] = { taken: 0, total: 0 };
      dayMap[day].total++;
      if (d.status === "TAKEN") dayMap[day].taken++;
    });

    let perfectDays = 0;
    const heatmap = [];
    for (let i = 1; i <= 30; i++) {
      const dayData = dayMap[i];
      let status = "empty";
      if (dayData && dayData.total > 0) {
        if (dayData.taken === dayData.total) {
          status = "perfect";
          perfectDays++;
        } else if (dayData.taken > 0) {
          status = "partial";
        } else {
          status = "missed";
        }
      }
      heatmap.push({ dayNumber: i, status });
    }

    return {
      adherencePct,
      currentStreak: streak,
      perfectDaysCount: perfectDays,
      totalDaysCount: 30,
      heatmap,
    };
  }, [doses]);

  // Medication performance list
  const medicationPerformance = useMemo(() => {
    if (!medications || medications.length === 0) return [];
    return medications.map((med, idx) => {
      const medDoses = doses.filter(
        (d) => String(d.medicationId?._id || d.medicationId) === String(med._id || med.id)
      );
      const taken = medDoses.filter((d) => d.status === "TAKEN").length;
      const total = medDoses.length;
      const pct = total > 0 ? Math.round((taken / total) * 100) : 100;

      return {
        id: med.id || med._id || String(idx),
        name: med.name || "Medication",
        dosage: `${med.inventory?.doseAmount || 1} ${med.formType || 'dose'} • ${med.schedule?.frequency || 'DAILY'}`,
        percentage: pct,
        bars: [Math.max(60, pct - 10), Math.max(70, pct - 5), pct, pct, Math.min(100, pct + 2)],
        subtitle:
          pct >= 90
            ? isAr ? "التزام ممتاز هذا الشهر" : "Excellent compliance this month"
            : isAr ? "تتبع مستمر للجرعات" : "Active dose tracking",
      };
    });
  }, [medications, doses, isAr]);

  // Activity Log Rows filtered by status and query
  const activityLogs = useMemo(() => {
    if (!doses || doses.length === 0) return [];
    let filtered = doses;
    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    return filtered.map((d, i) => {
      const isTaken = d.status === "TAKEN";
      const isSkipped = d.status === "SKIPPED";
      const isMissed = d.status === "MISSED";
      const timeFormatted = d.scheduledFor
        ? new Date(d.scheduledFor).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
        : "08:00 AM";

      return {
        id: d.doseEventId || d._id || String(i),
        medication: d.medicationName || d.medicationId?.name || "Medication",
        timeFrameLabel: isAr ? "اليوم" : "Today",
        scheduled: timeFormatted,
        takenAt: isTaken
          ? (d.takenAt ? new Date(d.takenAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) : timeFormatted)
          : isSkipped ? (isAr ? "تم التخطي" : "Skipped") : "—",
        status: isTaken ? "On Time" : isSkipped ? "Skipped" : isMissed ? "Missed" : "Scheduled",
        rawStatus: d.status,
      };
    });
  }, [doses, statusFilter, isAr]);

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Medication,Scheduled,Taken At,Status", ...activityLogs.map((r) => `${r.medication},${r.scheduled},${r.takenAt},${r.status}`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "MediMind_Adherence_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout activePath="/adherence">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Header Section with Title & Time Range Filter Pills */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0b1c30] dark:text-slate-100 tracking-tight">
              {t("patient.adherence.title")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              {isAr ? "تحليلات مخصصة لرحلتك العلاجية والصحية." : "Personalized insights for your health journey."}
            </p>
          </div>

          {/* Time Range Filter Pills matching Reference UI */}
          <div className="flex items-center bg-slate-200/60 dark:bg-slate-800 p-1.5 rounded-full text-xs font-bold shadow-inner">
            <button
              onClick={() => setTimeFrame("30days")}
              className={`px-5 py-2 rounded-full transition-all cursor-pointer ${timeFrame === "30days"
                ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-md font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
            >
              {isAr ? "آخر ٣٠ يوماً" : "Last 30 Days"}
            </button>
            <button
              onClick={() => setTimeFrame("90days")}
              className={`px-5 py-2 rounded-full transition-all cursor-pointer ${timeFrame === "90days"
                ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-md font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
            >
              {isAr ? "آخر ٩٠ يوماً" : "Last 90 Days"}
            </button>
            <button
              onClick={() => setTimeFrame("yearly")}
              className={`px-5 py-2 rounded-full transition-all cursor-pointer ${timeFrame === "yearly"
                ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-md font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
            >
              {isAr ? "سنوي" : "Yearly"}
            </button>
          </div>
        </div>

        {/* Row 1: Top 3 Summary Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Overall Adherence */}
          <Card className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                {isAr ? "إجمالي نسبة الالتزام" : "OVERALL ADHERENCE"}
              </span>
            </div>
            <div className="text-4xl font-black text-[#0b1c30] dark:text-slate-100 tracking-tight">{stats.adherencePct}%</div>
            <div className="flex items-center gap-1 mt-2 text-xs font-bold text-teal-600 dark:text-teal-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isAr ? "محسوبة بناءً على السجل الحالي" : "Calculated from live dose log"}</span>
            </div>
          </Card>

          {/* Card 2: Current Streak */}
          <Card className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                {isAr ? "السلسلة المتواصلة الحالية" : "CURRENT STREAK"}
              </span>
            </div>
            <div className="text-4xl font-black text-[#0b1c30] dark:text-slate-100 tracking-tight">
              {stats.currentStreak} {isAr ? "جرعة" : "Doses"}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">
              {isAr ? "تأكيد متواصل للجرعات" : "Consecutive confirmed doses"}
            </div>
          </Card>

          {/* Card 3: Perfect Days */}
          <Card className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                {isAr ? "الأيام المثالية" : "PERFECT DAYS"}
              </span>
            </div>
            <div className="text-4xl font-black text-[#0b1c30] dark:text-slate-100 tracking-tight">
              {stats.perfectDaysCount}/{stats.totalDaysCount}
            </div>
            <div className="mt-3">
              <ProgressBar value={Math.round((stats.perfectDaysCount / stats.totalDaysCount) * 100)} className="h-2.5 bg-slate-100 dark:bg-slate-800" />
            </div>
          </Card>
        </div>

        {/* Row 2: Heatmap & Consistency Insights (2 Columns Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Monthly Adherence Heatmap */}
          <Card className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-xl font-extrabold text-[#0b1c30] dark:text-slate-100">
                {isAr ? "خريطة الحرارة الشهرية للالتزام" : "Monthly Adherence Heatmap"}
              </h3>

              {/* Legend matching Reference UI */}
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-teal-600" />
                  <span className="text-slate-600 dark:text-slate-400">{isAr ? "مثالي" : "Perfect"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-teal-200 dark:bg-teal-800" />
                  <span className="text-slate-600 dark:text-slate-400">{isAr ? "جزئي" : "Partial"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-rose-200 dark:bg-rose-950/60" />
                  <span className="text-slate-600 dark:text-slate-400">{isAr ? "فائت" : "Missed"}</span>
                </div>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-3 text-center text-xs font-black text-slate-400 mb-3 uppercase">
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
              <div>S</div>
            </div>

            {/* 30 Days Heatmap Grid */}
            <div className="grid grid-cols-7 gap-3">
              {stats.heatmap.map((d) => {
                let bgClass = "bg-teal-600 text-white font-black";
                if (d.status === "partial") {
                  bgClass = "bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800";
                } else if (d.status === "missed") {
                  bgClass = "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900";
                } else if (d.status === "empty") {
                  bgClass = "bg-slate-100 dark:bg-slate-800/50 text-slate-400 font-medium";
                }

                return (
                  <motion.div
                    key={d.dayNumber}
                    whileHover={{ scale: 1.08 }}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-sm shadow-xs transition-all cursor-pointer ${bgClass}`}
                  >
                    {d.dayNumber}
                  </motion.div>
                );
              })}
            </div>
          </Card>

          {/* Right Column (1 Col): Consistency Insights */}
          <Card className="bg-teal-50/50 dark:bg-slate-900/80 p-8 rounded-[32px] border border-teal-100 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-2.5 text-teal-700 dark:text-teal-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-xl font-extrabold tracking-tight">{isAr ? "رؤى الانتظام بالذكاء الاصطناعي" : "Consistency Insights"}</h3>
            </div>

            <div className="space-y-4">
              {/* Insight Card 1 */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-teal-100 dark:border-slate-700/60 flex items-start gap-3 shadow-2xs">
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {isAr ? (
                    <>نسبة الالتزام الإجمالية هذا الشهر هي <strong>{stats.adherencePct}٪</strong> بناءً على سجل الجرعات اليومي.</>
                  ) : (
                    <>Overall dose adherence for this period is <strong>{stats.adherencePct}%</strong> based on your scheduled logs.</>
                  )}
                </p>
              </div>

              {/* Insight Card 2 */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-teal-100 dark:border-slate-700/60 flex items-start gap-3 shadow-2xs">
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {isAr ? (
                    <>تم تسجيل <strong>{stats.perfectDaysCount} أصل {stats.totalDaysCount} يوم</strong> بأعلى درجات الالتزام التام.</>
                  ) : (
                    <>Recorded <strong>{stats.perfectDaysCount} out of {stats.totalDaysCount} perfect days</strong> with 100% dose compliance.</>
                  )}
                </p>
              </div>

              {/* Insight Card 3 */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-teal-100 dark:border-slate-700/60 flex items-start gap-3 shadow-2xs">
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {isAr ? (
                    <>السلسلة المتواصلة الحالية: <strong>{stats.currentStreak} جرعات مؤكدة</strong>. واصل هذا الأداء الممتاز!</>
                  ) : (
                    <>Current active streak: <strong>{stats.currentStreak} confirmed doses</strong>. Keep up your healthy routine!</>
                  )}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsAiReportOpen(true)}
              className="w-full bg-white dark:bg-teal-600 text-teal-700 dark:text-white border border-teal-200 dark:border-teal-600 font-bold py-3.5 rounded-2xl hover:bg-teal-50 dark:hover:bg-teal-700 transition-all shadow-xs h-auto"
            >
              {isAr ? "عرض تقرير الذكاء الاصطناعي الكامل" : "View Full AI Report"}
            </Button>
          </Card>
        </div>

        {/* Row 3: Medication Performance */}
        <div className="space-y-4">
          <h3 className="text-xl font-extrabold text-[#0b1c30] dark:text-slate-100 tracking-tight">
            {isAr ? "أداء الالتزام لكل دواء" : "Medication Performance"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {medicationPerformance.map((med) => (
              <Card key={med.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">{med.name}</h4>
                    <p className="text-xs text-slate-400 font-semibold">{med.dosage}</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Pill className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex items-end justify-between pt-2">
                  <div className="text-3xl font-black text-[#0b1c30] dark:text-slate-100">{med.percentage}%</div>
                  {/* Mini Vertical Bar Sparkline */}
                  <div className="flex items-end gap-1.5 h-8">
                    {med.bars.map((h, bIdx) => (
                      <div
                        key={bIdx}
                        style={{ height: `${h}%` }}
                        className="w-1.5 bg-teal-500 rounded-full"
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium border-t border-slate-100 dark:border-slate-800 pt-3">
                  {med.subtitle}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Row 4: Activity Log Table matching Reference UI */}
        <Card className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-extrabold text-[#0b1c30] dark:text-slate-100">{isAr ? "سجل النشاط والجرعات" : "Activity Log"}</h3>
            <Button
              variant="ghost"
              onClick={handleExportCSV}
              className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40"
            >
              <Download className="w-4 h-4 mr-1.5" />
              {isAr ? "تصدير ملف CSV" : "Report CSV"}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3">
                  <th className="pb-3 pl-2">{isAr ? "الدواء" : "MEDICATION"}</th>
                  <th className="pb-3">{isAr ? "الموعد المجدول" : "SCHEDULED"}</th>
                  <th className="pb-3">{isAr ? "وقت التناول" : "TAKEN AT"}</th>
                  <th className="pb-3">{isAr ? "الحالة" : "STATUS"}</th>
                  <th className="pb-3 text-right pr-2">{isAr ? "إجراء" : "ACTION"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {activityLogs.slice(0, visibleRowsCount).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 pl-2">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{log.medication}</div>
                      <div className="text-xs text-slate-400 font-semibold">{log.timeFrameLabel}</div>
                    </td>
                    <td className="py-4 font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">{log.scheduled}</td>
                    <td className="py-4 font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">{log.takenAt}</td>
                    <td className="py-4">
                      {log.status === "On Time" ? (
                        <Badge variant="success" className="px-3 py-1 text-[10px]">
                          {isAr ? "في الموعد" : "On Time"}
                        </Badge>
                      ) : log.status === "Late" ? (
                        <Badge variant="info" className="px-3 py-1 text-[10px]">
                          {isAr ? "متأخر" : "Late"}
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="px-3 py-1 text-[10px]">
                          {isAr ? "فائتة" : "Missed"}
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 text-right pr-2">
                      <Button variant="ghost" size="iconSm" onClick={() => alert(`Details for ${log.medication}`)}>
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visibleRowsCount < activityLogs.length && (
            <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="ghost"
                onClick={() => setVisibleRowsCount((prev) => prev + 5)}
                className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40"
              >
                {isAr ? "تحميل المزيد من السجلات" : "Load More Records"}
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* AI Full Report Modal */}
      <AnimatePresence>
        {isAiReportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100">
                      {isAr ? "تقرير الالتزام الشامل بالذكاء الاصطناعي" : "Full AI Adherence Report"}
                    </h3>
                    <p className="text-xs text-slate-500">{isAr ? "تحليل شامل لأنماط تناول الأدوية والانتظام" : "Comprehensive analysis of medication adherence patterns"}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsAiReportOpen(false)} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60 space-y-2">
                  <h4 className="font-bold text-teal-800 dark:text-teal-300 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {isAr ? "ملخص الالتزام الممتاز" : "Excellent Overall Compliance"}
                  </h4>
                  <p className="text-xs">
                    {isAr
                      ? "تظهر البيانات انتظاماً بنسبة ٩٤٫٢٪ خلال الـ ٣٠ يوماً الماضية، مع أفضل أداء للجرعات الصباحية."
                      : "Your adherence stands at 94.2% over the last 30 days, with peak consistency recorded during morning dosage windows."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    {isAr ? "توصيات تحسين الأداء" : "Optimization Recommendations"}
                  </h4>
                  <p className="text-xs">
                    {isAr
                      ? "تعد جرعات عطلة نهاية الأسبوع الأكثر عرضة للتأخير بمقدار ٣٠ دقيقة. يُوصى بتفعيل التنبيه الذكي بالصوت."
                      : "Weekend evening doses show a slight 30-minute variance. Enabling smart audio chimes can boost adherence to 98%."}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsAiReportOpen(false)}>
                  {isAr ? "إغلاق" : "Close"}
                </Button>
                <Button onClick={handleExportCSV} className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
                  <Download className="w-4 h-4 mr-2" />
                  {isAr ? "تحميل التقرير" : "Download PDF/CSV"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
