"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { useTranslation } from "@/shared/lib/i18nContext";
import {
  usePatientRelationshipsQuery,
  useRevokeRelationshipMutation
} from "@/modules/patient/hooks/usePatientQueries";
import { Card, Badge, Button } from "@/shared/components/ui";
import { showSuccess, showError } from "@/shared/components/ui/toast";
import { ArrowLeft, User, Phone, Mail, ShieldCheck, Trash2, CheckCircle2, Clock } from "lucide-react";

export default function CaregiverDetailPage({ params }) {
  const router = useRouter();
  const unwrappedParams = params && typeof params.then === 'function' ? use(params) : params;
  const caregiverId = unwrappedParams?.id;

  const { locale } = useTranslation();
  const isAr = locale === "ar";

  const { data: relationships = [], isLoading } = usePatientRelationshipsQuery();
  const revokeMutation = useRevokeRelationshipMutation();

  const relationship = relationships.find(
    (r) => String(r.id || r._id || r.relationshipId) === String(relationshipId)
  );

  const handleRevoke = () => {
    if (!relationship) return;
    const confirmMsg = isAr
      ? "هل أنت تأكد من رغبتك في إلغاء هذا الرابط مع مقدم الرعاية؟"
      : "Are you sure you want to revoke access for this caregiver?";
    if (confirm(confirmMsg)) {
      revokeMutation.mutate(relationship.id || relationship._id || relationship.relationshipId, {
        onSuccess: () => {
          showSuccess(isAr ? "تم إلغاء رابط الرعاية بنجاح!" : "Caregiver relationship revoked successfully!", isAr ? "تم بنجاح" : "Success");
          router.push("/caregivers");
        },
        onError: () => {
          showError(isAr ? "تعذر إلغاء رابط الرعاية. يرجى المحاولة مرة أخرى." : "Unable to revoke caregiver access. Please try again.", isAr ? "حدث خطأ" : "Error");
        },
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout activePath="/caregivers">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          <p className="text-sm text-on-surface-variant">{isAr ? "جاري تحميل تفاصيل مقدم الرعاية..." : "Loading caregiver details..."}</p>
        </div>
      </MainLayout>
    );
  }

  if (!relationship) {
    return (
      <MainLayout activePath="/caregivers">
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-on-surface">{isAr ? "لم يتم العثور على مقدم الرعاية" : "Caregiver Not Found"}</h2>
          <Button onClick={() => router.push("/caregivers")} className="bg-teal-600 text-white">
            {isAr ? "العودة لدائرة الرعاية" : "Return to Care Circle"}
          </Button>
        </div>
      </MainLayout>
    );
  }

  const cg = relationship.caregiverId || {};
  const cgName = cg.firstName && cg.lastName ? `${cg.firstName} ${cg.lastName}` : (relationship.relation || "Caregiver");

  return (
    <MainLayout activePath="/caregivers">
      <div className="max-w-[1000px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full">
              <Link href="/caregivers">
                <ArrowLeft className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-on-surface">{cgName}</h1>
              <p className="text-xs text-on-surface-variant font-medium">{relationship.relation || "Caregiver"}</p>
            </div>
          </div>

          <Button
            variant="destructive"
            onClick={handleRevoke}
            disabled={revokeMutation.isPending}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isAr ? "إلغاء الرابط" : "Revoke Access"}
          </Button>
        </div>

        {/* Overview Banner Card */}
        <Card className="bg-surface-container-lowest dark:bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img
              src={cg.profilePictureUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"}
              alt={cgName}
              className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md"
            />
            <div className="space-y-1 text-center sm:text-left rtl:sm:text-right">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <h2 className="text-xl font-bold text-on-surface">{cgName}</h2>
                <Badge variant={relationship.status === "ACCEPTED" ? "success" : "default"}>
                  {relationship.status === "ACCEPTED" ? (isAr ? "رابط نشط" : "Active Link") : (isAr ? "دعوة معلقة" : "Pending Invitation")}
                </Badge>
              </div>
              <p className="text-sm text-on-surface-variant font-medium">{relationship.relation || "Caregiver"}</p>
            </div>
          </div>
        </Card>

        {/* Permissions & Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Permissions Card */}
          <Card className="p-6 rounded-3xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
              <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="font-bold text-lg text-on-surface">{isAr ? "صلاحيات الوصول الممنوحة" : "Granted Access Permissions"}</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400 font-medium">{isAr ? "إدارة الأدوية والجدول" : "Manage Medications"}</span>
                <Badge variant={relationship.permissions?.canAddMedication ? "success" : "secondary"}>
                  {relationship.permissions?.canAddMedication ? (isAr ? "مسموح" : "Granted") : (isAr ? "مغلق" : "Denied")}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400 font-medium">{isAr ? "عرض السجلات الطبية" : "View Medical Records"}</span>
                <Badge variant={relationship.permissions?.canViewMedicalRecords ? "success" : "secondary"}>
                  {relationship.permissions?.canViewMedicalRecords ? (isAr ? "مسموح" : "Granted") : (isAr ? "مغلق" : "Denied")}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 dark:text-slate-400 font-medium">{isAr ? "طلب إعادة تعبئة الأدوية" : "Order Medication Refills"}</span>
                <Badge variant={relationship.permissions?.canOrderRefills ? "success" : "secondary"}>
                  {relationship.permissions?.canOrderRefills ? (isAr ? "مسموح" : "Granted") : (isAr ? "مغلق" : "Denied")}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Contact Information Card */}
          <Card className="p-6 rounded-3xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
              <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="font-bold text-lg text-on-surface">{isAr ? "معلومات الاتصال" : "Contact Details"}</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{isAr ? "البريد الإلكتروني" : "Email"}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{cg.email || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{isAr ? "رقم الهاتف" : "Phone"}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{cg.phone || "+1 (555) 012-3456"}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
