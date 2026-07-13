"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo, Button, Card, Badge, BottomNav, EmptyState, Spinner, PageHeader } from "@/shared/components";
import { medicationsApi } from "@/shared/lib/api";

export default function MedicationsPage() {
  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => { loadMedications(); }, []);

  async function loadMedications() {
    setLoading(true);
    try {
      const res = await medicationsApi.list();
      setMedications(res.data || []);
    } catch (err) { setError("حدث خطأ في تحميل الأدوية"); }
    finally { setLoading(false); }
  }

  async function handleDeactivate(id) {
    if (!confirm("متأكد إنك عاوز تشيل الدواء ده؟")) return;
    try { await medicationsApi.deactivate(id); loadMedications(); }
    catch (err) { alert("حدث خطأ"); }
  }

  const filtered = medications.filter(med => {
    if (filter === "active") return med.isActive;
    if (filter === "refill") return med.isRefillNeededSoon;
    if (filter === "expired") return med.isExpired;
    return true;
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  }

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
            { label: "أدويتي", icon: "💊", href: "/medications", active: true },
            { label: "التقارير", icon: "📊", href: "/reports" },
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
        {/* Header */}
        <header className="bg-surface border-b border-outline sticky top-0 z-10 glass">
          <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="lg:hidden"><Logo size="sm" /></div>
              <h1 className="text-xl font-bold">أدويتي</h1>
            </div>
            <Link href="/medications/add">
              <Button size="sm">+ إضافة دواء</Button>
            </Link>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl mb-4">{error}</div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { key: "all", label: "الكل", count: medications.length },
              { key: "active", label: "نشطة", count: medications.filter(m => m.isActive).length },
              { key: "refill", label: "تحتاج تجديد", count: medications.filter(m => m.isRefillNeededSoon).length },
              { key: "expired", label: "منتهية", count: medications.filter(m => m.isExpired).length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  filter === tab.key
                    ? "bg-primary text-on-primary shadow-primary"
                    : "bg-surface text-on-surface-variant border border-outline hover:border-primary"
                }`}
              >
                {tab.label} {tab.count > 0 && <span className="opacity-70">({tab.count})</span>}
              </button>
            ))}
          </div>

          {/* Medications Grid */}
          {filtered.length === 0 ? (
            <EmptyState
              icon="💊"
              title="مفيش أدوية هنا"
              description="ابدأ بإضافة دواء جديد"
              action={<Link href="/medications/add"><Button>إضافة دواء</Button></Link>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(med => (
                <Link key={med._id} href={`/medications/${med._id}`}>
                  <Card className="cursor-pointer hover:border-primary hover:shadow-md transition-all">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        💊
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{med.name}</p>
                        <p className="text-xs text-on-surface-variant">
                          {med.formType} • {med.inventory?.doseAmount} {med.inventory?.unit}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {med.isExpired && <Badge variant="error">منتهي</Badge>}
                        {med.isRefillNeededSoon && !med.isExpired && <Badge variant="warning">قارب</Badge>}
                        {!med.isActive && <Badge variant="info">غير نشط</Badge>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-on-surface-variant border-t border-outline pt-3">
                      <span className="flex items-center gap-1">⏰ {med.schedule?.timesOfDay?.join(" • ")}</span>
                      <span className="flex items-center gap-1">📦 {med.inventory?.currentQuantity}</span>
                      {med.stats?.adherenceRate > 0 && (
                        <span className="flex items-center gap-1">📊 {med.stats.adherenceRate}%</span>
                      )}
                    </div>

                    {med.isRefillNeededSoon && (
                      <p className="text-xs text-warning mt-2 font-semibold">
                        ⚠️ هيخلص خلال {med.daysUntilRefill} أيام
                      </p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav active="meds" />
    </div>
  );
}
