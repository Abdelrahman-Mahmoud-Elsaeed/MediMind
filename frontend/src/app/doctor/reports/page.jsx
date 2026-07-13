"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo, Button, Card, Badge, StatCard, Spinner, EmptyState } from "@/shared/components";
import { doctorApi } from "@/shared/lib/api";

export default function DoctorReportsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);

  useEffect(() => {
    loadReport();
  }, [period]);

  async function loadReport() {
    setLoading(true);
    setError("");
    try {
      const res = await doctorApi.fullReport(period);
      setReport(res.data);
    } catch (err) {
      console.error("Doctor report error:", err);
      setError("حدث خطأ في تحميل التقرير");
    } finally {
      setLoading(false);
    }
  }

  async function loadPatientDetail(patientId) {
    try {
      setSelectedPatient(patientId);
      const res = await doctorApi.patientDetail(patientId, period);
      setPatientDetail(res.data);
    } catch (err) {
      console.error("Patient detail error:", err);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  }

  // ===== Patient Detail Modal =====
  if (selectedPatient && patientDetail) {
    return (
      <PatientDetailModal
        patient={patientDetail}
        period={period}
        onClose={() => {
          setSelectedPatient(null);
          setPatientDetail(null);
        }}
      />
    );
  }

  const summary = report?.summary || {};

  return (
    <main className="min-h-screen bg-background">

      <header className="bg-surface border-b border-outline">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/doctor" className="flex items-center gap-3">
            <Logo size="sm" />
            <h1 className="text-xl font-bold">تقارير المرضى</h1>
          </Link>
          <Link href="/doctor">
            <Button size="sm" variant="ghost">← رجوع</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-lg">
            {error}
          </div>
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
              className={`px-6 py-2 rounded-full text-sm font-semibold ${
                period === p.val
                  ? "bg-primary text-on-primary"
                  : "bg-surface text-on-surface-variant border border-outline"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ===== Summary Stats ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="إجمالي المرضى"
            value={summary.totalPatients || 0}
            icon="👥"
          />
          <StatCard
            label="متوسط الالتزام"
            value={`${summary.averageAdherence || 0}%`}
            icon="📊"
            color={(summary.averageAdherence || 0) >= 80 ? "success" : "warning"}
          />
          <StatCard
            label="جرعات مأخودة"
            value={summary.totalDosesTaken || 0}
            icon="✅"
            color="success"
          />
          <StatCard
            label="جرعات فاتت"
            value={summary.totalDosesMissed || 0}
            icon="❌"
            color="error"
          />
        </div>

        {/* ===== Cohort Distribution ===== */}
        {report?.summary && (
          <Card>
            <h3 className="font-bold mb-4">📊 توزيع المرضى حسب الالتزام</h3>
            <div className="space-y-3">
              {[
                { label: "ممتاز (90%+)", count: summary.adherenceDistribution?.excellent || 0, color: "bg-tertiary", textColor: "text-tertiary" },
                { label: "كويس (70-89%)", count: summary.adherenceDistribution?.good || 0, color: "bg-primary", textColor: "text-primary" },
                { label: "مقبول (50-69%)", count: summary.adherenceDistribution?.fair || 0, color: "bg-warning", textColor: "text-warning" },
                { label: "ضعيف (30-49%)", count: summary.adherenceDistribution?.poor || 0, color: "bg-error/70", textColor: "text-error" },
                { label: "حرج (أقل من 30%)", count: summary.adherenceDistribution?.critical || 0, color: "bg-error", textColor: "text-error" }
              ].map((tier, i) => {
                const total = summary.totalPatients || 1;
                const pct = (tier.count / total) * 100;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">{tier.label}</span>
                      <span className={`${tier.textColor} font-bold`}>{tier.count} مريض ({Math.round(pct)}%)</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-3 overflow-hidden">
                      <div className={`h-full rounded-full ${tier.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* ===== Adherence Trend (Line Chart) ===== */}
        {report?.trend && report.trend.length > 0 && (
          <Card>
            <h3 className="font-bold mb-4">📈 اتجاه الالتزام اليومي</h3>
            <LineChart data={report.trend} />
          </Card>
        )}

        {/* ===== Interventions Needed ===== */}
        {report?.interventions && report.interventions.length > 0 && (
          <Card accent="danger">
            <h3 className="font-bold mb-4">⚠️ مرضى محتاجين تدخل ({report.interventions.length})</h3>
            <div className="space-y-3">
              {report.interventions.map((int, i) => (
                <div key={i} className={`p-3 rounded-lg ${
                  int.severity === 'critical' ? 'bg-error-container' : 'bg-warning-container'
                }`}>
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-bold">{int.patientName}</p>
                    <Badge variant={int.severity === 'critical' ? 'error' : 'warning'}>
                      {int.severity === 'critical' ? 'حرج' : 'تحذير'}
                    </Badge>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-1">{int.message}</p>
                  <p className="text-xs text-on-surface-variant italic">💡 {int.recommendation}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2"
                    onClick={() => loadPatientDetail(int.patientId)}
                  >
                    عرض التفاصيل ←
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ===== Refill Alerts ===== */}
        {report?.refillAlerts && report.refillAlerts.length > 0 && (
          <Card accent="warning">
            <h3 className="font-bold mb-4">💊 أدوية تحتاج تجديد ({report.refillAlerts.length})</h3>
            <div className="space-y-2">
              {report.refillAlerts.map((alert, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-outline last:border-0">
                  <div>
                    <p className="font-semibold">{alert.medicationName}</p>
                    <p className="text-xs text-on-surface-variant">{alert.patientName}</p>
                  </div>
                  <div className="text-left">
                    <Badge variant={alert.severity === 'critical' ? 'error' : 'warning'}>
                      {alert.daysUntilRefill} أيام
                    </Badge>
                    <p className="text-xs text-on-surface-variant mt-1">{alert.currentQuantity} متبقي</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ===== Patient Breakdown Table ===== */}
        {report?.patientBreakdown && report.patientBreakdown.length > 0 && (
          <Card>
            <h3 className="font-bold mb-4">👥 تفصيل المرضى</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline text-on-surface-variant">
                    <th className="text-right py-2 px-2">المريض</th>
                    <th className="text-center py-2 px-2">الالتزام</th>
                    <th className="text-center py-2 px-2">مأخودة</th>
                    <th className="text-center py-2 px-2">فاتت</th>
                    <th className="text-center py-2 px-2">الاتجاه</th>
                    <th className="text-center py-2 px-2">الحالة</th>
                    <th className="text-center py-2 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {report.patientBreakdown.map((p, i) => (
                    <tr key={i} className="border-b border-outline hover:bg-surface-variant cursor-pointer"
                      onClick={() => loadPatientDetail(p._id)}>
                      <td className="py-3 px-2">
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-on-surface-variant">{p.age} سنة</p>
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className={`font-bold ${
                          p.adherenceRate >= 80 ? 'text-tertiary' :
                          p.adherenceRate >= 50 ? 'text-warning' : 'text-error'
                        }`}>
                          {p.adherenceRate}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-2 text-tertiary font-bold">{p.dosesTaken}</td>
                      <td className="text-center py-3 px-2 text-error font-bold">{p.dosesMissed}</td>
                      <td className="text-center py-3 px-2">
                        {p.trendDirection === 'IMPROVING' && <span className="text-tertiary">📈</span>}
                        {p.trendDirection === 'DECLINING' && <span className="text-error">📉</span>}
                        {p.trendDirection === 'STABLE' && <span className="text-on-surface-variant">➡️</span>}
                      </td>
                      <td className="text-center py-3 px-2">
                        <Badge variant={
                          p.status === 'ADHERENT' ? 'success' :
                          p.status === 'MODERATE' ? 'warning' : 'error'
                        }>
                          {p.status === 'ADHERENT' ? 'ملتزم' :
                           p.status === 'MODERATE' ? 'متوسط' : 'غير ملتزم'}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-2 text-primary">←</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ===== Heatmap (Time-of-day misses) ===== */}
        {report?.heatmap && (
          <Card>
            <h3 className="font-bold mb-4">🔥 خريطة الفوات (متى يفوت المرضى الجرعات؟)</h3>
            <Heatmap heatmap={report.heatmap} />
          </Card>
        )}

      </div>
    </main>
  );
}

// ===== Line Chart Component =====
function LineChart({ data }) {
  if (!data || data.length === 0) return null;

  const maxRate = 100;
  const width = 600;
  const height = 200;
  const padding = 30;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const y = padding + chartHeight - (d.rate / maxRate) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) =>
    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
  ).join(' ');

  const areaD = pathD + ` L ${points[points.length-1].x} ${padding + chartHeight} L ${padding} ${padding + chartHeight} Z`;

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="min-w-full">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(val => {
          const y = padding + chartHeight - (val / maxRate) * chartHeight;
          return (
            <g key={val}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--outline)" strokeWidth="1" strokeDasharray="3,3" />
              <text x={padding - 5} y={y + 4} textAnchor="end" fontSize="10" fill="var(--on-surface-variant)">{val}%</text>
            </g>
          );
        })}

        {/* Area */}
        <path d={areaD} fill="var(--primary)" opacity="0.1" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="2" />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="var(--primary)" />
            {(i % Math.ceil(data.length / 10) === 0) && (
              <text x={p.x} y={height - 10} textAnchor="middle" fontSize="9" fill="var(--on-surface-variant)">
                {p.dayName}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ===== Heatmap Component =====
function Heatmap({ heatmap }) {
  const dayLabels = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];
  const maxMisses = Math.max(...heatmap.data.flat(), 1);

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Hour labels (top) */}
        <div className="flex" style={{ marginRight: '40px' }}>
          {heatmap.hours.map(h => (
            <div key={h} className="flex-1 text-center text-xs text-on-surface-variant" style={{ minWidth: '20px' }}>
              {h % 3 === 0 ? h : ''}
            </div>
          ))}
        </div>
        {/* Grid */}
        {heatmap.data.map((row, dayIdx) => (
          <div key={dayIdx} className="flex items-center" style={{ height: '28px' }}>
            <div className="text-xs text-on-surface-variant w-10">{dayLabels[dayIdx]}</div>
            {row.map((misses, hourIdx) => {
              const intensity = misses / maxMisses;
              const bg = misses === 0 ? 'var(--surface-variant)' :
                `rgba(239, 68, 68, ${0.2 + intensity * 0.8})`;
              return (
                <div
                  key={hourIdx}
                  className="flex-1 m-0.5 rounded"
                  style={{
                    minWidth: '20px',
                    height: '24px',
                    background: bg,
                    title: misses > 0 ? `${misses} جرعة فاتت` : 'مفيش فوات'
                  }}
                  title={misses > 0 ? `${dayLabels[dayIdx]} ${hourIdx}:00 — ${misses} جرعة فاتت` : 'مفيش فوات'}
                />
              );
            })}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-3 text-xs text-on-surface-variant">
          <span>أقل</span>
          <div className="w-4 h-4 rounded" style={{ background: 'var(--surface-variant)' }} />
          <div className="w-4 h-4 rounded" style={{ background: 'rgba(239, 68, 68, 0.3)' }} />
          <div className="w-4 h-4 rounded" style={{ background: 'rgba(239, 68, 68, 0.6)' }} />
          <div className="w-4 h-4 rounded" style={{ background: 'rgba(239, 68, 68, 1)' }} />
          <span>أكثر</span>
        </div>
      </div>
    </div>
  );
}

// ===== Patient Detail Modal =====
function PatientDetailModal({ patient, period, onClose }) {
  const p = patient.patient;
  const s = patient.summary;

  return (
    <main className="min-h-screen bg-background">

      <header className="bg-surface border-b border-outline">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <h1 className="text-xl font-bold">تفاصيل المريض</h1>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>← رجوع للتقارير</Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Patient Header */}
        <Card accent="primary">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center text-3xl">
              {p.age > 50 ? "🧓" : "👤"}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black">{p.name}</h2>
              <p className="text-sm text-on-surface-variant">
                {p.age ? `${p.age} سنة • ` : ""}📱 {p.phone}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="info">🔥 {p.currentStreak} يوم متتالي</Badge>
                <Badge variant="warning">🏆 {p.totalBadges} إنجاز</Badge>
                <Badge variant="success">أطول ستريك: {p.longestStreak} يوم</Badge>
              </div>
            </div>
            <div className="text-center">
              <div className={`text-5xl font-black ${
                s.adherenceRate >= 80 ? 'text-tertiary' :
                s.adherenceRate >= 50 ? 'text-warning' : 'text-error'
              }`}>
                {s.adherenceRate}%
              </div>
              <div className="text-xs text-on-surface-variant">التزام ({period} يوم)</div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="إجمالي الجرعات" value={s.totalDoses} icon="📊" />
          <StatCard label="مأخودة" value={s.dosesTaken} icon="✅" color="success" />
          <StatCard label="فاتت" value={s.dosesMissed} icon="❌" color="error" />
          <StatCard label="أدوية نشطة" value={s.activeMedications} icon="💊" />
        </div>

        {/* Daily Adherence Chart */}
        {patient.dailyAdherence && (
          <Card>
            <h3 className="font-bold mb-4">📈 الالتزام اليومي</h3>
            <LineChart data={patient.dailyAdherence} />
          </Card>
        )}

        {/* Per-Medication Breakdown */}
        {patient.perMedication && patient.perMedication.length > 0 && (
          <Card>
            <h3 className="font-bold mb-4">💊 التزام كل دواء</h3>
            <div className="space-y-3">
              {patient.perMedication.map((med, i) => (
                <div key={i} className="p-3 border border-outline rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold">{med.name}</p>
                      <p className="text-xs text-on-surface-variant">
                        {med.formType} {med.isChronic && "• مزمن"}
                      </p>
                    </div>
                    <Badge variant={
                      med.adherenceRate >= 80 ? 'success' :
                      med.adherenceRate >= 50 ? 'warning' : 'error'
                    }>
                      {med.adherenceRate}%
                    </Badge>
                  </div>
                  <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${
                        med.adherenceRate >= 80 ? 'bg-tertiary' :
                        med.adherenceRate >= 50 ? 'bg-warning' : 'bg-error'
                      }`}
                      style={{ width: `${med.adherenceRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>✅ {med.dosesTaken} مأخودة</span>
                    <span>❌ {med.dosesMissed} فاتت</span>
                    <span>⏭ {med.dosesSkipped} متجاوزة</span>
                    {med.isRefillNeededSoon && <span className="text-warning font-bold">⚠️ قارب يخلص ({med.daysUntilRefill} أيام)</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Time-of-Day Analysis */}
        {patient.timeAnalysis && patient.timeAnalysis.length > 0 && (
          <Card>
            <h3 className="font-bold mb-4">⏰ تحليل أوقات الجرعات</h3>
            <div className="space-y-3">
              {patient.timeAnalysis.map((slot, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">{slot.label}</span>
                    <span className={`font-bold ${
                      slot.adherenceRate >= 80 ? 'text-tertiary' :
                      slot.adherenceRate >= 50 ? 'text-warning' : 'text-error'
                    }`}>
                      {slot.adherenceRate}% ({slot.taken}/{slot.total})
                    </span>
                  </div>
                  <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        slot.adherenceRate >= 80 ? 'bg-tertiary' :
                        slot.adherenceRate >= 50 ? 'bg-warning' : 'bg-error'
                      }`}
                      style={{ width: `${slot.adherenceRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Streak History */}
        {patient.streakHistory && patient.streakHistory.length > 0 && (
          <Card>
            <h3 className="font-bold mb-4">🔥 تاريخ الستريك</h3>
            <div className="flex items-end gap-1 h-32">
              {patient.streakHistory.slice(-30).map((day, i) => (
                <div
                  key={i}
                  className="flex-1 bg-tertiary rounded-t hover:bg-tertiary/80"
                  style={{
                    height: `${Math.max((day.streak / 7) * 100, 5)}%`,
                    opacity: day.status === 'TAKEN' ? 1 : 0.3
                  }}
                  title={`${day.date}: ${day.streak} أيام متتالية`}
                />
              ))}
            </div>
            <p className="text-xs text-on-surface-variant text-center mt-2">
              آخر 30 يوم — الأعلى = أطول ستريك
            </p>
          </Card>
        )}

      </div>
    </main>
  );
}
