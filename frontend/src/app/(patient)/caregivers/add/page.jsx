"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useInviteCaregiverMutation } from "@/modules/patient/hooks/usePatientQueries";
import { Card, Button } from "@/shared/components/ui";
import { ArrowLeft, UserPlus, Mail, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export default function AddCaregiverPage() {
  const router = useRouter();
  const { locale } = useTranslation();
  const isAr = locale === "ar";

  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState("spouse");
  const [permissions, setPermissions] = useState({
    canAddMedication: true,
    canViewMedicalRecords: false,
    canOrderRefills: true,
  });
  const [errorMsg, setErrorMsg] = useState("");

  const inviteMutation = useInviteCaregiverMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setErrorMsg("");

    const payload = {
      caregiverEmail: email.trim(),
      relation,
      permissions: {
        canAddMedication: permissions.canAddMedication,
        canEditMedication: permissions.canAddMedication,
        canDeleteMedication: permissions.canAddMedication,
        canViewMedicalRecords: permissions.canViewMedicalRecords,
        canEditMedicalRecords: false,
        canManageAppointments: true,
        canReceiveNotifications: true,
      },
    };

    inviteMutation.mutate(payload, {
      onSuccess: () => {
        alert(isAr ? "تم إرسال دعوة مقدم الرعاية بنجاح!" : "Caregiver invitation sent successfully!");
        router.push("/caregivers");
      },
      onError: (err) => {
        setErrorMsg(
          err?.response?.data?.message ||
            (isAr ? "تعذر إرسال الدعوة. يرجى التحقق من البريد الإلكتروني." : "Failed to send invitation. Please check the email.")
        );
      },
    });
  };

  return (
    <MainLayout activePath="/caregivers">
      <div className="max-w-[800px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/caregivers">
              <ArrowLeft className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">
              {isAr ? "دعوة مقدم رعاية جديد" : "Invite New Caregiver"}
            </h1>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">
              {isAr ? "إضافة أفراد العائلة أو الأطباء لمساعدتك في تتبع خطة العلاج" : "Add family members or healthcare providers to support your care plan."}
            </p>
          </div>
        </div>

        {/* Invitation Form Card */}
        <Card className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 p-8 rounded-3xl shadow-xs space-y-6">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                {isAr ? "البريد الإلكتروني لمقدم الرعاية" : "Caregiver Email Address"}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="caregiver@example.com"
                  className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
                />
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                {isAr ? "صلة القرابة / الصفة" : "Relationship Type"}
              </label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
              >
                <option value="spouse">{isAr ? "الزوج / الزوجة" : "Spouse"}</option>
                <option value="son">{isAr ? "الابن" : "Son"}</option>
                <option value="daughter">{isAr ? "الابنة" : "Daughter"}</option>
                <option value="parent">{isAr ? "الأب / الأم" : "Parent"}</option>
                <option value="sibling">{isAr ? "الأخ / الأخت" : "Sibling"}</option>
                <option value="friend">{isAr ? "صديق" : "Friend"}</option>
                <option value="professional_caregiver">{isAr ? "مقدم رعاية محترف" : "Professional Caregiver"}</option>
                <option value="other">{isAr ? "غير ذلك" : "Other"}</option>
              </select>
            </div>

            {/* Permissions Setup */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {isAr ? "صلاحيات مقدم الرعاية" : "Caregiver Permissions"}
              </label>

              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-on-surface">
                    {isAr ? "السماح وإدارة إضافة الأدوية" : "Can Add & Manage Medications"}
                  </span>
                  <input
                    type="checkbox"
                    checked={permissions.canAddMedication}
                    onChange={(e) => setPermissions({ ...permissions, canAddMedication: e.target.checked })}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-on-surface">
                    {isAr ? "الاطلاع على السجلات الطبية" : "Can View Medical Records"}
                  </span>
                  <input
                    type="checkbox"
                    checked={permissions.canViewMedicalRecords}
                    onChange={(e) => setPermissions({ ...permissions, canViewMedicalRecords: e.target.checked })}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-on-surface">
                    {isAr ? "طلب إعادة تعبئة الأدوية" : "Can Order Medication Refills"}
                  </span>
                  <input
                    type="checkbox"
                    checked={permissions.canOrderRefills}
                    onChange={(e) => setPermissions({ ...permissions, canOrderRefills: e.target.checked })}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={inviteMutation.isPending}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 transition-all h-auto text-base"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {inviteMutation.isPending ? (isAr ? "جاري إرسال الدعوة..." : "Sending Invitation...") : (isAr ? "إرسال الدعوة" : "Send Invitation")}
            </Button>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
