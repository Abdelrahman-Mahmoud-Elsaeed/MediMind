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
    caregiverRelationships = [],
    patientRelationships = [],
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

  const activeRelationships = Array.isArray(caregiverRelationships) ? caregiverRelationships : [];

  if (loading) {
    return null;
  }

  return (
    <MainLayout>
      <div dir={dir} className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-teal-600" />
              <span>{isAr ? "دائرة الرعاية" : "Care Circle"}</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isAr
                ? "إدارة مقدمي الرعاية المرتبطين بحسابك وصلاحيات الاطلاع الممنوحة لهم."
                : "Manage your linked caregivers and configure access permissions for your health profile."}
            </p>
          </div>

          <Button
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>{isAr ? "دعوة مقدم رعاية" : "Invite Caregiver"}</span>
          </Button>
        </div>

        {/* Feedback Alerts */}
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
              <span>{t('caregiver.careCircle.activeMembers', 'Active Care Circle Members')}</span>
            </h2>
            <Badge variant="outline" className="font-bold border-teal-500 text-teal-600">
              {activeRelationships.length} {t('caregiver.careCircle.membersCount', 'Members')}
            </Badge>
          </div>

          {activeRelationships.length === 0 ? (
            <Card className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
              <Users className="w-12 h-12 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                  {t('caregiver.careCircle.noCaregiversLinked', 'No Caregivers Linked Yet')}
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  {t('caregiver.careCircle.noCaregiversDesc', 'Invite your family or professional caregiver to stay updated on your medication adherence.')}
                </p>
              </div>
              <Button onClick={() => setIsInviteModalOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl">
                <UserPlus className="w-4 h-4 mr-2" />
                {t('caregiver.careCircle.sendFirstInvite', 'Send First Invitation')}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRelationships.map((rel) => {
                const cg = rel.caregiverId || rel.caregiver || rel.patientId || rel.patient || {};
                const firstName = cg.firstName || cg.user?.firstName || "";
                const lastName = cg.lastName || cg.user?.lastName || "";
                const email = cg.email || cg.accountId?.email || cg.user?.email || "";
                const phone = cg.phone || "";
                const defaultRoleName = t('caregiver.careCircle.defaultCaregiver', 'Caregiver');
                const name = `${firstName} ${lastName}`.trim() || email || defaultRoleName;

                const rawRelation = (rel.relation || "").toLowerCase();
                const relationKey = `caregiver.careCircle.relations.${rawRelation}`;
                const translatedRelation = t(relationKey);
                const relationLabel = translatedRelation !== relationKey ? translatedRelation : (rel.relation ? (rel.relation.charAt(0).toUpperCase() + rel.relation.slice(1)) : defaultRoleName);

                const canManageMeds = rel.permissions?.canAddMedication ?? rel.permissions?.canManageMeds ?? rel.canManageMeds ?? false;
                const canViewRecords = rel.permissions?.canViewMedicalRecords ?? rel.permissions?.canViewRecords ?? rel.canViewRecords ?? false;
                const isStatusActive = rel.status === "ACTIVE" || rel.status === "ACCEPTED";

                return (
                  <Card key={rel.id || rel._id || rel.relationshipId} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 font-black text-xl flex items-center justify-center border border-teal-500/20">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{name}</h3>
                            <p className="text-xs text-slate-500">{email || phone}</p>
                            <span className="inline-block mt-1 text-[10px] uppercase font-semibold text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md">
                              {relationLabel}
                            </span>
                          </div>
                        </div>

                        <Badge variant={isStatusActive ? "default" : "secondary"}>
                          {isStatusActive ? t('caregiver.careCircle.statusActive', 'Active') : t('caregiver.careCircle.statusPending', 'Pending')}
                        </Badge>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <div className="flex justify-between">
                          <span>{t('caregiver.careCircle.manageMeds', 'Manage Medications')}</span>
                          <span className={canManageMeds ? "text-teal-600 font-bold" : "text-slate-400"}>
                            {canManageMeds ? t('caregiver.careCircle.allowed', 'Allowed') : t('caregiver.careCircle.disabled', 'Disabled')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('caregiver.careCircle.viewRecords', 'View Medical Records')}</span>
                          <span className={canViewRecords ? "text-teal-600 font-bold" : "text-slate-400"}>
                            {canViewRecords ? t('caregiver.careCircle.allowed', 'Allowed') : t('caregiver.careCircle.disabled', 'Disabled')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeRelationship(rel.id || rel.relationshipId)}
                        className="w-full text-rose-600 hover:bg-rose-50 border-rose-200 font-bold"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        {t('caregiver.careCircle.revokeAccess', 'Revoke Access')}
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
