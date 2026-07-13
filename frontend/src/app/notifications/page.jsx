"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo, Button, Card, Badge, BottomNav, EmptyState, Spinner } from "@/shared/components";
import { notificationsApi } from "@/shared/lib/api";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    try {
      const res = await notificationsApi.history({ limit: 50 });
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Notifications load error:", err);
      setError("حدث خطأ في تحميل الإشعارات");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkClicked(id) {
    try {
      await notificationsApi.markClicked(id);
      loadNotifications();
    } catch (err) {
      console.error("Mark clicked error:", err);
    }
  }

  async function handleTestPush() {
    try {
      await notificationsApi.sendTest();
      alert("تم إرسال إشعار تجريبي ✓");
      setTimeout(loadNotifications, 1000);
    } catch (err) {
      alert("فشل الإرسال — فعّل الإشعارات من الإعدادات");
    }
  }

  // Filter notifications
  const filtered = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return n.status === 'SENT' || n.status === 'DELIVERED';
    if (filter === "dose") return n.type?.startsWith('DOSE') || n.type === 'CAREGIVER_ALERT';
    if (filter === "refill") return n.type === 'REFILL_REMINDER' || n.type === 'EXPIRATION_ALERT';
    return true;
  });

  // Group by date
  const grouped = groupByDate(filtered);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-20 md:pb-0">

      <header className="bg-surface border-b border-outline sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="text-on-surface-variant flex items-center gap-1">
                <span className="icon-flip">→</span>
              </button>
            </Link>
            <h1 className="text-xl font-bold">الإشعارات</h1>
            {notifications.length > 0 && (
              <Badge variant="info">{notifications.length}</Badge>
            )}
          </div>
          <button
            onClick={handleTestPush}
            className="text-xs text-primary font-semibold"
          >
            🔔 تجربة
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-4">

        {error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { key: "all", label: "الكل", icon: "📋" },
            { key: "unread", label: "غير مقروء", icon: "🔵" },
            { key: "dose", label: "أدوية", icon: "💊" },
            { key: "refill", label: "تجديد", icon: "🔄" }
          ].map(tab => {
            const count = tab.key === "all"
              ? notifications.length
              : tab.key === "unread"
              ? notifications.filter(n => n.status === 'SENT' || n.status === 'DELIVERED').length
              : tab.key === "dose"
              ? notifications.filter(n => n.type?.startsWith('DOSE') || n.type === 'CAREGIVER_ALERT').length
              : notifications.filter(n => n.type === 'REFILL_REMINDER' || n.type === 'EXPIRATION_ALERT').length;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex items-center gap-2 ${
                  filter === tab.key
                    ? "bg-primary text-on-primary"
                    : "bg-surface text-on-surface-variant border border-outline"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    filter === tab.key ? "bg-white/20" : "bg-surface-variant"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="مفيش إشعارات"
            description="هتلاقي هنا تذكيرات الأدوية والتنبيهات المهمة"
            action={<Button variant="secondary" size="sm" onClick={handleTestPush}>
              🔔 تجربة الإشعارات
            </Button>}
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">
                  {dateLabel}
                </h3>
                <div className="space-y-2">
                  {items.map(notif => (
                    <NotificationCard
                      key={notif._id}
                      notification={notif}
                      onClick={() => handleMarkClicked(notif._id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="home" />
    </main>
  );
}

// ===== Notification Card =====
function NotificationCard({ notification, onClick }) {
  const isUnread = notification.status === 'SENT' || notification.status === 'DELIVERED';
  const typeIcons = {
    DOSE_REMINDER: "💊",
    DOSE_REMINDER_BATCH: "💊",
    DOSE_ESCALATION_SMS: "⚠️",
    CAREGIVER_ALERT: "🚨",
    REFILL_REMINDER: "🔄",
    EXPIRATION_ALERT: "📅",
    WEEKLY_REPORT: "📊",
    WELCOME: "👋",
    OTP: "🔐",
    CUSTOM: "🔔"
  };

  const typeLabels = {
    DOSE_REMINDER: "تذكير دواء",
    DOSE_REMINDER_BATCH: "تذكير أدوية",
    DOSE_ESCALATION_SMS: "تنبيه متأخر",
    CAREGIVER_ALERT: "تنبيه الأهل",
    REFILL_REMINDER: "تذكير تجديد",
    EXPIRATION_ALERT: "تنبيه انتهاء صلاحية",
    WEEKLY_REPORT: "تقرير أسبوعي",
    WELCOME: "ترحيب",
    OTP: "كود تحقق",
    CUSTOM: "إشعار"
  };

  const channelIcons = {
    PUSH: "📱",
    SMS: "💬",
    WHATSAPP: "🟢",
    EMAIL: "✉️"
  };

  const time = new Date(notification.createdAt).toLocaleTimeString('ar-EG', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <Card
      className={`cursor-pointer hover:border-primary transition-colors ${
        isUnread ? "border-r-4 border-r-primary" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
          isUnread ? "bg-primary-container" : "bg-surface-variant"
        }`}>
          {typeIcons[notification.type] || "🔔"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`text-sm ${isUnread ? "font-bold" : "font-medium"}`}>
                {notification.title || typeLabels[notification.type]}
              </p>
              <p className="text-sm text-on-surface-variant mt-0.5 line-clamp-2">
                {notification.body}
              </p>
            </div>
            <span className="text-xs text-on-surface-variant flex-shrink-0">
              {time}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-on-surface-variant">
              {channelIcons[notification.channel]} {typeLabels[notification.type]}
            </span>
            {isUnread && (
              <span className="w-2 h-2 bg-primary rounded-full" title="غير مقروء" />
            )}
            {notification.status === 'CLICKED' && (
              <Badge variant="success">مقروء</Badge>
            )}
            {notification.status === 'FAILED' && (
              <Badge variant="error">فشل</Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ===== Helper: Group notifications by date =====
function groupByDate(notifications) {
  const groups = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  notifications.forEach(n => {
    const notifDate = new Date(n.createdAt).toDateString();
    let label;
    if (notifDate === today) label = "اليوم";
    else if (notifDate === yesterday) label = "أمس";
    else label = new Date(notifDate).toLocaleDateString('ar-EG', {
      weekday: 'long', day: 'numeric', month: 'long'
    });

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });

  return groups;
}
