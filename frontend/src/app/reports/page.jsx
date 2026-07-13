"use client";

import { useState, useEffect } from "react";
import { Logo, Button, Card, Badge, StatCard, BottomNav, EmptyState, Spinner } from "@/shared/components";
import { dosesApi, medicationsApi, exportApi } from "@/shared/lib/api";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(7);
  const [adherence, setAdherence] = useState(null);
  const [medications, setMedications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => { loadReport(); }, [period]);

  async function loadReport() {
    setLoading(true);
    setError("");
    try {
      const medsRes = await medicationsApi.list();
      const meds = medsRes.data || [];
      setMedications(meds);
      if (meds.length > 0) {
        const patientId = meds[0].patientId;
        const adhRes = await dosesApi.adherence(patientId, period);
        setAdherence(adhRes.data);
      }
    } catch (err) {
      setError("حدث خطأ في تحميل التقارير");
    } finally { setLoading(false); }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  }

  const adherenceRate = adherence?.adherenceRate || 0;
  const dailyBreakdown = adherence?.dailyBreakdown || [];
  const maxDailyDoses = Math.max(...dailyBreakdown.map(d => d.total), 1);

  const medStats = medications.map(m => ({
    name: m.name,
    rate: m.stats?.adherenceRate || 0,
    total: m.stats?.totalDosesScheduled || 0,
    taken: m.stats?.totalDosesTaken || 0,
    streak: m.stats?.currentStreak || 0
  }));

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <aside className="app-sidebar p-4">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-outline">
          <Logo size="sm" />
          <p className="font-bold">وفاء</p>
        </div>
        <nav className="space-y-1">
          {[
            { label: "الرئيسية", icon: "🏠", href: "/dashboard" },
            { label: "أدويتي", icon: "💊", href: "/medications" },
            { label: "التقارير", icon: "📊", href: "/reports", active: true },
            { label: "AI Insights", icon: "🤖", href: "/ai-insights" },
            { label: "الإعدادات", icon: "⚙️", href: "/settings" }
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <div className={`nav-item ${item.active ? 'active' : ''}`}>
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="app-main pb-20 lg:pb-0">
        <header className="bg-surface border-b border-outline sticky top-0 z-10 glass">
          <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4 flex items-center gap-3">
            <div className="lg:hidden"><Logo size="sm" /></div>
            <h1 className="text-xl font-bold">التقارير</h1>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-6">
          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl">{error}</div>
          )}

          {/* Period Selector */}
          <div className="flex gap-2 justify-center">
            {[
              { val: 7, label: "أسبوع" },
              { val: 30, label: "شهر" },
              { val: 90, label: "3 شهور" }
            ].map(p => (
              <button
                key={p.val}
                onClick={() => setPeriod(p.val)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  period === p.val
                    ? "bg-primary text-on-primary shadow-primary"
                    : "bg-surface text-on-surface-variant border border-outline"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {adherence && (
            <>
              {/* Overall Adherence */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-1 flex flex-col items-center justify-center"
                  accent={adherenceRate >= 80 ? "success" : adherenceRate >= 50 ? "warning" : "danger"}>
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="50%" cy="50%" r="56" fill="none" stroke="var(--outline)" strokeWidth="10" />
                      <circle
                        cx="50%" cy="50%" r="56" fill="none"
                        stroke={adherenceRate >= 80 ? "var(--tertiary)" : adherenceRate >= 50 ? "var(--warning)" : "var(--error)"}
                        strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - adherenceRate / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black">{adherenceRate}%</span>
                      <span className="text-xs text-on-surface-variant">التزام</span>
                    </div>
                  </div>
                  <p className="text-sm text-center mt-4 font-semibold">
                    {adherenceRate >= 80 ? "🎉 ممتاز! أنت ملتزم جداً" :
                     adherenceRate >= 50 ? "👍 كويس، بس تقدر تحسّن" :
                     "⚠️ لازم تلتزم أكتر"}
                  </p>
                </Card>

                {/* Stats Grid */}
                <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard label="مأخودة" value={adherence.taken} icon="✅" color="success" />
                  <StatCard label="فاتت" value={adherence.missed} icon="❌" color="error" />
                  <StatCard label="متجاوزة" value={adherence.skipped} icon="⏭" color="info" />
                  <StatCard label="الإجمالي" value={adherence.total} icon="📊" />
                </div>
              </div>

              {/* Daily Chart */}
              {dailyBreakdown.length > 0 && (
                <Card>
                  <h3 className="font-bold mb-4">📈 الالتزام اليومي</h3>
                  <div className="flex items-end gap-1 h-48 mb-2">
                    {dailyBreakdown.map((day, i) => {
                      const takenHeight = day.total > 0 ? (day.taken / maxDailyDoses) * 100 : 0;
                      const missedHeight = day.total > 0 ? ((day.total - day.taken) / maxDailyDoses) * 100 : 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-on-background text-background px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                            {day.taken}/{day.total} ({day.rate}%)
                          </div>
                          <div className="w-full flex flex-col justify-end h-full">
                            {missedHeight > 0 && (
                              <div className="w-full bg-error rounded-t-sm" style={{ height: `${missedHeight}%` }} />
                            )}
                            <div className={`w-full bg-tertiary ${missedHeight > 0 ? "" : "rounded-t-sm"}`}
                              style={{ height: `${takenHeight}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>من {dailyBreakdown[0]?.date}</span>
                    <span>إلى {dailyBreakdown[dailyBreakdown.length - 1]?.date}</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-tertiary rounded" /> <span>مأخودة</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-error rounded" /> <span>فاتت</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Per-Medication Stats */}
              {medStats.length > 0 && (
                <Card>
                  <h3 className="font-bold mb-4">💊 التزام كل دواء</h3>
                  <div className="space-y-4">
                    {medStats.map((med, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold">{med.name}</span>
                          <span className={`text-sm font-bold ${
                            med.rate >= 80 ? "text-tertiary" : med.rate >= 50 ? "text-warning" : "text-error"
                          }`}>{med.rate}%</span>
                        </div>
                        <div className="w-full bg-surface-variant rounded-full h-2.5 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${
                            med.rate >= 80 ? "bg-tertiary" : med.rate >= 50 ? "bg-warning" : "bg-error"
                          }`} style={{ width: `${med.rate}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-on-surface-variant mt-1">
                          <span>{med.taken}/{med.total} جرعة</span>
                          {med.streak > 0 && <span>🔥 {med.streak} يوم</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Export */}
              <Card className="text-center">
                <p className="text-sm text-on-surface-variant mb-3">تقدر تنزل التقرير ده وتشاركه مع دكتورك</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <Button variant="ghost" size="sm" onClick={() => {
                    const patientId = medications[0]?.patientId;
                    if (patientId) window.open(exportApi.patientPDF(patientId, period), '_blank');
                  }}>📄 PDF</Button>
                  <Button variant="ghost" size="sm" onClick={async () => {
                    try {
                      const patientId = medications[0]?.patientId;
                      if (!patientId) return;
                      const blob = await exportApi.patientCSV(patientId, period);
                      const url = window.URL.createObjectURL(new Blob([blob]));
                      const a = document.createElement('a');
                      a.href = url; a.download = `wafa-report-${period}days.csv`; a.click();
                      window.URL.revokeObjectURL(url);
                    } catch (err) { alert('حدث خطأ'); }
                  }}>📊 Excel</Button>
                </div>
              </Card>
            </>
          )}
        </div>
      </main>

      <BottomNav active="reports" />
    </div>
  );
}

import Link from "next/link";
