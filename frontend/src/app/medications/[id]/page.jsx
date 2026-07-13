"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Logo, Button, Card, Badge, Spinner, EmptyState } from "@/shared/components";
import { medicationsApi, dosesApi } from "@/shared/lib/api";

export default function MedicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [medication, setMedication] = useState(null);
  const [adherence, setAdherence] = useState(null);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [refillAmount, setRefillAmount] = useState("");

  useEffect(() => {
    loadMedication();
  }, [id]);

  async function loadMedication() {
    setLoading(true);
    try {
      const res = await medicationsApi.get(id);
      setMedication(res.data);

      if (res.data.patientId) {
        const adhRes = await dosesApi.adherence(res.data.patientId, 30);
        setAdherence(adhRes.data);
      }
    } catch (err) {
      console.error("Load medication error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefill() {
    try {
      await medicationsApi.refill(id, parseInt(refillAmount));
      setShowRefillModal(false);
      setRefillAmount("");
      loadMedication();
    } catch (err) {
      alert("حدث خطأ في التجديد");
    }
  }

  async function handleDeactivate() {
    if (!confirm("متأكد إنك عاوز تشيل الدواء ده؟")) return;
    try {
      await medicationsApi.deactivate(id);
      router.push("/medications");
    } catch (err) {
      alert("حدث خطأ");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  }

  if (!medication) {
    return (
      <main className="min-h-screen bg-background p-4">
        <EmptyState
          icon="❌"
          title="الدواء غير موجود"
          action={<Link href="/medications"><Button>الرجوع للأدوية</Button></Link>}
        />
      </main>
    );
  }

  const adherenceRate = medication.stats?.adherenceRate || 0;
  const daysUntilRefill = medication.daysUntilRefill;
  const isExpired = medication.isExpired;

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
        <header className="bg-surface border-b border-outline sticky top-0 z-10 glass">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/dashboard">
              <button className="text-on-surface-variant flex items-center gap-1 hover:text-primary">
                <span className="icon-flip">→</span> الرئيسية
              </button>
            </Link>
            <h1 className="font-bold text-sm lg:text-base">تفاصيل الدواء</h1>
            <Link href="/medications">
              <button className="text-on-surface-variant flex items-center gap-1 hover:text-primary">
                أدويتي <span>←</span>
              </button>
            </Link>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* ===== Hero ===== */}
        <Card accent="primary">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary-container rounded-2xl flex items-center justify-center text-4xl">
              💊
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black">{medication.name}</h2>
              {medication.nameAr && <p className="text-on-surface-variant">{medication.nameAr}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="info">{medication.formType}</Badge>
                {medication.isChronic && <Badge variant="info">مزمن</Badge>}
                {isExpired && <Badge variant="error">منتهي الصلاحية</Badge>}
                {medication.isRefillNeededSoon && !isExpired && <Badge variant="warning">قارب يخلص</Badge>}
              </div>
            </div>
          </div>
        </Card>

        {/* ===== Schedule ===== */}
        <Card>
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>⏰</span> المواعيد
          </h3>
          <div className="flex flex-wrap gap-2">
            {medication.schedule?.timesOfDay?.map((time, i) => (
              <div key={i} className="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-mono font-bold">
                {time}
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm text-on-surface-variant">
            <p>التكرار: {medication.schedule?.frequency === 'DAILY' ? 'يومي' : 'أسبوعي'}</p>
            <p>عدد الجرعات: {medication.schedule?.dosesPerDay} في اليوم</p>
            {medication.instructions?.relationToMeals !== 'NONE' && (
              <p>علاقة بالطعام: {medication.instructions.relationToMeals}</p>
            )}
          </div>
        </Card>

        {/* ===== Inventory ===== */}
        <Card accent={medication.isRefillNeededSoon ? "warning" : null}>
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <span>📦</span> المخزون
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-black text-primary">{medication.inventory?.currentQuantity}</p>
              <p className="text-xs text-on-surface-variant">متبقي</p>
            </div>
            <div>
              <p className="text-2xl font-black">{medication.inventory?.doseAmount}</p>
              <p className="text-xs text-on-surface-variant">لكل جرعة</p>
            </div>
            <div>
              <p className={`text-2xl font-black ${daysUntilRefill <= 5 ? "text-warning" : ""}`}>
                {daysUntilRefill ?? "—"}
              </p>
              <p className="text-xs text-on-surface-variant">أيام متبقية</p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="w-full mt-4"
            onClick={() => setShowRefillModal(true)}
          >
            🔄 تجديد الدواء
          </Button>
        </Card>

        {/* ===== Adherence Stats ===== */}
        {medication.stats && (
          <Card>
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <span>📊</span> إحصائيات الالتزام
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="var(--outline)" strokeWidth="8" />
                  <circle
                    cx="48" cy="48" r="40" fill="none" stroke="var(--tertiary)" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - adherenceRate / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-tertiary">{adherenceRate}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">إجمالي الجرعات:</span>
                  <span className="font-bold">{medication.stats.totalDosesScheduled}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">المأخودة:</span>
                  <span className="font-bold text-tertiary">{medication.stats.totalDosesTaken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">🔥 أطول ستريك:</span>
                  <span className="font-bold">{medication.stats.currentStreak} يوم</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">آخر مرة:</span>
                  <span className="font-bold">
                    {medication.stats.lastDoseTakenAt
                      ? new Date(medication.stats.lastDoseTakenAt).toLocaleDateString("ar-EG")
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ===== Pharmacy ===== */}
        {medication.pharmacyId && (
          <Card>
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <span>🏪</span> الصيدلية
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-2xl">
                💊
              </div>
              <div className="flex-1">
                <p className="font-bold">{medication.pharmacyId.pharmacyName || "صيدلية"}</p>
                <p className="text-xs text-on-surface-variant">
                  {medication.pharmacyId.address?.governorate} • {medication.pharmacyId.address?.city}
                </p>
              </div>
              <Button size="sm" variant="ghost">اتصل</Button>
            </div>
          </Card>
        )}

        {/* ===== Instructions ===== */}
        {medication.instructions?.notes && (
          <Card accent="info">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <span>📝</span> ملاحظات
            </h3>
            <p className="text-on-surface-variant text-sm">{medication.instructions.notes}</p>
          </Card>
        )}

        {/* ===== Actions ===== */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button variant="ghost" onClick={() => router.push(`/medications/${id}/edit`)}>
            ✏️ تعديل
          </Button>
          <Button variant="danger" onClick={handleDeactivate}>
            🗑 إيقاف
          </Button>
        </div>
      </div>

      {/* ===== Refill Modal ===== */}
      {showRefillModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">🔄 تجديد الدواء</h3>
            <p className="text-on-surface-variant text-sm mb-4">
              أدخل الكمية الجديدة من الدواء بعد التجديد
            </p>
            <input
              type="number"
              value={refillAmount}
              onChange={e => setRefillAmount(e.target.value)}
              placeholder="مثال: 30"
              className="input mb-4"
              min="1"
              autoFocus
            />
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setShowRefillModal(false)}>
                إلغاء
              </Button>
              <Button
                className="flex-1"
                onClick={handleRefill}
                disabled={!refillAmount || refillAmount < 1}
              >
                تجديد
              </Button>
            </div>
          </Card>
        </div>
      )}
      </main>
    </div>
  );
}
