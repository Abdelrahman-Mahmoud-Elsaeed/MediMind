"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo, Button, Card, Badge, StatCard, BottomNav, EmptyState, Spinner } from "@/shared/components";
import { aiApi, medicationsApi } from "@/shared/lib/api";

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("interactions");
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInsights();
  }, []);

  async function loadInsights() {
    setLoading(true);
    setError("");
    try {
      const res = await aiApi.insights();
      setInsights(res.data);
    } catch (err) {
      console.error("AI insights error:", err);
      setError("حدث خطأ في تحليل البيانات");
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

  const interactions = insights?.interactions;
  const predictions = insights?.predictions;

  return (
    <main className="min-h-screen bg-background pb-20 md:pb-0">

      <header className="bg-surface border-b border-outline">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Logo size="sm" />
            <h1 className="text-xl font-bold">🤖 ذكاء وفاء</h1>
          </Link>
          <Button size="sm" variant="ghost" onClick={loadInsights}>
            🔄 تحديث
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          <button
            onClick={() => setActiveTab("interactions")}
            className={`px-6 py-2 rounded-full text-sm font-semibold ${
              activeTab === "interactions"
                ? "bg-primary text-on-primary"
                : "bg-surface text-on-surface-variant border border-outline"
            }`}
          >
            💊 تفاعلات الأدوية
          </button>
          <button
            onClick={() => setActiveTab("predictions")}
            className={`px-6 py-2 rounded-full text-sm font-semibold ${
              activeTab === "predictions"
                ? "bg-primary text-on-primary"
                : "bg-surface text-on-surface-variant border border-outline"
            }`}
          >
            📊 توقعات الالتزام
          </button>
          <button
            onClick={() => setActiveTab("smart")}
            className={`px-6 py-2 rounded-full text-sm font-semibold ${
              activeTab === "smart"
                ? "bg-primary text-on-primary"
                : "bg-surface text-on-surface-variant border border-outline"
            }`}
          >
            🧠 تذكيرات ذكية
          </button>
        </div>

        {/* ===== Interactions Tab ===== */}
        {activeTab === "interactions" && interactions && (
          <div className="space-y-4">

            {/* Risk Level Card */}
            <Card accent={
              interactions.summary.riskLevel === 'CRITICAL' ? 'danger' :
              interactions.summary.riskLevel === 'HIGH' ? 'danger' :
              interactions.summary.riskLevel === 'MEDIUM' ? 'warning' :
              interactions.summary.riskLevel === 'LOW' ? 'info' : 'success'
            }>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">مستوى الخطر</h3>
                  <p className="text-sm text-on-surface-variant">
                    بناءً على {interactions.summary.totalMedications} أدوية نشطة
                  </p>
                </div>
                <div className={`text-4xl font-black ${
                  interactions.summary.riskLevel === 'CRITICAL' ? 'text-error' :
                  interactions.summary.riskLevel === 'HIGH' ? 'text-error' :
                  interactions.summary.riskLevel === 'MEDIUM' ? 'text-warning' :
                  interactions.summary.riskLevel === 'LOW' ? 'text-info' : 'text-tertiary'
                }`}>
                  {riskLevelLabels[interactions.summary.riskLevel]}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-error-container rounded">
                  <p className="text-xl font-bold text-error">{interactions.summary.contraindicatedCount}</p>
                  <p className="text-xs text-on-error-container">ممنوعة</p>
                </div>
                <div className="p-2 bg-error/10 rounded">
                  <p className="text-xl font-bold text-error">{interactions.summary.severeCount}</p>
                  <p className="text-xs">خطيرة</p>
                </div>
                <div className="p-2 bg-warning-container rounded">
                  <p className="text-xl font-bold text-warning">{interactions.summary.moderateCount}</p>
                  <p className="text-xs text-on-warning-container">متوسطة</p>
                </div>
                <div className="p-2 bg-info-container rounded">
                  <p className="text-xl font-bold">{interactions.summary.mildCount}</p>
                  <p className="text-xs text-on-info-container">بسيطة</p>
                </div>
              </div>
            </Card>

            {/* Interactions List */}
            {interactions.interactions.length === 0 ? (
              <EmptyState
                icon="✅"
                title="مفيش تفاعلات معروفة"
                description="أدويتك الحالية مفيش بينها تفاعلات مسجلة — حافظ على استمراريتك!"
              />
            ) : (
              <div className="space-y-3">
                <h3 className="font-bold">📋 التفاعلات المكتشفة ({interactions.interactions.length})</h3>
                {interactions.interactions.map((interaction, i) => (
                  <InteractionCard key={i} interaction={interaction} />
                ))}
              </div>
            )}

            {/* Recommendations */}
            {interactions.recommendations.length > 0 && (
              <Card>
                <h3 className="font-bold mb-3">💡 التوصيات</h3>
                <div className="space-y-3">
                  {interactions.recommendations.map((rec, i) => (
                    <RecommendationCard key={i} rec={rec} />
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ===== Predictions Tab ===== */}
        {activeTab === "predictions" && predictions && (
          <div className="space-y-4">

            {/* Risk Score */}
            <Card accent={
              predictions.riskLevel === 'CRITICAL' ? 'danger' :
              predictions.riskLevel === 'HIGH' ? 'danger' :
              predictions.riskLevel === 'MODERATE' ? 'warning' :
              predictions.riskLevel === 'LOW' ? 'success' : 'info'
            }>
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 -rotate-90">
                    <circle cx="64" cy="64" r="56" fill="none" stroke="var(--outline)" strokeWidth="10" />
                    <circle
                      cx="64" cy="64" r="56" fill="none"
                      stroke={
                        predictions.riskLevel === 'CRITICAL' || predictions.riskLevel === 'HIGH'
                          ? 'var(--error)'
                        : predictions.riskLevel === 'MODERATE'
                          ? 'var(--warning)'
                        : 'var(--tertiary)'
                      }
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - predictions.riskScore / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black">{predictions.riskScore}</span>
                    <span className="text-xs text-on-surface-variant">/ 100</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">نسبة خطر فوات الجرعات</h3>
                  <p className="text-sm text-on-surface-variant mb-2">
                    خلال الـ 7 أيام الجاية
                  </p>
                  <Badge variant={
                    predictions.riskLevel === 'CRITICAL' ? 'error' :
                    predictions.riskLevel === 'HIGH' ? 'error' :
                    predictions.riskLevel === 'MODERATE' ? 'warning' :
                    predictions.riskLevel === 'LOW' ? 'success' : 'info'
                  }>
                    {riskLevelLabels[predictions.riskLevel] || predictions.riskLevel}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Risk Factors */}
            {predictions.factors.length > 0 && (
              <Card>
                <h3 className="font-bold mb-4">🔍 عوامل الخطر</h3>
                <div className="space-y-3">
                  {predictions.factors.map((factor, i) => (
                    <FactorBar key={i} factor={factor} />
                  ))}
                </div>
              </Card>
            )}

            {/* 7-Day Forecast */}
            {predictions.predictions && predictions.predictions.length > 0 && (
              <Card>
                <h3 className="font-bold mb-4">📅 توقعات 7 أيام</h3>
                <div className="grid grid-cols-7 gap-2">
                  {predictions.predictions.map((day, i) => (
                    <div
                      key={i}
                      className={`text-center p-3 rounded-lg ${
                        day.riskLevel === 'CRITICAL' ? 'bg-error text-on-error' :
                        day.riskLevel === 'HIGH' ? 'bg-error/20' :
                        day.riskLevel === 'MEDIUM' ? 'bg-warning-container' :
                        'bg-tertiary-container'
                      }`}
                    >
                      <p className="text-xs font-semibold">{day.dayName.substring(0, 3)}</p>
                      <p className="text-lg font-bold mt-1">{day.missProbability}%</p>
                      <p className="text-xs opacity-70">
                        {day.isToday ? 'اليوم' : day.isTomorrow ? 'بكرة' : ''}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-tertiary-container rounded" /> منخفض
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-warning-container rounded" /> متوسط
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-error/20 rounded" /> مرتفع
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-error rounded" /> حرج
                  </div>
                </div>
              </Card>
            )}

            {/* Recommendations */}
            {predictions.recommendations.length > 0 && (
              <Card>
                <h3 className="font-bold mb-3">💡 توصيات مخصصة لك</h3>
                <div className="space-y-3">
                  {predictions.recommendations.map((rec, i) => (
                    <RecommendationCard key={i} rec={rec} />
                  ))}
                </div>
              </Card>
            )}

            {/* Summary */}
            {predictions.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  label="التزام 30 يوم"
                  value={`${predictions.summary.overallAdherence}%`}
                  icon="📊"
                  color={predictions.summary.overallAdherence >= 80 ? "success" : "warning"}
                />
                <StatCard
                  label="الاتجاه"
                  value={predictions.summary.trend}
                  icon="📈"
                />
                <StatCard
                  label="الستريك"
                  value={`${predictions.summary.streak} يوم`}
                  icon="🔥"
                />
                <StatCard
                  label="أدوية نشطة"
                  value={predictions.summary.medicationsCount}
                  icon="💊"
                />
              </div>
            )}
          </div>
        )}

        {/* ===== Smart Reminders Tab ===== */}
        {activeTab === "smart" && insights?.smartReminders && (
          <div className="space-y-4">

            {/* Smart Status */}
            <Card accent="primary">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center text-3xl">
                  🧠
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">التذكيرات الذكية</h3>
                  <p className="text-sm text-on-surface-variant">
                    {insights.smartReminders.summary?.smartRemindersActive
                      ? "شغّالة! بنتعلم من سلوكك كل يوم"
                      : "هتشتغل بعد ما نجمع بيانات كافية"}
                  </p>
                </div>
                {insights.smartReminders.summary?.smartRemindersActive && (
                  <Badge variant="success">✓ نشط</Badge>
                )}
              </div>
            </Card>

            {/* Insights */}
            {insights.smartReminders.insights?.length > 0 && (
              <Card>
                <h3 className="font-bold mb-4">📊 رؤى ذكية</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {insights.smartReminders.insights.map((insight, i) => (
                    <div key={i} className="p-3 bg-surface-variant rounded-lg text-center">
                      <div className="text-3xl mb-1">{insight.icon}</div>
                      <p className="text-xs text-on-surface-variant">{insight.title}</p>
                      <p className="font-bold text-sm">{insight.value}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{insight.description}</p>
                      {insight.accuracy && (
                        <p className="text-xs text-tertiary font-semibold mt-1">{insight.accuracy}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Adjusted Timings */}
            {insights.smartReminders.adjustedTimings?.length > 0 && (
              <Card accent="info">
                <h3 className="font-bold mb-4">⏰ مواعيد مقترحة</h3>
                <p className="text-sm text-on-surface-variant mb-3">
                  بناءً على سلوكك، نقترح تعديل مواعيد التذكير:
                </p>
                <div className="space-y-2">
                  {insights.smartReminders.adjustedTimings.map((timing, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{timing.medicationName}</p>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-1">
                          <span className="line-through">{timing.originalTime}</span>
                          <span>←</span>
                          <span className="font-bold text-primary text-base">{timing.suggestedTime}</span>
                          <span className="text-on-surface-variant">
                            ({timing.direction === 'EARLIER' ? 'بدري' : 'متأخر'} بـ {Math.abs(timing.averageDelayMinutes)} دقيقة)
                          </span>
                        </div>
                      </div>
                      <Badge variant={
                        timing.confidence >= 70 ? 'success' :
                        timing.confidence >= 40 ? 'warning' : 'info'
                      }>
                        {timing.confidence}% ثقة
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recommendations */}
            {insights.smartReminders.recommendations?.length > 0 && (
              <Card>
                <h3 className="font-bold mb-3">💡 توصيات ذكية</h3>
                <div className="space-y-3">
                  {insights.smartReminders.recommendations.map((rec, i) => (
                    <SmartRecommendationCard key={i} rec={rec} />
                  ))}
                </div>
              </Card>
            )}

            {/* Summary */}
            {insights.smartReminders.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  label="أحداث محللة"
                  value={insights.smartReminders.summary.eventsAnalyzed}
                  icon="📋"
                />
                <StatCard
                  label="متوسط التأخير"
                  value={`${insights.smartReminders.summary.averageDelayMinutes || 0} د`}
                  icon="⏰"
                  color={Math.abs(insights.smartReminders.summary.averageDelayMinutes || 0) > 30 ? "warning" : "success"}
                />
                <StatCard
                  label="قناة مفضلة"
                  value={insights.smartReminders.summary.optimalChannel === 'PUSH' ? '📱'
                       : insights.smartReminders.summary.optimalChannel === 'WHATSAPP' ? '💬' : '✉️'}
                  icon="📨"
                />
                <StatCard
                  label="الاتجاه"
                  value={insights.smartReminders.summary.adherenceTrend === 'IMPROVING' ? '↗ تحسن'
                       : insights.smartReminders.summary.adherenceTrend === 'DECLINING' ? '↘ انخفاض' : '➡ مستقر'}
                  icon="📈"
                  color={insights.smartReminders.summary.adherenceTrend === 'IMPROVING' ? "success" :
                         insights.smartReminders.summary.adherenceTrend === 'DECLINING' ? "error" : "info"}
                />
              </div>
            )}

          </div>
        )}

      </div>

      <BottomNav active="home" />
    </main>
  );
}

// ===== Components =====

const riskLevelLabels = {
  NONE: '✅ آمن',
  LOW: '✅ منخفض',
  MODERATE: '⚠️ متوسط',
  MEDIUM: '⚠️ متوسط',
  HIGH: '🚨 مرتفع',
  CRITICAL: '🆘 حرج',
  NO_DATA: '📊 مفيش بيانات'
};

function InteractionCard({ interaction }) {
  const severityConfig = {
    contraindicated: { variant: 'error', label: '🚫 ممنوع', color: 'bg-error-container' },
    severe: { variant: 'error', label: '🚨 خطير', color: 'bg-error/10' },
    moderate: { variant: 'warning', label: '⚠️ متوسط', color: 'bg-warning-container' },
    mild: { variant: 'info', label: 'ℹ️ بسيط', color: 'bg-info-container' }
  };

  const config = severityConfig[interaction.severity] || severityConfig.mild;

  return (
    <Card className={config.color}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{interaction.drugAName}</span>
          <span className="text-on-surface-variant">↔</span>
          <span className="text-lg font-bold">{interaction.drugBName}</span>
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>
      <p className="text-sm text-on-surface-variant mb-2">{interaction.description}</p>
      <div className="bg-surface p-2 rounded text-xs">
        <p className="font-semibold text-on-background">💡 التوصية:</p>
        <p className="text-on-surface-variant">{interaction.recommendation}</p>
      </div>
    </Card>
  );
}

function RecommendationCard({ rec }) {
  const priorityConfig = {
    CRITICAL: { variant: 'danger', icon: '🆘' },
    HIGH: { variant: 'error', icon: '🚨' },
    MEDIUM: { variant: 'warning', icon: '⚠️' },
    LOW: { variant: 'info', icon: 'ℹ️' },
    INFO: { variant: 'info', icon: '💡' }
  };

  const config = priorityConfig[rec.priority] || priorityConfig.INFO;

  return (
    <div className={`p-3 rounded-lg ${
      rec.priority === 'CRITICAL' || rec.priority === 'HIGH' ? 'bg-error-container' :
      rec.priority === 'MEDIUM' ? 'bg-warning-container' : 'bg-info-container'
    }`}>
      <div className="flex items-start gap-2">
        <span className="text-xl">{config.icon}</span>
        <div className="flex-1">
          <p className="font-bold text-sm">{rec.title}</p>
          <p className="text-xs text-on-surface-variant mt-1">{rec.description}</p>
          <p className="text-xs font-semibold mt-2">→ {rec.action}</p>
        </div>
      </div>
    </div>
  );
}

function FactorBar({ factor }) {
  const percentage = Math.round((factor.score / factor.maxScore) * 100);
  const color = percentage >= 70 ? 'bg-error' :
                percentage >= 40 ? 'bg-warning' : 'bg-tertiary';

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <div>
          <span className="font-semibold">{factor.name}</span>
          <span className="text-on-surface-variant mr-2">— {factor.value}</span>
        </div>
        <span className="font-bold">{factor.score}/{factor.maxScore}</span>
      </div>
      <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
      <p className="text-xs text-on-surface-variant mt-1">{factor.description}</p>
    </div>
  );
}

function SmartRecommendationCard({ rec }) {
  const priorityConfig = {
    CRITICAL: { variant: 'danger', icon: '🆘', bg: 'bg-error-container' },
    HIGH: { variant: 'error', icon: '🚨', bg: 'bg-error/10' },
    MEDIUM: { variant: 'warning', icon: '⚠️', bg: 'bg-warning-container' },
    LOW: { variant: 'info', icon: 'ℹ️', bg: 'bg-info-container' },
    INFO: { variant: 'info', icon: '💡', bg: 'bg-info-container' }
  };

  const config = priorityConfig[rec.priority] || priorityConfig.INFO;

  return (
    <div className={`p-3 rounded-lg ${config.bg}`}>
      <div className="flex items-start gap-2">
        <span className="text-xl">{config.icon}</span>
        <div className="flex-1">
          <p className="font-bold text-sm">{rec.title}</p>
          <p className="text-xs text-on-surface-variant mt-1">{rec.description}</p>
          <p className="text-xs font-semibold mt-2 text-primary">→ {rec.action}</p>
          {rec.impact && (
            <p className="text-xs text-on-surface-variant mt-1 italic">📊 {rec.impact}</p>
          )}
        </div>
      </div>
    </div>
  );
}
