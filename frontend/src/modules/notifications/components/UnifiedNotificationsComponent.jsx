"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Pill,
  ShoppingBag,
  CheckCheck,
  Trash2,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Package,
} from "lucide-react";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useSocketNotifications } from "@/shared/hooks/useSocketNotifications";
import {
  usePatientRelationshipsQuery,
  useUpdateRelationshipStatusMutation as useUpdatePatientStatusMutation,
  usePatientMedicationsQuery,
  usePatientDosesQuery,
} from "@/modules/patient/hooks/usePatientQueries";
import {
  useCaregiverRelationshipsQuery,
  useUpdateRelationshipStatusMutation as useUpdateCaregiverStatusMutation,
} from "@/modules/caregiver/hooks/useCaregiverQueries";

export default function UnifiedNotificationsComponent() {
  const { locale, t } = useTranslation();
  const isAr = locale === "ar";
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("ALL");

  const isCaregiverRole = ["FAMILY_CAREGIVER", "PROFESSIONAL_CAREGIVER", "CAREGIVER", "DOCTOR"].includes(user?.role);
  const isPatientRole = user?.role === "PATIENT";
  const isPharmacistRole = user?.role === "PHARMACIST";

  // 1. Socket & Persisted DB Notifications
  const {
    notifications = [],
    unreadCount = 0,
    loading: loadingSocket,
    refetch: refetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useSocketNotifications();

  // 2. Relationships Queries
  const { data: patientRels = [], isLoading: loadingPatientRels } = usePatientRelationshipsQuery({ enabled: isPatientRole });
  const patientUpdateStatus = useUpdatePatientStatusMutation();

  const { data: caregiverRels = [], isLoading: loadingCaregiverRels } = useCaregiverRelationshipsQuery({ enabled: isCaregiverRole });
  const caregiverUpdateStatus = useUpdateCaregiverStatusMutation();

  // 3. Medication & Dose Queries (Patient view)
  const dateStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const { data: medications = [] } = usePatientMedicationsQuery({ enabled: isPatientRole });
  const { data: doses = [] } = usePatientDosesQuery(dateStr, { enabled: isPatientRole });

  // Incoming pending invitations requiring action
  const pendingIncoming = isCaregiverRole
    ? caregiverRels.filter((r) => r.status === "PENDING" && r.initiatedBy === "PATIENT")
    : isPatientRole
      ? patientRels.filter((r) => r.status === "PENDING" && (r.initiatedBy === "CAREGIVER" || !r.initiatedBy))
      : [];

  const pendingOutgoing = isCaregiverRole
    ? caregiverRels.filter((r) => r.status === "PENDING" && r.initiatedBy === "CAREGIVER")
    : isPatientRole
      ? patientRels.filter((r) => r.status === "PENDING" && r.initiatedBy === "PATIENT")
      : [];

  const handleRelationshipAction = (relationshipId, status) => {
    if (isCaregiverRole) {
      caregiverUpdateStatus.mutate({ relationshipId, status });
    } else {
      patientUpdateStatus.mutate({ relationshipId, status });
    }
  };

  // Filtered Notifications Logic
  const filteredDbNotifications = useMemo(() => {
    if (activeTab === "ALL") return notifications;
    if (activeTab === "INVITES") {
      return notifications.filter((n) =>
        ["CAREGIVER_INVITATION", "RELATIONSHIP_REQUEST", "RELATIONSHIP_ACCEPTED", "RELATIONSHIP_REJECTED"].includes(n.type)
      );
    }
    if (activeTab === "MEDICATIONS") {
      return notifications.filter((n) =>
        ["DOSE_REMINDER", "DOSE_MISSED", "MEDICATION_LOW_STOCK", "MEDICATION_REFILL"].includes(n.type)
      );
    }
    if (activeTab === "ORDERS") {
      return notifications.filter((n) =>
        ["REFILL_ORDER_CREATED", "REFILL_ORDER_UPDATED"].includes(n.type)
      );
    }
    return notifications;
  }, [notifications, activeTab]);

  const totalUnreadCount = (pendingIncoming?.length || 0) + (unreadCount || 0);

  // Status helper badges for orders
  const getOrderStatusBadge = (orderStatus) => {
    switch (orderStatus) {
      case "SUBMITTED":
        return { label: isAr ? "تم أرسال الطلب" : "Submitted", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
      case "APPROVED":
        return { label: isAr ? "تمت الموافقة" : "Approved", color: "bg-teal-500/10 text-teal-600 border-teal-500/20" };
      case "DISPENSED":
        return { label: isAr ? "تم تجهيز الدواء" : "Dispensed", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" };
      case "READY_FOR_PICKUP":
        return { label: isAr ? "جاهز للاستلام/التوصيل" : "Ready for Pickup", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
      case "COMPLETED":
        return { label: isAr ? "تم التسليم بنجاح" : "Completed", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
      case "REJECTED":
        return { label: isAr ? "تم رفض الطلب" : "Rejected", color: "bg-rose-500/10 text-rose-600 border-rose-500/20" };
      default:
        return { label: orderStatus, color: "bg-surface-container text-on-surface-variant border-outline-variant/30" };
    }
  };

  const getNotificationDetails = (notif) => {
    const { type } = notif;
    if (["REFILL_ORDER_CREATED", "REFILL_ORDER_UPDATED"].includes(type)) {
      return {
        icon: ShoppingBag,
        bgColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        badge: isAr ? "طلب صيدلية" : "Pharmacy Order",
        route: isPharmacistRole ? "/pharmacy/orders" : "/refills",
      };
    }
    if (["DOSE_REMINDER", "DOSE_MISSED"].includes(type)) {
      return {
        icon: Pill,
        bgColor: type === "DOSE_MISSED" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        badge: type === "DOSE_MISSED" ? (isAr ? "جرعة فائتة" : "Missed Dose") : (isAr ? "تنبيه دواء" : "Dose Reminder"),
        route: "/home",
      };
    }
    if (["MEDICATION_LOW_STOCK", "MEDICATION_REFILL"].includes(type)) {
      return {
        icon: AlertTriangle,
        bgColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        badge: isAr ? "مخزون منخفض" : "Low Stock",
        route: "/refills",
      };
    }
    if (["CAREGIVER_INVITATION", "RELATIONSHIP_REQUEST", "RELATIONSHIP_ACCEPTED", "RELATIONSHIP_REJECTED"].includes(type)) {
      return {
        icon: Users,
        bgColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
        badge: isAr ? "دعوة ربط" : "Care Connection",
        route: isCaregiverRole ? "/patients" : "/caregivers",
      };
    }
    return {
      icon: Bell,
      bgColor: "bg-primary/10 text-primary border-primary/20",
      badge: isAr ? "إشعار عام" : "Notification",
      route: "/notifications",
    };
  };

  return (
    <MainLayout activePath="/notifications" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest dark:bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-extrabold shadow-2xs">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-on-surface">
                  {isAr ? "مركز الإشعارات والتنبيهات" : "Notifications & Alerts"}
                </h1>
                {totalUnreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-black animate-pulse">
                    {totalUnreadCount} {isAr ? "جديد" : "new"}
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant mt-1 font-medium">
                {isAr
                  ? "متابعة طلبات الربط والتنبيهات بالجرعات وتحديثات الطلبات في مكان واحد."
                  : "Track connection invites, dose reminders, and pharmacy order updates."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => refetchNotifications()}
              className="p-2.5 rounded-xl border border-outline-variant/30 bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface cursor-pointer"
              title={isAr ? "تحديث البيانات" : "Refresh notifications"}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{isAr ? "تحديد الكل كمقروء" : "Mark all as read"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation / Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "ALL"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{isAr ? "الكل" : "All"}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black">
              {notifications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("INVITES")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "INVITES"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{isAr ? "طلبات الربط والدعوات" : "Care Invites"}</span>
            {pendingIncoming.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                {pendingIncoming.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("MEDICATIONS")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "MEDICATIONS"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>{isAr ? "تنبيهات الأدوية" : "Medication Alerts"}</span>
          </button>

          <button
            onClick={() => setActiveTab("ORDERS")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "ORDERS"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isAr ? "تحديثات الطلبات والصيدلية" : "Pharmacy Orders"}</span>
          </button>
        </div>

        {/* SECTION 1: Pending Caregiver & Patient Connection Invitations (Interactive Action Cards) */}
        {(activeTab === "ALL" || activeTab === "INVITES") && pendingIncoming.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-on-surface flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>{isAr ? "طلبات الربط المعلقة التي تتطلب إجراءً" : "Action Required: Connection Invites"}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingIncoming.map((invite) => {
                const partnerName = isCaregiverRole
                  ? (invite.patientId ? `${invite.patientId.firstName || ""} ${invite.patientId.lastName || ""}`.trim() || invite.patientId.email : (isAr ? "مريض جديد" : "New Patient"))
                  : (invite.caregiverId ? `${invite.caregiverId.firstName || ""} ${invite.caregiverId.lastName || ""}`.trim() || invite.caregiverId.email : (isAr ? "مقدم رعاية جديد" : "New Caregiver"));

                const phone = isCaregiverRole ? invite.patientId?.phone : invite.caregiverId?.phone;
                const isMutating = isCaregiverRole ? caregiverUpdateStatus.isPending : patientUpdateStatus.isPending;
                const relId = invite.relationshipId || invite._id || invite.id;

                return (
                  <div
                    key={relId}
                    className="p-5 border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-surface-container-lowest dark:to-surface-container-low rounded-3xl flex flex-col justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-on-surface text-base">
                            {partnerName}
                          </h3>
                          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                            {isAr ? `الصفة / صلة القرابة: ${invite.relation || "دائرة الرعاية"}` : `Relation: ${invite.relation || "Care Circle"}`}
                            {phone && ` • ${phone}`}
                          </p>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        {isAr ? "طلب معلق" : "Pending"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/20">
                      <button
                        onClick={() => handleRelationshipAction(relId, "ACCEPTED")}
                        disabled={isMutating}
                        className="flex-1 py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isAr ? "قبول طلب الربط" : "Accept Invitation"}</span>
                      </button>

                      <button
                        onClick={() => handleRelationshipAction(relId, "REJECTED")}
                        disabled={isMutating}
                        className="py-2.5 px-4 rounded-2xl border border-rose-200 dark:border-rose-900 bg-surface-container-lowest dark:bg-surface-container-low hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 active:scale-95 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{isAr ? "رفض" : "Decline"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Outgoing Invites */}
        {(activeTab === "ALL" || activeTab === "INVITES") && pendingOutgoing.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{isAr ? "طلبات أرسلتها وبانتظار الموافقة" : "Pending Outgoing Invitations"}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingOutgoing.map((invite) => {
                const partnerName = isCaregiverRole
                  ? (invite.patientId ? `${invite.patientId.firstName || ""} ${invite.patientId.lastName || ""}`.trim() || invite.patientId.email : (isAr ? "مريض" : "Patient"))
                  : (invite.caregiverId ? `${invite.caregiverId.firstName || ""} ${invite.caregiverId.lastName || ""}`.trim() || invite.caregiverId.email : (isAr ? "مقدم رعاية" : "Caregiver"));
                const relId = invite.relationshipId || invite._id || invite.id;

                return (
                  <div
                    key={relId}
                    className="p-4 border border-outline-variant/30 bg-surface-container-lowest dark:bg-surface-container-low rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface text-xs">{partnerName}</h4>
                        <p className="text-[11px] text-on-surface-variant">
                          {isAr ? "تم إرسال الدعوة، بانتظار تأكيد الطرف الآخر" : "Invitation sent, waiting for confirmation"}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
                      {isAr ? "بانتظار الرد" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: List of Persisted System & Socket Notifications */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-on-surface flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>{isAr ? "سجل الإشعارات والتحديثات" : "Notifications & Activity Log"}</span>
          </h2>

          {loadingSocket ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl border border-outline-variant/30">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="text-xs text-on-surface-variant font-semibold">
                {isAr ? "جاري تحميل الإشعارات..." : "Loading notifications..."}
              </p>
            </div>
          ) : filteredDbNotifications.length === 0 && pendingIncoming.length === 0 ? (
            <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-3xl p-12 text-center text-on-surface-variant flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">
                  {isAr ? "لا توجد إشعارات في هذا القسم حالياً" : "No notifications in this tab"}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  {isAr ? "ستظهر الإشعارات والتنبيهات الجديدة هنا فور حدوثها." : "New notifications and updates will appear here."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredDbNotifications.map((notif) => {
                const notifId = notif._id || notif.id || notif.notificationId;
                const isUnread = !notif.isRead;
                const title = isAr && notif.titleAr ? notif.titleAr : notif.title;
                const message = isAr && notif.messageAr ? notif.messageAr : notif.message;
                const { icon: NotifIcon, bgColor, badge, route } = getNotificationDetails(notif);
                const timeString = notif.createdAt
                  ? new Date(notif.createdAt).toLocaleTimeString(isAr ? "ar-EG" : "en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : (isAr ? "الآن" : "Just now");

                const dateString = notif.createdAt
                  ? new Date(notif.createdAt).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "";

                const orderStatus = notif.data?.orderStatus;
                const orderBadge = orderStatus ? getOrderStatusBadge(orderStatus) : null;

                return (
                  <div
                    key={notifId}
                    className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isUnread
                        ? "bg-teal-500/5 dark:bg-teal-950/20 border-teal-500/30 shadow-2xs"
                        : "bg-surface-container-lowest dark:bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/60"
                    }`}
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl border ${bgColor} flex items-center justify-center shrink-0 font-bold shadow-2xs`}>
                        <NotifIcon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={`text-sm ${isUnread ? "font-black text-on-surface" : "font-bold text-on-surface"}`}>
                            {title}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${bgColor}`}>
                            {badge}
                          </span>
                          {orderBadge && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${orderBadge.color}`}>
                              {orderBadge.label}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {message}
                        </p>

                        <div className="flex items-center gap-3 pt-1 text-[11px] text-on-surface-variant font-medium">
                          <span>{timeString}</span>
                          {dateString && <span>• {dateString}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {route && (
                        <Link
                          href={route}
                          onClick={() => isUnread && markAsRead(notifId)}
                          className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>{isAr ? "عرض التفاصيل" : "View Details"}</span>
                          {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                        </Link>
                      )}

                      {isUnread && (
                        <button
                          onClick={() => markAsRead(notifId)}
                          className="p-2 rounded-xl text-teal-600 hover:bg-teal-500/10 transition-colors cursor-pointer"
                          title={isAr ? "تمييز كمقروء" : "Mark read"}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => deleteNotification(notifId)}
                        className="p-2 rounded-xl text-on-surface-variant hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title={isAr ? "حذف الإشعار" : "Delete notification"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
