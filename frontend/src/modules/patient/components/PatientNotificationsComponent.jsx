import React from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Users } from "lucide-react";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { useTranslation } from "@/shared/lib/i18nContext";
import { usePatientNotifications } from "../hooks/usePatientNotifications";
import { usePatientRelationshipsQuery, useUpdateRelationshipStatusMutation } from "../hooks/usePatientQueries";

export default function PatientNotificationsComponent() {
  const { t, locale } = useTranslation();
  const isAr = locale === "ar";
  const { alerts, loading: loadingAlerts, error } = usePatientNotifications();

  const { data: relationships = [], isLoading: loadingRels } = usePatientRelationshipsQuery();
  const updateStatusMutation = useUpdateRelationshipStatusMutation();

  // Pending connection requests sent to this patient by caregivers.
  // Some existing records may not carry initiatedBy explicitly, so we also
  // surface pending relationships as caregiver invitations in that fallback case.
  const pendingInvites = relationships.filter((r) => {
    if (r.status !== "PENDING") return false;

    const initiatedBy = String(r.initiatedBy || "").toUpperCase();
    if (initiatedBy) {
      return ["CAREGIVER", "FAMILY_CAREGIVER", "PROFESSIONAL_CAREGIVER", "DOCTOR", "PHARMACIST"].includes(initiatedBy);
    }

    return true;
  });

  const handleResponse = (relationshipId, status) => {
    updateStatusMutation.mutate({ relationshipId, status });
  };

  const loading = loadingAlerts || loadingRels;

  return (
    <MainLayout activePath="/notifications" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <Link
            href="/home"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/20 transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <h1 className="text-2xl font-bold text-on-surface">
            {isAr ? "الإشعارات" : "Notifications"}
          </h1>
        </div>

        {/* Section 1: Pending Caregiver Connection Requests */}
        {pendingInvites.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span>{isAr ? "طلبات ربط مقدمي الرعاية المعلقة" : "Pending Caregiver Invitations"}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingInvites.map((invite) => {
                const caregiverName = invite.caregiverId
                  ? `${invite.caregiverId.firstName || ""} ${invite.caregiverId.lastName || ""}`.trim()
                  : isAr ? "مقدم رعاية جديد" : "New Caregiver";
                const phone = invite.caregiverId?.phone || "";

                return (
                  <div
                    key={invite.relationshipId || invite._id || invite.id}
                    className="p-5 border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl flex flex-col justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-on-surface text-base">
                            {caregiverName}
                          </h3>
                          <p className="text-xs text-on-surface-variant font-medium">
                            {isAr ? `الصفة / صلة القرابة: ${invite.relation || "مقدم رعاية"}` : `Role / Relation: ${invite.relation || "Caregiver"}`}
                            {phone && ` • ${phone}`}
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        {isAr ? "طلب معلق" : "Pending"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-2 border-t border-outline-variant/20">
                      <button
                        onClick={() => handleResponse(invite.relationshipId, "ACCEPTED")}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{isAr ? "قبول الطلب" : "Accept Invitation"}</span>
                      </button>

                      <button
                        onClick={() => handleResponse(invite.relationshipId, "REJECTED")}
                        disabled={updateStatusMutation.isPending}
                        className="py-2 px-3.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-surface-container-lowest dark:bg-surface-container-low hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 active:scale-95 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>{isAr ? "رفض" : "Reject"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 2: General Adherence & Alert Log */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
            <p className="text-sm text-on-surface-variant">
              {isAr ? "جاري تحميل الإشعارات..." : "Loading notifications..."}
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-center font-medium border border-red-500/20">
            {error}
          </div>
        ) : alerts.length === 0 && pendingInvites.length === 0 ? (
          <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 text-slate-400">notifications_off</span>
            <p className="text-sm font-bold">
              {isAr ? "لا توجد إشعارات جديدة حالياً" : "No new notifications right now"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {alerts.map((notification) => (
              <div
                key={notification.id}
                className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 flex items-start gap-4 transition-all hover:bg-surface-container-high"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${notification.color}`}>
                  <span className="material-symbols-outlined">
                    {notification.icon === "pill" ? "medication" : notification.icon}
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-on-surface text-base">{notification.title}</h4>
                    <span className="text-xs text-on-surface-variant">{notification.time}</span>
                  </div>
                  <p className="text-on-surface-variant text-sm leading-snug">{notification.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
