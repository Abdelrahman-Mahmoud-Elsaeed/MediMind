"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useCareCircle } from "../hooks/useCareCircle";
import { Card, Badge, Button, AppDialog, AppInput } from "@/shared/components/ui";
import {
  UserPlus,
  Phone,
  MessageSquare,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Heart,
  Pill,
  Calendar,
  Send,
  MoreVertical,
  Activity,
  Users,
  Award,
  Zap,
  TrendingUp,
  X,
  Trash2
} from "lucide-react";

export default function CareCircleComponent() {
  const { t, locale, dir } = useTranslation();
  const isAr = locale === "ar" || dir === "rtl";

  const {
    caregiverRelationships,
    patientRelationships,
    loading,
    error,
    actionError,
    actionSuccess,
    userRole,
    sendInvitation,
    revokeRelationship,
    updatePermissions,
    emailInput,
    setEmailInput,
    canManageMeds,
    setCanManageMeds,
    canViewRecords,
    setCanViewRecords,
    submitting,
    validationError
  } = useCareCircle();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: null, target: null });

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-bold">{isAr ? "جاري تحميل دائرة الرعاية..." : "Loading Care Circle..."}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 pb-24" dir={dir}>
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-800 text-white p-6 sm:p-10 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>{isAr ? "شبكة الدعم والمساندة" : "Care Network"}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {isAr ? "دائرة الرعاية الصحية" : "Care Circle"}
              </h1>
              <p className="text-teal-100 text-sm sm:text-base leading-relaxed">
                {isAr
                  ? "ربط فوري وآمن بين المرضى ومقدمي الرعاية لمتابعة الالتزام الدوائي، وتلقي الإشعارات الفورية، وضمان السلامة الصحية على مدار الساعة."
                  : "Seamlessly connect patients with family and professional caregivers to monitor medication adherence and stay updated."}
              </p>
            </div>

            <Button
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-white hover:bg-teal-50 text-teal-800 font-extrabold shadow-lg rounded-2xl px-6 py-6 text-sm shrink-0 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-5 h-5" />
              <span>{isAr ? "دعوة مقدم رعاية" : "Invite Caregiver"}</span>
            </Button>
          </div>
        </div>

        {/* Global Notifications */}
        {actionError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-xs">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Care Circle Roster */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              <span>{isAr ? "أعضاء دائرة الرعاية المرتبطون" : "Active Care Circle Members"}</span>
            </h2>
            <Badge variant="outline" className="font-bold border-teal-500 text-teal-600">
              {caregiverRelationships.length} {isAr ? "مترابطون" : "Members"}
            </Badge>
          </div>

          {caregiverRelationships.length === 0 ? (
            <Card className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
              <Users className="w-12 h-12 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                  {isAr ? "لا يوجد مقدمو رعاية مرتبطون حتى الآن" : "No Caregivers Linked Yet"}
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  {isAr
                    ? "قم بإرسال دعوة لمقدم الرعاية أو أفراد عائلتك لمتابعة حالتك الصحية وجدول الأدوية."
                    : "Invite your family or professional caregiver to stay updated on your medication adherence."}
                </p>
              </div>
              <Button onClick={() => setIsInviteModalOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl">
                <UserPlus className="w-4 h-4 mr-2" />
                {isAr ? "إرسال أول دعوة" : "Send First Invitation"}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {caregiverRelationships.map((rel) => {
                const cg = rel.caregiver || {};
                const u = cg.user || {};
                const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || (isAr ? "مقدم رعاية" : "Caregiver");

                return (
                  <Card key={rel.id} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 font-black text-xl flex items-center justify-center border border-teal-500/20">
                            {name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{name}</h3>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>

                        <Badge variant={rel.status === "ACTIVE" ? "default" : "secondary"}>
                          {rel.status === "ACTIVE" ? (isAr ? "نشط" : "Active") : (isAr ? "معلق" : "Pending")}
                        </Badge>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <div className="flex justify-between">
                          <span>{isAr ? "إدارة الأدوية:" : "Manage Meds:"}</span>
                          <span className={rel.canManageMeds ? "text-teal-600 font-bold" : "text-slate-400"}>
                            {rel.canManageMeds ? (isAr ? "مفعل" : "Allowed") : (isAr ? "غير مفعل" : "Disabled")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{isAr ? "عرض السجلات:" : "View Records:"}</span>
                          <span className={rel.canViewRecords ? "text-teal-600 font-bold" : "text-slate-400"}>
                            {rel.canViewRecords ? (isAr ? "مفعل" : "Allowed") : (isAr ? "غير مفعل" : "Disabled")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeRelationship(rel.id)}
                        className="w-full text-rose-600 hover:bg-rose-50 border-rose-200 font-bold"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        {isAr ? "إلغاء الربط" : "Revoke Access"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Invite Caregiver Modal using AppDialog */}
      <AppDialog
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        title={t('caregiver.careCircle.inviteTitle')}
        description={t('caregiver.careCircle.inviteSubtitle')}
      >
        {validationError && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 p-3 rounded-xl text-xs font-bold mb-4">
            {validationError}
          </div>
        )}

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await sendInvitation(e);
            setIsInviteModalOpen(false);
          }}
          className="space-y-4 text-xs font-bold"
        >
          <AppInput
            type="email"
            required
            label={t('caregiver.careCircle.caregiverEmail')}
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="caregiver@example.com"
          />

          <div className="space-y-2 pt-1">
            <span className="block text-slate-500 uppercase tracking-wider">{t('caregiver.careCircle.accessPermissions')}</span>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span>{t('caregiver.careCircle.manageMeds')}</span>
              <input
                type="checkbox"
                checked={canManageMeds}
                onChange={(e) => setCanManageMeds(e.target.checked)}
                className="w-4 h-4 accent-teal-600 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span>{t('caregiver.careCircle.viewRecords')}</span>
              <input
                type="checkbox"
                checked={canViewRecords}
                onChange={(e) => setCanViewRecords(e.target.checked)}
                className="w-4 h-4 accent-teal-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
              <Send className="w-3.5 h-3.5 mr-1" />
              {submitting ? t('caregiver.careCircle.sendingInvite') : t('caregiver.careCircle.sendInvite')}
            </Button>
          </div>
        </form>
      </AppDialog>
    </MainLayout>
  );
}
