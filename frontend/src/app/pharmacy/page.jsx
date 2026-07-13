"use client";

import { useState, useEffect } from "react";
import { Logo, Button, Card, Badge, StatCard, Spinner, EmptyState } from "@/shared/components";
import { pharmacyApi } from "@/shared/lib/api";

export default function PharmacyDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState({ patients: [], pagination: {} });
  const [refillNeeded, setRefillNeeded] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [statsRes, refillRes] = await Promise.all([
        pharmacyApi.dashboard(),
        pharmacyApi.refillNeeded()
      ]);
      setStats(statsRes.data);
      setRefillNeeded(refillRes.data || []);
      await loadPatients();
    } catch (err) {
      console.error("Pharmacy dashboard error:", err);
      setError("حدث خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }

  async function loadPatients(searchValue = "") {
    try {
      const res = await pharmacyApi.patients({ search: searchValue, page: 1, limit: 20 });
      setPatients(res.data);
    } catch (err) {
      console.error("Load patients error:", err);
    }
  }

  async function loadAnalytics() {
    try {
      const res = await pharmacyApi.analytics();
      setAnalytics(res.data);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  }

  async function handleSendReminder(patientId, medicationId = null) {
    try {
      await pharmacyApi.sendRefillReminder(patientId, medicationId);
      alert("تم إرسال التذكير للمريض ✓");
    } catch (err) {
      alert("حدث خطأ في إرسال التذكير");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">

      {/* ===== Sidebar (Desktop) ===== */}
      <div className="flex">

        <aside className="hidden md:block w-64 bg-surface border-l border-outline min-h-screen p-4">
          <div className="flex items-center gap-2 mb-8 pb-4 border-b border-outline">
            <Logo size="sm" />
            <div>
              <p className="font-bold">وفاء</p>
              <p className="text-xs text-on-surface-variant">صيدلية النور</p>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { key: "overview", label: "الرئيسية", icon: "🏠" },
              { key: "patients", label: "المرضى", icon: "👥" },
              { key: "refill", label: "تحتاج تجديد", icon: "💊" },
              { key: "analytics", label: "التقارير", icon: "📊" },
              { key: "settings", label: "الإعدادات", icon: "⚙️" }
            ].map(item => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  if (item.key === "analytics") loadAnalytics();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
                  activeTab === item.key
                    ? "bg-primary text-on-primary font-bold"
                    : "text-on-surface-variant hover:bg-surface-variant"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 p-3 bg-primary-container rounded-lg">
            <p className="text-xs text-on-primary-container">
              {stats?.pilotActive ? "🌟 نسخة تجريبية" : `اشتراك: ${stats?.subscriptionStatus}`}
            </p>
          </div>
        </aside>

        {/* ===== Main Content ===== */}
        <main className="flex-1 p-4 md:p-8 max-w-full overflow-x-hidden">

          {/* Mobile Header */}
          <header className="md:hidden bg-surface border-b border-outline p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="font-bold">وفاء — صيدلية النور</span>
            </div>
          </header>

          {/* Mobile Tabs */}
          <div className="md:hidden flex gap-2 mb-4 overflow-x-auto">
            {[
              { key: "overview", label: "🏠" },
              { key: "patients", label: "👥" },
              { key: "refill", label: "💊" },
              { key: "analytics", label: "📊" }
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`p-3 rounded-lg ${activeTab === t.key ? "bg-primary" : "bg-surface border border-outline"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <h1 className="text-2xl font-black mb-6">
            {activeTab === "overview" && "لوحة التحكم"}
            {activeTab === "patients" && "المرضى"}
            {activeTab === "refill" && "أدوية تحتاج تجديد"}
            {activeTab === "analytics" && "التقارير الأسبوعية"}
          </h1>

          {/* ===== Overview Tab ===== */}
          {activeTab === "overview" && (
            <div className="space-y-6">

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  label="إجمالي المرضى"
                  value={stats?.totalPatients || 0}
                  icon="👥"
                />
                <StatCard
                  label="مرضى نشطين"
                  value={stats?.activePatients || 0}
                  icon="✅"
                  color="success"
                />
                <StatCard
                  label="تحتاج تجديد"
                  value={stats?.refillNeededCount || 0}
                  icon="⚠️"
                  color="warning"
                />
                <StatCard
                  label="إيراد متوقع"
                  value={`${stats?.estimatedRevenue || 0} ج`}
                  icon="💰"
                  color="info"
                />
              </div>

              {/* Refill Soon Alert */}
              {refillNeeded.length > 0 && (
                <Card accent="warning">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">⚠️</span>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">
                        في {refillNeeded.length} مريض يحتاجون تجديد دواء
                      </h3>
                      <p className="text-sm text-on-surface-variant mb-3">
                        ابعتلهم reminders دلوقتي عشان تزود مبيعاتك
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setActiveTab("refill")}
                      >
                        عرض القائمة ←
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Recent Activity */}
              <Card>
                <h3 className="font-bold mb-4">آخر الأنشطة</h3>
                <div className="space-y-3">
                  <ActivityItem
                    icon="👤"
                    text="انضمام مريض جديد: محمد أحمد"
                    time="منذ ساعة"
                  />
                  <ActivityItem
                    icon="💊"
                    text="تم تجديد دواء: Glucophage"
                    time="منذ 3 ساعات"
                  />
                  <ActivityItem
                    icon="✅"
                    text="مريض أخد دواء: Concor 5mg"
                    time="منذ 5 ساعات"
                  />
                  <ActivityItem
                    icon="🔔"
                    text="تم إرسال 5 reminders للمرضى"
                    time="أمس"
                  />
                </div>
              </Card>
            </div>
          )}

          {/* ===== Patients Tab ===== */}
          {activeTab === "patients" && (
            <div className="space-y-4">
              <input
                type="text"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  loadPatients(e.target.value);
                }}
                placeholder="🔍 ابحث بالاسم أو رقم الموبايل..."
                className="input"
              />

              {patients.patients?.length === 0 ? (
                <EmptyState
                  icon="👥"
                  title="مفيش مرضى"
                  description="لما ينضم مرضى لصيدليتك، هتلاقيهم هنا"
                />
              ) : (
                <div className="space-y-3">
                  {patients.patients?.map(patient => (
                    <Card key={patient._id}>
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-xl">
                          {patient.age > 50 ? "🧓" : "👤"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold">{patient.name}</p>
                              <p className="text-xs text-on-surface-variant">
                                {patient.age ? `${patient.age} سنة • ` : ""}📱 {patient.phone}
                              </p>
                            </div>
                            <Badge variant={patient.adherenceRate >= 80 ? "success" : "warning"}>
                              {patient.adherenceRate}% التزام
                            </Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-1 bg-surface-variant rounded">
                              💊 {patient.activeMedications} أدوية
                            </span>
                            {patient.refillNeededCount > 0 && (
                              <span className="px-2 py-1 bg-warning-container text-on-warning-container rounded">
                                ⚠️ {patient.refillNeededCount} تحتاج تجديد
                              </span>
                            )}
                          </div>

                          {patient.medications?.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-outline">
                              <p className="text-xs font-semibold mb-2">الأدوية:</p>
                              <div className="space-y-1">
                                {patient.medications.map(med => (
                                  <div key={med._id} className="flex items-center justify-between text-sm">
                                    <span>{med.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs ${med.isRefillNeededSoon ? "text-warning font-bold" : ""}`}>
                                        {med.currentQuantity} متبقي
                                      </span>
                                      {med.isRefillNeededSoon && (
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          onClick={() => handleSendReminder(patient._id, med._id)}
                                        >
                                          بعت reminder
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== Refill Needed Tab ===== */}
          {activeTab === "refill" && (
            <div className="space-y-3">
              {refillNeeded.length === 0 ? (
                <EmptyState
                  icon="✅"
                  title="كل الأدوية كويسة"
                  description="مفيش مرضى محتاجين تجديد حالياً"
                />
              ) : (
                refillNeeded.map((item, i) => (
                  <Card key={i} accent="warning">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-warning-container rounded-xl flex items-center justify-center text-2xl">
                        💊
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">{item.medicationName}</p>
                        <p className="text-sm text-on-surface-variant">
                          {item.patient?.name || "مريض"}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <span className="text-warning font-bold">
                            ⚠️ هيخلص خلال {item.daysUntilRefill} أيام
                          </span>
                          <span>📦 {item.currentQuantity} متبقي</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSendReminder(item.patient?.id, item.medicationId)}
                      >
                        🔔 ذكّر
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* ===== Analytics Tab ===== */}
          {activeTab === "analytics" && (
            <div className="space-y-4">
              {!analytics ? (
                <Button onClick={loadAnalytics} loading={loading}>تحميل التقارير</Button>
              ) : (
                <>
                  <Card>
                    <h3 className="font-bold mb-4">📊 تقرير الأسبوع</h3>
                    <p className="text-sm text-on-surface-variant mb-4">
                      من {analytics.week.start} إلى {analytics.week.end}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <StatCard
                        label="مرضى نشطين"
                        value={analytics.totalPatients}
                        icon="👥"
                      />
                      <StatCard
                        label="أدوية نشطة"
                        value={analytics.activeMedications}
                        icon="💊"
                      />
                      <StatCard
                        label="جرعات مأخودة"
                        value={analytics.dosesTaken}
                        icon="✅"
                        color="success"
                      />
                      <StatCard
                        label="نسبة الالتزام"
                        value={`${analytics.adherenceRate}%`}
                        icon="📊"
                      />
                    </div>
                  </Card>

                  <Card accent="info">
                    <h3 className="font-bold mb-3">💰 التوقعات المالية</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>تجديدات الأسبوع ده:</span>
                        <span className="font-bold">{analytics.refillsThisWeek}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>تجديدات متوقعة الأسبوع الجاي:</span>
                        <span className="font-bold text-warning">{analytics.refillNextWeek}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-outline">
                        <span className="font-bold">إيراد متوقع:</span>
                        <span className="font-bold text-tertiary text-lg">
                          {analytics.estimatedRevenueNextWeek} ج
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <h3 className="font-bold mb-3">📈 إحصائيات الجرعات</h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-2xl font-black text-tertiary">{analytics.dosesTaken}</p>
                        <p className="text-xs text-on-surface-variant">مأخودة ✅</p>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-error">{analytics.dosesMissed}</p>
                        <p className="text-xs text-on-surface-variant">فاتت ❌</p>
                      </div>
                      <div>
                        <p className="text-2xl font-black">{analytics.dosesScheduled}</p>
                        <p className="text-xs text-on-surface-variant">إجمالي 📊</p>
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </main>
  );
}

function ActivityItem({ icon, text, time }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-outline last:border-0">
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <p className="text-sm">{text}</p>
        <p className="text-xs text-on-surface-variant">{time}</p>
      </div>
    </div>
  );
}
