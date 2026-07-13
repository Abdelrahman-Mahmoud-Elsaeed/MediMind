"use client";

import { useState, useEffect } from "react";
import { Logo, Button, Card, Badge, StatCard, Spinner, EmptyState } from "@/shared/components";
import { doctorApi } from "@/shared/lib/api";

export default function DoctorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboard, setDashboard] = useState(null);
  const [patients, setPatients] = useState([]);
  const [reportPreview, setReportPreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const dashRes = await doctorApi.dashboard();
      setDashboard(dashRes.data);

      const patientsRes = await doctorApi.patients({ sortBy: 'adherence' });
      setPatients(patientsRes.data || []);
    } catch (err) {
      console.error("Doctor dashboard error:", err);
      setError("حدث خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }

  async function loadReportPreview() {
    try {
      const res = await doctorApi.weeklyReportPreview();
      setReportPreview(res.data);
    } catch (err) {
      console.error("Report preview error:", err);
    }
  }

  async function toggleReportSetting() {
    try {
      const newSettings = { enabled: !dashboard.reportEnabled };
      await doctorApi.updateReportSettings(newSettings);
      loadDashboard();
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

  return (
    <main className="min-h-screen bg-background">

      {/* ===== Sidebar ===== */}
      <div className="flex">
        <aside className="hidden md:block w-64 bg-surface border-l border-outline min-h-screen p-4">
          <div className="flex items-center gap-2 mb-8 pb-4 border-b border-outline">
            <Logo size="sm" />
            <div>
              <p className="font-bold">وفاء</p>
              <p className="text-xs text-on-surface-variant">د. سعيد محمد</p>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { key: "overview", label: "الرئيسية", icon: "🏠" },
              { key: "patients", label: "المرضى", icon: "👥" },
              { key: "report", label: "تقرير WhatsApp", icon: "💬" },
              { key: "settings", label: "الإعدادات", icon: "⚙️" }
            ].map(item => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  if (item.key === "report" && !reportPreview) loadReportPreview();
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
        </aside>

        <main className="flex-1 p-4 md:p-8 max-w-full overflow-x-hidden">

          <header className="md:hidden bg-surface border-b border-outline p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="font-bold">وفاء — د. سعيد</span>
            </div>
          </header>

          <div className="md:hidden flex gap-2 mb-4 overflow-x-auto">
            {[
              { key: "overview", label: "🏠" },
              { key: "patients", label: "👥" },
              { key: "report", label: "💬" },
              { key: "settings", label: "⚙️" }
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
            {activeTab === "report" && "تقرير WhatsApp الأسبوعي"}
            {activeTab === "settings" && "الإعدادات"}
          </h1>

          {/* ===== Overview ===== */}
          {activeTab === "overview" && dashboard && (
            <div className="space-y-6">

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  label="إجمالي المرضى"
                  value={dashboard.totalPatients}
                  icon="👥"
                />
                <StatCard
                  label="متوسط الالتزام"
                  value={`${dashboard.averageAdherence}%`}
                  icon="📊"
                  color={dashboard.averageAdherence >= 80 ? "success" : "warning"}
                />
                <StatCard
                  label="ملتزمين"
                  value={dashboard.adherentPatients}
                  icon="✅"
                  color="success"
                />
                <StatCard
                  label="التزام ضعيف"
                  value={dashboard.lowAdherencePatients}
                  icon="⚠️"
                  color="error"
                />
              </div>

              {/* WhatsApp Report Status */}
              <Card accent="info">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">💬</span>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">تقرير WhatsApp الأسبوعي</h3>
                    <p className="text-sm text-on-surface-variant mb-3">
                      {dashboard.reportEnabled ? (
                        <>يوصلك كل يوم {dashboard.reportDay === 'friday' ? 'جمعة' : dashboard.reportDay} الساعة {dashboard.reportTime}</>
                      ) : (
                        <>التقارير متوقفة مؤقتاً</>
                      )}
                    </p>
                    <Button size="sm" variant="secondary" onClick={() => { setActiveTab('report'); loadReportPreview(); }}>
                      معاينة التقرير ←
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Top Low Adherence Patients */}
              {patients.length > 0 && (
                <Card>
                  <h3 className="font-bold mb-4">⚠️ مرضى بأقل التزام</h3>
                  <div className="space-y-3">
                    {patients
                      .filter(p => p.adherenceRate < 50)
                      .slice(0, 5)
                      .map(patient => (
                        <div key={patient._id} className="flex items-center justify-between py-2 border-b border-outline last:border-0">
                          <div>
                            <p className="font-semibold">{patient.name}</p>
                            <p className="text-xs text-on-surface-variant">
                              {patient.dosesMissed} جرعة فاتت • {patient.activeMedications} أدوية
                            </p>
                          </div>
                          <Badge variant={patient.adherenceRate >= 50 ? "success" : "error"}>
                            {patient.adherenceRate}%
                          </Badge>
                        </div>
                      ))}
                    {patients.filter(p => p.adherenceRate < 50).length === 0 && (
                      <p className="text-sm text-on-surface-variant text-center py-4">
                        ✅ كل مرضاك ملتزمين كويس!
                      </p>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ===== Patients ===== */}
          {activeTab === "patients" && (
            <div className="space-y-3">
              {patients.length === 0 ? (
                <EmptyState
                  icon="👥"
                  title="مفيش مرضى مرتبطين بيك"
                  description="لما مرضاك يربطوا حساباتهم بيك، هتلاقيهم هنا"
                />
              ) : (
                patients.map(patient => (
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
                          <Badge variant={
                            patient.adherenceRate >= 80 ? "success" :
                            patient.adherenceRate >= 50 ? "warning" : "error"
                          }>
                            {patient.adherenceRate}%
                          </Badge>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="px-2 py-1 bg-surface-variant rounded">
                            💊 {patient.activeMedications} أدوية
                          </span>
                          <span className="px-2 py-1 bg-tertiary-container text-on-tertiary-container rounded">
                            ✅ {patient.dosesTaken} مأخودة
                          </span>
                          <span className="px-2 py-1 bg-error-container text-on-error-container rounded">
                            ❌ {patient.dosesMissed} فاتت
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
                                  <span>{med.name} {med.isChronic && <span className="text-xs">(مزمن)</span>}</span>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs ${med.isRefillNeededSoon ? "text-warning font-bold" : ""}`}>
                                      {med.adherenceRate}%
                                    </span>
                                    {med.isRefillNeededSoon && <span>⚠️</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* ===== Weekly WhatsApp Report ===== */}
          {activeTab === "report" && (
            <div className="space-y-4">

              <Card accent="info">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">💬</span>
                  <div className="flex-1">
                    <h3 className="font-bold">تقرير WhatsApp الأسبوعي</h3>
                    <p className="text-sm text-on-surface-variant mb-3">
                      بيوصلك تقرير مختصر كل أسبوع بميعاد تختاره، فيه نسبة التزام مرضاك والمرضى اللي محتاجين اهتمام خاص
                    </p>
                    <Button
                      size="sm"
                      variant={dashboard.reportEnabled ? "danger" : "primary"}
                      onClick={toggleReportSetting}
                    >
                      {dashboard.reportEnabled ? "إيقاف التقارير" : "تفعيل التقارير"}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Report Preview (WhatsApp-style) */}
              {reportPreview ? (
                <Card>
                  <h3 className="font-bold mb-4">👁 معاينة التقرير الجاي</h3>

                  {/* WhatsApp Bubble */}
                  <div className="bg-[#ECE5DD] p-4 rounded-lg">
                    <div className="bg-[#DCF8C6] rounded-lg p-3 max-w-md mr-auto shadow-sm">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-on-background">
                        {reportPreview.message}
                      </pre>
                      <div className="text-xs text-on-surface-variant text-left mt-1">
                        {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })} ✓✓
                      </div>
                    </div>
                  </div>

                  {/* Report Data Summary */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard
                      label="إجمالي المرضى"
                      value={reportPreview.data.totalPatients}
                      icon="👥"
                    />
                    <StatCard
                      label="ملتزمين"
                      value={reportPreview.data.adherentPatients}
                      icon="✅"
                      color="success"
                    />
                    <StatCard
                      label="التزام ضعيف"
                      value={reportPreview.data.lowAdherencePatients.length}
                      icon="⚠️"
                      color="error"
                    />
                    <StatCard
                      label="هيخلصوا دواء"
                      value={reportPreview.data.refillSoonPatients.length}
                      icon="💊"
                      color="warning"
                    />
                  </div>

                  {reportPreview.nextReportDate && (
                    <div className="mt-4 p-3 bg-info-container text-on-info-container rounded-lg text-sm text-center">
                      📅 التقرير الجاي هيتبعت:{" "}
                      <strong>
                        {new Date(reportPreview.nextReportDate).toLocaleDateString('ar-EG', {
                          weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                        })}
                      </strong>
                    </div>
                  )}
                </Card>
              ) : (
                <Button onClick={loadReportPreview} loading={loading}>تحميل المعاينة</Button>
              )}

              {/* Report Settings */}
              <Card>
                <h3 className="font-bold mb-4">⚙️ إعدادات التقرير</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold mb-2">يوم التقرير</label>
                    <select className="input" defaultValue={dashboard.reportDay}>
                      <option value="sunday">الأحد</option>
                      <option value="monday">الإثنين</option>
                      <option value="tuesday">الثلاثاء</option>
                      <option value="wednesday">الأربعاء</option>
                      <option value="thursday">الخميس</option>
                      <option value="friday">الجمعة</option>
                      <option value="saturday">السبت</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">ميعاد التقرير</label>
                    <input type="time" className="input" defaultValue={dashboard.reportTime} />
                  </div>
                  <Button size="sm">حفظ الإعدادات</Button>
                </div>
              </Card>
            </div>
          )}

          {/* ===== Settings ===== */}
          {activeTab === "settings" && (
            <Card>
              <h3 className="font-bold mb-4">⚙️ الإعدادات</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">الاسم</label>
                  <input type="text" className="input" defaultValue="د. سعيد محمد" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">التخصص</label>
                  <select className="input" defaultValue="internal_medicine">
                    <option value="internal_medicine">باطنة</option>
                    <option value="cardiology">قلب</option>
                    <option value="endocrinology">سكر وغدد</option>
                    <option value="nephrology">كلى</option>
                    <option value="general_practitioner">عام</option>
                  </select>
                </div>
                <Button>حفظ</Button>
              </div>
            </Card>
          )}
        </main>
      </div>
    </main>
  );
}
