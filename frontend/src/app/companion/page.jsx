"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo, Button, Card, Badge, StatCard, BottomNav, EmptyState, Spinner } from "@/shared/components";
import { medicationsApi, dosesApi } from "@/shared/lib/api";

export default function CompanionPage() {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [todayDoses, setTodayDoses] = useState([]);
  const [adherence, setAdherence] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCaregiverData();
  }, []);

  async function loadCaregiverData() {
    setLoading(true);
    try {
      // TODO: Replace with caregiver-specific endpoint
      // For now, use a mock patient ID
      const mockPatientId = "65a1b2c3d4e5f6a7b8c9d0e1";
      setSelectedPatientId(mockPatientId);

      const medsRes = await medicationsApi.list(mockPatientId);
      const meds = medsRes.data || [];

      if (meds.length > 0) {
        const patient = meds[0].patientId;
        setPatients([{
          _id: mockPatientId,
          name: "محمد أحمد", // mock
          age: 65,
          conditions: ["سكر", "ضغط"]
        }]);

        const dosesRes = await dosesApi.dailySchedule(mockPatientId);
        setTodayDoses(dosesRes.data || []);

        const adhRes = await dosesApi.adherence(mockPatientId, 7);
        setAdherence(adhRes.data);
      }
    } catch (err) {
      console.error("Caregiver data error:", err);
      setError("حدث خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  }

  const todayTaken = todayDoses.filter(d => d.status === "TAKEN").length;
  const todayMissed = todayDoses.filter(d => d.status === "MISSED").length;
  const todayPending = todayDoses.filter(d => d.status === "PENDING").length;
  const allTaken = todayTaken === todayDoses.length && todayDoses.length > 0;
  const someMissed = todayMissed > 0;

  return (
    <main className="min-h-screen bg-background pb-20 md:pb-0">

      <header className="bg-surface border-b border-outline">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <h1 className="text-xl font-bold">متابعة الأهل</h1>
          </div>
          <Link href="/settings">
            <button className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
              ⚙️
            </button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

        {error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-lg">
            {error}
          </div>
        )}

        {/* ===== Patient Card ===== */}
        {patients.length === 0 ? (
          <EmptyState
            icon="👨‍👩‍👧"
            title="لسه مفيش مرضى مرتبطين"
            description="ابدأ بدعوة أحد أفراد العيلة للمتابعة"
            action={<Button>+ دعوة مريض</Button>}
          />
        ) : (
          patients.map(patient => (
            <Card key={patient._id} accent={allTaken ? "success" : someMissed ? "danger" : "primary"}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center text-3xl">
                  🧓
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{patient.name}</h2>
                  <p className="text-sm text-on-surface-variant">
                    {patient.age} سنة • {patient.conditions.join("، ")}
                  </p>
                  <div className="mt-2">
                    {allTaken && <Badge variant="success">✅ كله مأخود النهارده</Badge>}
                    {someMissed && <Badge variant="error">⚠️ فيه جرعات فاتت</Badge>}
                    {!allTaken && !someMissed && todayPending > 0 && (
                      <Badge variant="info">⏳ لسه فيه جرعات لاحقة</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}

        {/* ===== Stats ===== */}
        {todayDoses.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="مأخودة"
              value={todayTaken}
              icon="✅"
              color="success"
            />
            <StatCard
              label="في الانتظار"
              value={todayPending}
              icon="⏳"
              color="warning"
            />
            <StatCard
              label="فاتت"
              value={todayMissed}
              icon="❌"
              color="error"
            />
          </div>
        )}

        {/* ===== Adherence Summary ===== */}
        {adherence && (
          <Card>
            <h3 className="font-bold mb-3">📊 التزام الأسبوع</h3>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-black text-primary">{adherence.adherenceRate}%</div>
                <div className="text-xs text-on-surface-variant">نسبة الالتزام</div>
              </div>
              <div className="flex-1 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">مأخودة:</span>
                  <span className="font-bold text-tertiary">{adherence.taken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">فاتت:</span>
                  <span className="font-bold text-error">{adherence.missed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">متجاوزة:</span>
                  <span className="font-bold text-info">{adherence.skipped}</span>
                </div>
              </div>
            </div>

            {/* Daily Bar Chart */}
            <div className="mt-4 flex items-end gap-2 h-24">
              {adherence.dailyBreakdown?.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t ${
                      day.rate >= 80 ? "bg-tertiary" : day.rate >= 50 ? "bg-warning" : "bg-error"
                    }`}
                    style={{ height: `${Math.max(day.rate, 5)}%` }}
                    title={`${day.date}: ${day.taken}/${day.total}`}
                  />
                  <span className="text-xs text-on-surface-variant">
                    {new Date(day.date).toLocaleDateString("ar-EG", { weekday: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ===== Today's Schedule ===== */}
        <div>
          <h3 className="text-lg font-bold mb-3">جدول النهارده</h3>
          {todayDoses.length === 0 ? (
            <EmptyState
              icon="📋"
              title="مفيش جرعات مجدولة النهارده"
              description="كل حاجة تمام 👍"
            />
          ) : (
            <div className="space-y-2">
              {todayDoses.map(dose => (
                <Card key={dose._id} className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="text-center flex-shrink-0">
                      <div className="text-lg font-bold">
                        {new Date(dose.scheduledFor).toLocaleTimeString("ar-EG", {
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-xl">
                      💊
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold ${dose.status === "TAKEN" ? "line-through text-on-surface-variant" : ""}`}>
                        {dose.medicationId?.name || "دواء"}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {dose.medicationId?.inventory?.doseAmount} {dose.medicationId?.inventory?.unit}
                      </p>
                    </div>
                    <div>
                      {dose.status === "TAKEN" && <span className="text-2xl">✅</span>}
                      {dose.status === "MISSED" && <span className="text-2xl">❌</span>}
                      {dose.status === "PENDING" && <span className="text-2xl">⏳</span>}
                      {dose.status === "SKIPPED" && <span className="text-2xl">⏭</span>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* ===== Alert Settings ===== */}
        <Card accent="info">
          <h3 className="font-bold mb-2">🔔 إعدادات التنبيهات</h3>
          <p className="text-sm text-on-surface-variant mb-3">
            تقدر تتحكم في إمتى تستلم تنبيهات عن المريض
          </p>
          <Link href="/settings/alerts">
            <Button variant="secondary" size="sm">تعديل الإعدادات</Button>
          </Link>
        </Card>

      </div>

      <BottomNav active="home" />
    </main>
  );
}
