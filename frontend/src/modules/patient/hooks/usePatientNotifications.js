import { useMemo } from "react";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useSocketNotifications } from "@/shared/hooks/useSocketNotifications";
import {
  usePatientMedicationsQuery,
  usePatientDosesQuery,
  usePatientRelationshipsQuery
} from "./usePatientQueries";

export function usePatientNotifications() {
  const { locale } = useTranslation();
  const dateStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const { notifications: dbNotifications = [], loading: loadingSocketNotifs } = useSocketNotifications();
  const { data: medications = [], isLoading: loadingMeds, error: errorMeds, refetch: refetchMeds } = usePatientMedicationsQuery();
  const { data: doses = [], isLoading: loadingDoses, error: errorDoses, refetch: refetchDoses } = usePatientDosesQuery(dateStr);
  const { data: relationships = [], isLoading: loadingRels, error: errorRels, refetch: refetchRels } = usePatientRelationshipsQuery();

  const alerts = useMemo(() => {
    const items = [];

    // 0. Real-time DB Socket Notifications
    dbNotifications.forEach((notif) => {
      items.push({
        id: notif.id || notif.notificationId,
        type: notif.type,
        title: locale === "ar" && notif.titleAr ? notif.titleAr : notif.title,
        description: locale === "ar" && notif.messageAr ? notif.messageAr : notif.message,
        time: notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
        icon: "notifications",
        color: "text-primary bg-primary/10",
        isRead: notif.isRead,
      });
    });

    // 1. Stock Refills
    medications.forEach((med) => {
      if (med.inventory?.currentQuantity <= med.inventory?.refillThreshold) {
        items.push({
          id: `refill-${med.medicationId || med.id}`,
          type: "refill",
          title: locale === "ar" ? "تنبيه إعادة التعبئة" : "Refill Reminder",
          description: locale === "ar" 
            ? `مخزون دواء ${med.name} منخفض. متبقي ${med.inventory?.currentQuantity} جرعات فقط.` 
            : `Your ${med.name} cabinet inventory is low. Only ${med.inventory?.currentQuantity} doses remaining.`,
          time: locale === "ar" ? "الآن" : "Just now",
          icon: "pill",
          color: "text-tertiary bg-tertiary/10"
        });
      }
    });

    // 2. Missed Doses
    doses.forEach((dose) => {
      if (dose.status === "MISSED") {
        const timeFormatted = dose.scheduledFor
          ? new Date(dose.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
          : "today";
        items.push({
          id: `missed-${dose.doseEventId || dose.id}`,
          type: "missed",
          title: locale === "ar" ? "جرعة فائتة" : "Missed Medication Dose",
          description: locale === "ar"
            ? `لقد فاتتك الجرعة المجدولة لدواء ${dose.medicationName} في تمام الساعة ${timeFormatted} اليوم.`
            : `You missed your scheduled dose of ${dose.medicationName} at ${timeFormatted} today.`,
          time: locale === "ar" ? "اليوم" : "Today",
          icon: "warning",
          color: "text-error bg-error/10"
        });
      }
    });

    // 3. Relationships & Connection Requests
    relationships.forEach((rel) => {
      const cg = rel.caregiverId;
      const cgName = cg ? `${cg.firstName || ''} ${cg.lastName || ''}`.trim() || cg.email || "Caregiver" : "Caregiver";
      if (rel.status === "ACCEPTED") {
        items.push({
          id: `rel-active-${rel.relationshipId || rel.id}`,
          type: "caregiver",
          title: locale === "ar" ? "رابط الرعاية نشط" : "Care Circle Link Active",
          description: locale === "ar"
            ? `يتصل ${cgName} الآن بدائرة الرعاية الخاصة بك ويمكنه مساعدتك في تتبع الأدوية.`
            : `${cgName} is now connected to your care circle and can assist in medication tracking.`,
          time: locale === "ar" ? "متصل" : "Connected",
          icon: "group",
          color: "text-secondary bg-secondary/10"
        });
      } else if (rel.status === "PENDING") {
        if (rel.initiatedBy === "CAREGIVER") {
          items.push({
            id: `rel-request-${rel.relationshipId || rel.id}`,
            type: "request",
            title: locale === "ar" ? "طلب ربط من مقدم رعاية" : "Caregiver Connection Request",
            description: locale === "ar"
              ? `طلب ${cgName} الانضمام لدائرة الرعاية الخاصة بك لمتابعة خطتك العلاجية.`
              : `${cgName} sent a connection request to join your care circle.`,
            time: locale === "ar" ? "طلب جديد" : "New Request",
            icon: "person_add",
            color: "text-amber-600 bg-amber-500/10",
            relationshipId: rel.relationshipId || rel.id,
            initiatedBy: "CAREGIVER",
            isActionable: true,
          });
        } else {
          items.push({
            id: `rel-pending-${rel.relationshipId || rel.id}`,
            type: "caregiver",
            title: locale === "ar" ? "تم إرسال الدعوة" : "Invitation Sent",
            description: locale === "ar"
              ? `دعوة ${cgName} للانضمام لدائرة الرعاية معلقة بانتظار قبول مقدم الرعاية.`
              : `Invitation sent to ${cgName} is pending caregiver acceptance.`,
            time: locale === "ar" ? "معلقة" : "Pending",
            icon: "hourglass_top",
            color: "text-primary bg-primary/10"
          });
        }
      }
    });

    if (items.length === 0) {
      items.push({
        id: "welcome-alert",
        type: "info",
        title: locale === "ar" ? "تحديث النظام" : "System Update",
        description: locale === "ar"
          ? "مرحباً بك في ميدي مايند! لوحة المعلومات وجدول الأدوية الخاص بك محدثان بالكامل."
          : "Welcome to MediMind! Your profile dashboard and medication schedule are fully up-to-date.",
        time: locale === "ar" ? "الآن" : "Now",
        icon: "info",
        color: "text-primary bg-primary/10"
      });
    }

    return items;
  }, [medications, doses, relationships, locale]);

  const refetchAll = () => {
    refetchMeds();
    refetchDoses();
    refetchRels();
  };

  const queryError = errorMeds || errorDoses || errorRels;

  return {
    alerts,
    loading: loadingMeds || loadingDoses || loadingRels,
    error: queryError ? "Failed to load notifications." : null,
    refetch: refetchAll
  };
}
