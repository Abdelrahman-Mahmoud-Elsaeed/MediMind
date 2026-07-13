"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo, Button, Card, Badge, StatCard, BottomNav, EmptyState, Spinner } from "@/shared/components";
import { medicationsApi, dosesApi, authApi } from "@/shared/lib/api";
import { useSocket } from "@/shared/hooks/useSocket";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [medications, setMedications] = useState([]);
  const [todayDoses, setTodayDoses] = useState([]);
  const [adherence, setAdherence] = useState(null);
  const [refillNeeded, setRefillNeeded] = useState([]);
  const [user, setUser] = useState({ firstName: "مستخدم" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { connected: socketConnected, notifications: rtNotifications } = useSocket();

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (rtNotifications.length > 0 && medications.length > 0) {
      const lastNotif = rtNotifications[0];
      if (lastNotif.type === 'DOSE_REMINDER' || lastNotif.type === 'CAREGIVER_ALERT') {
        setTimeout(() => loadDashboard(), 2000);
      }
    }
  }, [rtNotifications]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const meRes = await authApi.getMe().catch(() => null);
      if (meRes?.data) setUser(meRes.data);

      const medsRes = await medicationsApi.list();
      const meds = medsRes.data || [];
      setMedications(meds);

      if (meds.length > 0) {
        const patientId = meds[0].patientId;
        const dosesRes = await dosesApi.dailySchedule(patientId);
        setTodayDoses(dosesRes.data || []);
        const adherenceRes = await dosesApi.adherence(patientId, 7);
        setAdherence(adherenceRes.data);
        const refillRes = await medicationsApi.refillNeeded(patientId);
        setRefillNeeded(refillRes.data || []);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("حدث خطأ في تحميل البيانات. حاول مرة ثانية.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDose(doseId) {
    try {
      await dosesApi.confirm(doseId);
      const dosesRes = await dosesApi.dailySchedule(medications[0]?.patientId);
      setTodayDoses(dosesRes.data || []);
    } catch (err) {
      alert("حدث خطأ في تأكيد الجرعة");
    }
  }

  async function handleSkipDose(doseId) {
    try {
      await dosesApi.skip(doseId);
      const dosesRes = await dosesApi.dailySchedule(medications[0]?.patientId);
      setTodayDoses(dosesRes.data || []);
    } catch (err) {
      alert("حدث خطأ");
    }
  }

  const todayTaken = todayDoses.filter(d => d.status === "TAKEN").length;
  const todayTotal = todayDoses.length;
  const todayProgress = todayTotal > 0 ? Math.round((todayTaken / todayTotal) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 18 ? "مساء الخير" : "مساء الخير";

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  }

  return (
    <div className="app-layout">
      {/* ===== Desktop Sidebar ===== */}
      <aside className="app-sidebar p-4">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-outline">
          <Logo size="sm" />
          <div>
            <p className="font-bold">وفاء</p>
            <p className="text-xs text-on-surface-variant">{user?.firstName || "مستخدم"}</p>
          </div>
        </div>
        <nav className="space-y-1">
          {[
            { label: "الرئيسية", icon: "🏠", href: "/dashboard", active: true },
            { label: "أدويتي", icon: "💊", href: "/medications" },
            { label: "التقارير", icon: "📊", href: "/reports" },
            { label: "AI Insights", icon: "🤖", href: "/ai-insights" },
            { label: "الإشعارات", icon: "🔔", href: "/notifications" },
            { label: "دعوة الأهل", icon: "👨‍👩‍👧", href: "/invite" },
            { label: "الإعدادات", icon: "⚙️", href: "/settings" }
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <div className={`nav-item ${item.active ? 'active' : ''}`}>
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {item.label === "الإشعارات" && rtNotifications.length > 0 && (
                  <span className="mr-auto bg-error text-on-error text-xs px-2 py-0.5 rounded-full">{rtNotifications.length}</span>
                )}
              </div>
            </Link>
          ))}
        </nav>
        <div className="mt-8 p-3 bg-primary-container rounded-xl">
          <p className="text-xs text-on-primary-container font-semibold mb-1">💡 نصيحة اليوم</p>
          <p className="text-xs text-on-primary-container">خد أدويتك في نفس الوقت كل يوم عشان تبنى روتين صحي</p>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <main className="app-main pb-20 lg:pb-0">
        {/* ===== Top Bar ===== */}
        <header className="bg-surface border-b border-outline sticky top-0 z-10 glass">
          <div className="max-w-6xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <Logo size="sm" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant hidden lg:block">{greeting} 👋</p>
                <p className="font-bold text-sm lg:text-base">{user?.firstName || "مستخدم"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${socketConnected ? 'bg-tertiary' : 'bg-on-surface-variant'}`}
                title={socketConnected ? 'متصل' : 'غير متصل'} />
              <Link href="/notifications">
                <button className="relative w-10 h-10 rounded-full bg-surface-variant hover:bg-primary-container flex items-center justify-center transition-colors">
                  🔔
                  {rtNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-on-error text-xs rounded-full flex items-center justify-center font-bold">
                      {rtNotifications.length}
                    </span>
                  )}
                </button>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-6">

          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* ===== Hero: Today's Progress ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Progress Card */}
            <Card className="lg:col-span-2 card-accent">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-on-surface-variant">أدوية اليوم</p>
                  <p className="text-3xl lg:text-4xl font-black mt-1">{todayTaken} <span className="text-lg text-on-surface-variant font-normal">من {todayTotal}</span></p>
                </div>
                <div className="relative w-20 h-20 lg:w-24 lg:h-24">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="50%" cy="50%" r="40" fill="none" stroke="var(--outline)" strokeWidth="8" />
                    <circle
                      cx="50%" cy="50%" r="40" fill="none" stroke="var(--primary)" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - todayProgress / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{todayProgress}%</span>
                  </div>
                </div>
              </div>
              {todayProgress === 100 ? (
                <div className="p-3 bg-tertiary-container text-on-tertiary-container rounded-lg text-sm text-center font-semibold">
                  🎉 أحسنت! أخدت كل أدويتك النهارده
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1 h-2 bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${todayProgress}%` }} />
                  </div>
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <StatCard
                label="التزام الأسبوع"
                value={`${adherence?.adherenceRate || 0}%`}
                icon="📊"
                color={(adherence?.adherenceRate || 0) >= 80 ? "success" : "warning"}
              />
              <StatCard
                label="أدوية نشطة"
                value={medications.length}
                icon="💊"
              />
            </div>
          </div>

          {/* ===== Refill Alert ===== */}
          {refillNeeded.length > 0 && (
            <Card className="card-warning">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="font-bold mb-1">فيه {refillNeeded.length} دواء هيخلص قريب</h3>
                  <p className="text-sm text-on-surface-variant mb-3">
                    {refillNeeded.map(m => m.name).join("، ")}
                  </p>
                  <Link href="/medications?filter=refill">
                    <Button size="sm" variant="secondary">تجديد الأدوية</Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* ===== Today's Schedule ===== */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">جدول النهارده</h2>
              <Link href="/medications/add">
                <Button size="sm" variant="ghost">+ إضافة دواء</Button>
              </Link>
            </div>

            {todayDoses.length === 0 ? (
              <EmptyState
                icon="💊"
                title="مفيش أدوية مجدولة النهارده"
                description="ابدأ بإضافة أدويتك عشان نساعدك تفتكرها"
                action={<Link href="/medications/add"><Button>إضافة أول دواء</Button></Link>}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {todayDoses.map((dose) => (
                  <DoseCard
                    key={dose._id}
                    dose={dose}
                    onConfirm={() => handleConfirmDose(dose._id)}
                    onSkip={() => handleSkipDose(dose._id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ===== Active Medications Grid ===== */}
          {medications.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4">أدويتي النشطة</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {medications.slice(0, 6).map(med => (
                  <Link key={med._id} href={`/medications/${med._id}`}>
                    <Card className="cursor-pointer hover:border-primary transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                          💊
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate">{med.name}</p>
                          <p className="text-xs text-on-surface-variant truncate">
                            {med.schedule?.timesOfDay?.join(" • ")}
                          </p>
                        </div>
                        {med.isRefillNeededSoon && <Badge variant="warning">قارب</Badge>}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ===== Mobile Bottom Nav ===== */}
      <BottomNav active="home" />
    </div>
  );
}

function DoseCard({ dose, onConfirm, onSkip }) {
  const isTaken = dose.status === "TAKEN";
  const isSkipped = dose.status === "SKIPPED";
  const isMissed = dose.status === "MISSED";
  const time = new Date(dose.scheduledFor).toLocaleTimeString("ar-EG", {
    hour: "2-digit", minute: "2-digit"
  });

  return (
    <Card className={isTaken ? "opacity-60" : ""}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 text-center w-16">
          <div className="text-base font-bold">{time}</div>
          <div className="text-xs text-on-surface-variant">⏰</div>
        </div>
        <div className="w-px h-12 bg-outline"></div>
        <div className="flex-1 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center text-xl">
            💊
          </div>
          <div className="min-w-0">
            <p className={`font-bold truncate ${isTaken ? "line-through" : ""}`}>
              {dose.medicationId?.name || "دواء"}
            </p>
            <p className="text-xs text-on-surface-variant">
              {dose.medicationId?.inventory?.doseAmount} {dose.medicationId?.inventory?.unit}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          {isTaken && <Badge variant="success">✅</Badge>}
          {isSkipped && <Badge variant="info">⏭</Badge>}
          {isMissed && <Badge variant="error">❌</Badge>}
          {dose.status === "PENDING" && (
            <div className="flex gap-1.5">
              <button
                onClick={onConfirm}
                className="w-10 h-10 bg-tertiary text-on-tertiary rounded-full hover:bg-tertiary/90 flex items-center justify-center text-lg font-bold transition-transform hover:scale-110"
                title="أخدت الدواء"
              >
                ✓
              </button>
              <button
                onClick={onSkip}
                className="w-10 h-10 bg-surface border border-outline rounded-full hover:border-error text-on-surface-variant flex items-center justify-center text-base transition-colors"
                title="تخطي"
              >
                ⏭
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
