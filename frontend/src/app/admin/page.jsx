"use client";

import { useState, useEffect } from "react";
import { Logo, Button, Card, Badge, StatCard, Spinner, EmptyState } from "@/shared/components";
import { adminApi } from "@/shared/lib/api";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboard, setDashboard] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [engagement, setEngagement] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [users, setUsers] = useState({ users: [], pagination: {} });
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const dashRes = await adminApi.dashboard();
      setDashboard(dashRes.data);

      const growthRes = await adminApi.userGrowth();
      setGrowth(growthRes.data || []);

      const engRes = await adminApi.engagement();
      setEngagement(engRes.data);
    } catch (err) {
      console.error("Admin dashboard error:", err);
      setError("حدث خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }

  async function loadFinancials() {
    try {
      const res = await adminApi.financials();
      setFinancials(res.data);
    } catch (err) {
      if (err.status === 403) {
        setError("ليس لديك صلاحية لعرض البيانات المالية");
      } else {
        setError("حدث خطأ في تحميل البيانات المالية");
      }
    }
  }

  async function loadUsers() {
    try {
      const params = userRoleFilter ? { role: userRoleFilter } : {};
      const res = await adminApi.users(params);
      setUsers(res.data);
    } catch (err) {
      if (err.status === 403) {
        setError("ليس لديك صلاحية لإدارة المستخدمين");
      }
    }
  }

  async function loadHealth() {
    try {
      const res = await adminApi.systemHealth();
      setHealth(res.data);
    } catch (err) {
      console.error("Health error:", err);
    }
  }

  useEffect(() => {
    if (activeTab === "financials" && !financials) loadFinancials();
    if (activeTab === "users" && users.users.length === 0) loadUsers();
    if (activeTab === "users" && userRoleFilter) loadUsers();
    if (activeTab === "system" && !health) loadHealth();
  }, [activeTab, userRoleFilter]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">

      <div className="flex">

        {/* ===== Sidebar ===== */}
        <aside className="hidden md:block w-64 bg-surface border-l border-outline min-h-screen p-4 sticky top-0 h-screen overflow-y-auto">
          <div className="flex items-center gap-2 mb-8 pb-4 border-b border-outline">
            <Logo size="sm" />
            <div>
              <p className="font-bold">وفاء</p>
              <p className="text-xs text-on-surface-variant">Admin Dashboard</p>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { key: "overview", label: "الرئيسية", icon: "🏠" },
              { key: "engagement", label: "التفاعل", icon: "📊" },
              { key: "users", label: "المستخدمين", icon: "👥" },
              { key: "financials", label: "المالية", icon: "💰" },
              { key: "system", label: "حالة النظام", icon: "🔧" }
            ].map(item => (
              <button
                key={item.key}
                onClick={() => { setActiveTab(item.key); setError(""); }}
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

          <div className="mt-8 p-3 bg-warning-container rounded-lg">
            <p className="text-xs text-on-warning-container">
              👑 لوحة تحكم الأدمن — صلاحيات كاملة على المنصة
            </p>
          </div>
        </aside>

        {/* ===== Main Content ===== */}
        <main className="flex-1 p-4 md:p-8 max-w-full overflow-x-hidden">

          <header className="md:hidden bg-surface border-b border-outline p-4 mb-4 flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold">وفاء — Admin</span>
          </header>

          {/* Mobile Tabs */}
          <div className="md:hidden flex gap-2 mb-4 overflow-x-auto">
            {[
              { key: "overview", label: "🏠" },
              { key: "engagement", label: "📊" },
              { key: "users", label: "👥" },
              { key: "financials", label: "💰" },
              { key: "system", label: "🔧" }
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
            {activeTab === "overview" && "لوحة تحكم المنصة"}
            {activeTab === "engagement" && "مقاييس التفاعل"}
            {activeTab === "users" && "إدارة المستخدمين"}
            {activeTab === "financials" && "التقارير المالية"}
            {activeTab === "system" && "حالة النظام"}
          </h1>

          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* ===== Overview Tab ===== */}
          {activeTab === "overview" && dashboard && (
            <div className="space-y-6">

              {/* User Stats */}
              <div>
                <h3 className="font-bold mb-3">👥 المستخدمين</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="إجمالي الحسابات" value={dashboard.users.totalAccounts} icon="📋" />
                  <StatCard label="مرضى" value={dashboard.users.totalPatients} icon="🧓" color="success" />
                  <StatCard label="أهل" value={dashboard.users.totalCaregivers} icon="👨‍👩‍👧" color="info" />
                  <StatCard label="صيدليات" value={dashboard.users.totalPharmacies} icon="💊" color="warning" />
                  <StatCard label="دكاترة" value={dashboard.users.totalDoctors} icon="👨‍⚕️" color="info" />
                  <StatCard label="جدد (30 يوم)" value={dashboard.users.newAccounts30d} icon="📈" />
                  <StatCard label="اشتراكات نشطة" value={dashboard.subscriptions.active} icon="✅" color="success" />
                  <StatCard label="صيدليات تجريبية" value={dashboard.subscriptions.pilotPharmacies} icon="🌟" color="warning" />
                </div>
              </div>

              {/* Content Stats */}
              <div>
                <h3 className="font-bold mb-3">📊 المحتوى</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="أدوية نشطة" value={dashboard.content.totalMedications} icon="💊" />
                  <StatCard label="جرعات كلية" value={dashboard.content.totalDoseEvents} icon="📋" />
                  <StatCard label="روابط نشطة" value={dashboard.content.totalRelationships} icon="🔗" />
                  <StatCard label="إشعارات (30 يوم)" value={dashboard.notifications.sent30d} icon="🔔" />
                </div>
              </div>

              {/* Health Stats */}
              <Card accent={dashboard.health.avgAdherence >= 70 ? "success" : "warning"}>
                <h3 className="font-bold mb-3">💊 صحة المنصة</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-black text-primary">{dashboard.health.avgAdherence}%</p>
                    <p className="text-xs text-on-surface-variant">متوسط الالتزام (30 يوم)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-tertiary">{dashboard.health.dosesTaken30d}</p>
                    <p className="text-xs text-on-surface-variant">جرعات مأخودة</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{dashboard.health.dosesScheduled30d}</p>
                    <p className="text-xs text-on-surface-variant">جرعات مجدولة</p>
                  </div>
                </div>
              </Card>

              {/* User Growth Chart */}
              {growth.length > 0 && (
                <Card>
                  <h3 className="font-bold mb-4">📈 نمو المستخدمين (12 شهر)</h3>
                  <GrowthChart data={growth} />
                </Card>
              )}
            </div>
          )}

          {/* ===== Engagement Tab ===== */}
          {activeTab === "engagement" && engagement && (
            <div className="space-y-6">

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="DAU (اليوم)" value={engagement.activeUsers.daily} icon="📅" color="primary" />
                <StatCard label="WAU (أسبوع)" value={engagement.activeUsers.weekly} icon="📆" color="info" />
                <StatCard label="MAU (شهر)" value={engagement.activeUsers.monthly} icon="🗓️" color="success" />
                <StatCard label="Stickiness" value={`${engagement.stickiness}%`} icon="🔥" color="warning" />
              </div>

              <Card>
                <h3 className="font-bold mb-3">📊 نسبة التفاعل</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>المرضى النشطين من إجمالي المسجلين</span>
                      <span className="font-bold text-primary">{engagement.engagementRate}%</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-3 overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${engagement.engagementRate}%` }} />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant mt-3">
                  DAU/MAU ratio: {engagement.stickiness}% — {engagement.stickiness >= 50 ? "ممتاز 🔥" : engagement.stickiness >= 25 ? "كويس 👍" : "محتاج تحسين ⚠️"}
                </p>
              </Card>

              {/* Adherence Distribution */}
              {engagement.adherenceDistribution && engagement.adherenceDistribution.length > 0 && (
                <Card>
                  <h3 className="font-bold mb-4">📊 توزيع التزام المرضى</h3>
                  <div className="space-y-3">
                    {engagement.adherenceDistribution.map((tier, i) => {
                      const labels = ['حرج (0-30%)', 'ضعيف (30-50%)', 'مقبول (50-70%)', 'كويس (70-90%)', 'ممتاز (90-100%)'];
                      const colors = ['bg-error', 'bg-error/70', 'bg-warning', 'bg-primary', 'bg-tertiary'];
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{labels[i]}</span>
                            <span className="font-bold">{tier.count} مريض</span>
                          </div>
                          <div className="w-full bg-surface-variant rounded-full h-3 overflow-hidden">
                            <div className={`h-full rounded-full ${colors[i]}`}
                              style={{ width: `${(tier.count / engagement.totalRegisteredPatients) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ===== Users Tab ===== */}
          {activeTab === "users" && (
            <div className="space-y-4">

              {/* Role Filter */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { val: "", label: "الكل" },
                  { val: "PATIENT", label: "مرضى" },
                  { val: "CAREGIVER", label: "أهل" },
                  { val: "PHARMACY", label: "صيدليات" },
                  { val: "DOCTOR", label: "دكاترة" },
                  { val: "ADMIN", label: "أدمن" }
                ].map(r => (
                  <button
                    key={r.val}
                    onClick={() => setUserRoleFilter(r.val)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      userRoleFilter === r.val
                        ? "bg-primary text-on-primary"
                        : "bg-surface border border-outline"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Users Table */}
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline text-on-surface-variant">
                        <th className="text-right py-2 px-2">الهاتف</th>
                        <th className="text-center py-2 px-2">الدور</th>
                        <th className="text-center py-2 px-2">الحالة</th>
                        <th className="text-center py-2 px-2">الاشتراك</th>
                        <th className="text-center py-2 px-2">آخر دخول</th>
                        <th className="text-center py-2 px-2">تاريخ التسجيل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.users?.map(u => (
                        <tr key={u._id} className="border-b border-outline">
                          <td className="py-3 px-2 font-mono text-xs" dir="ltr">{u.phone}</td>
                          <td className="text-center py-3 px-2">
                            <Badge variant="info">{roleLabels[u.role]}</Badge>
                          </td>
                          <td className="text-center py-3 px-2">
                            {u.isActive ? <Badge variant="success">نشط</Badge> : <Badge variant="error">معطل</Badge>}
                          </td>
                          <td className="text-center py-3 px-2">
                            <Badge variant={u.subscription?.status === 'active' ? 'success' : 'warning'}>
                              {u.subscription?.plan || 'none'}
                            </Badge>
                          </td>
                          <td className="text-center py-3 px-2 text-xs text-on-surface-variant">
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('ar-EG') : '—'}
                          </td>
                          <td className="text-center py-3 px-2 text-xs text-on-surface-variant">
                            {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {users.users?.length === 0 && (
                  <p className="text-center py-8 text-on-surface-variant">مفيش مستخدمين</p>
                )}

                {users.pagination && users.pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button size="sm" variant="ghost">السابق</Button>
                    <span className="px-4 py-2 text-sm">
                      صفحة {users.pagination.page} من {users.pagination.pages}
                    </span>
                    <Button size="sm" variant="ghost">التالي</Button>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ===== Financials Tab ===== */}
          {activeTab === "financials" && financials && (
            <div className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="الإيراد الشهري (MRR)" value={`${financials.mrr} ج`} icon="💰" color="success" />
                <StatCard label="الإيراد السنوي (ARR)" value={`${financials.arr} ج`} icon="📈" color="primary" />
                <StatCard label="صيدليات تجريبية" value={financials.pilotPharmacies} icon="🌟" color="warning" />
              </div>

              {/* Revenue Breakdown */}
              <Card>
                <h3 className="font-bold mb-4">📊 الإيراد حسب المصدر</h3>
                <div className="space-y-3">
                  {[
                    { label: '💊 صيدليات', amount: financials.revenueBySource.pharmacies, count: financials.activeSubscriptions.pharmacies, color: 'bg-warning' },
                    { label: '👨‍👩‍👧 أهل (Premium)', amount: financials.revenueBySource.caregivers, count: financials.activeSubscriptions.caregiversPremium, color: 'bg-info' },
                    { label: '👨‍⚕️ دكاترة', amount: financials.revenueBySource.doctors, count: financials.activeSubscriptions.doctors, color: 'bg-primary' }
                  ].map((src, i) => {
                    const total = financials.mrr || 1;
                    const pct = (src.amount / total) * 100;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{src.label} ({src.count} مشترك)</span>
                          <span className="font-bold">{src.amount} ج ({Math.round(pct)}%)</span>
                        </div>
                        <div className="w-full bg-surface-variant rounded-full h-3 overflow-hidden">
                          <div className={`h-full rounded-full ${src.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Subscription Breakdown */}
              <Card>
                <h3 className="font-bold mb-4">📋 توزيع الاشتراكات</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(financials.subscriptionBreakdown).map(([plan, count]) => (
                    <div key={plan} className="text-center p-3 bg-surface-variant rounded-lg">
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-on-surface-variant">{plan}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ===== System Health Tab ===== */}
          {activeTab === "system" && health && (
            <div className="space-y-6">

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Uptime" value={`${Math.round(health.uptime / 3600)}h`} icon="⏱️" color="success" />
                <StatCard label="Collections" value={health.database.collections} icon="📁" />
                <StatCard label="Indexes" value={health.database.indexes} icon="📇" />
                <StatCard label="Memory (MB)" value={Math.round(health.memory.heapUsed / 1024 / 1024)} icon="💾" color="warning" />
              </div>

              <Card>
                <h3 className="font-bold mb-3">🗄️ قاعدة البيانات</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-on-surface-variant">Data Size</p>
                    <p className="font-bold">{(health.database.dataSize / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant">Storage Size</p>
                    <p className="font-bold">{(health.database.storageSize / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant">Index Size</p>
                    <p className="font-bold">{(health.database.indexSize / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant">Collections</p>
                    <p className="font-bold">{health.database.collections}</p>
                  </div>
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <h3 className="font-bold mb-3">🔔 الإشعارات</h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(health.notifications).map(([status, count]) => (
                      <div key={status} className="flex justify-between">
                        <span className="text-on-surface-variant">{status}:</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <h3 className="font-bold mb-3">💊 الجرعات</h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(health.doses).map(([status, count]) => (
                      <div key={status} className="flex justify-between">
                        <span className="text-on-surface-variant">{status}:</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </main>
  );
}

// ===== Growth Chart Component =====
function GrowthChart({ data }) {
  if (!data || data.length === 0) return null;

  const maxTotal = Math.max(...data.map(d => d.cumulative.total), 1);
  const width = 700;
  const height = 250;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const y = padding + chartHeight - (d.cumulative.total / maxTotal) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) =>
    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
  ).join(' ');

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="min-w-full">
        {/* Grid */}
        {[0, 25, 50, 75, 100].map(val => {
          const y = padding + chartHeight - (val / 100) * chartHeight;
          return (
            <g key={val}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--outline)" strokeWidth="1" strokeDasharray="3,3" />
              <text x={padding - 5} y={y + 4} textAnchor="end" fontSize="10" fill="var(--on-surface-variant)">
                {Math.round((val / 100) * maxTotal)}
              </text>
            </g>
          );
        })}

        {/* Area */}
        <path
          d={`${pathD} L ${points[points.length-1].x} ${padding + chartHeight} L ${padding} ${padding + chartHeight} Z`}
          fill="var(--primary)" opacity="0.1"
        />

        {/* Line */}
        <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="2" />

        {/* Points + Labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="var(--primary)" />
            <text x={p.x} y={height - 10} textAnchor="middle" fontSize="9" fill="var(--on-surface-variant)">
              {p.month.split(' ')[0]}
            </text>
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fill="var(--primary)" fontWeight="bold">
              {p.cumulative.total}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

const roleLabels = {
  PATIENT: 'مريض',
  CAREGIVER: 'أهل',
  PHARMACY: 'صيدلية',
  DOCTOR: 'دكتور',
  ADMIN: 'أدمن'
};
