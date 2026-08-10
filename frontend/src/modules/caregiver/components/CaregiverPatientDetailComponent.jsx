'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Pill, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ArrowLeft, 
  Heart, 
  Calendar, 
  ShieldCheck,
  ChevronRight,
  Activity
} from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18nContext';
import { AppCard, AppButton, AppBadge, AppProgressBar } from '@/shared/components/ui';
import { 
  usePatientMedicationsQuery, 
  usePatientDosesQuery, 
  usePatientConditionsQuery,
  useConfirmCaregiverDoseMutation,
  useSkipCaregiverDoseMutation
} from '../hooks/useCaregiverQueries';

export function CaregiverPatientDetailComponent({ patientId }) {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const todayStr = new Date().toISOString().split('T')[0];

  const { data: medications = [], isLoading: loadingMeds } = usePatientMedicationsQuery(patientId);
  const { data: doses = [], isLoading: loadingDoses } = usePatientDosesQuery(patientId, todayStr);
  const { data: conditions = [], isLoading: loadingConditions } = usePatientConditionsQuery(patientId);

  const confirmMutation = useConfirmCaregiverDoseMutation(patientId);
  const skipMutation = useSkipCaregiverDoseMutation(patientId);

  // Compute adherence summary metrics
  const totalDosesToday = doses.length;
  const takenDosesToday = doses.filter((d) => d.status === 'TAKEN').length;
  const missedDosesToday = doses.filter((d) => d.status === 'MISSED').length;
  const adherenceRate = totalDosesToday > 0 ? Math.round((takenDosesToday / totalDosesToday) * 100) : 100;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Navigation Back Link */}
      <div>
        <Link 
          href="/patients"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{isAr ? 'العودة لقائمة المرضى' : 'Back to Patients Roster'}</span>
        </Link>
      </div>

      {/* Patient Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary font-black text-2xl shadow-md shadow-primary/20 shrink-0">
              P
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>{isAr ? 'ملف المريض المرتبط' : 'Linked Patient Profile'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                {isAr ? 'مركز متابعة المريض' : 'Patient Care Hub'}
              </h1>
              <p className="text-xs text-on-surface-variant mt-1">
                {isAr ? `معرّف المريض: ${patientId}` : `Patient ID: ${patientId}`}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3.5 text-center min-w-[90px]">
              <span className="text-[10px] font-bold text-on-surface-variant block uppercase">
                {isAr ? 'الأدوية' : 'Meds'}
              </span>
              <span className="text-xl font-black text-primary">{medications.length}</span>
            </div>

            <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3.5 text-center min-w-[90px]">
              <span className="text-[10px] font-bold text-on-surface-variant block uppercase">
                {isAr ? 'الجرعات' : 'Doses'}
              </span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{takenDosesToday}/{totalDosesToday}</span>
            </div>

            <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3.5 text-center min-w-[90px]">
              <span className="text-[10px] font-bold text-on-surface-variant block uppercase">
                {isAr ? 'الحالات' : 'Conditions'}
              </span>
              <span className="text-xl font-black text-amber-500">{conditions.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-outline-variant/20">
        <Link 
          href={`/patients/${patientId}`}
          className="px-4 py-2.5 rounded-2xl bg-primary text-on-primary font-bold text-xs shadow-sm shrink-0 flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          <span>{isAr ? 'نظرة عامة' : 'Overview Hub'}</span>
        </Link>

        <Link 
          href={`/patients/${patientId}/medications`}
          className="px-4 py-2.5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low hover:bg-primary/10 text-on-surface font-semibold text-xs border border-outline-variant/30 shrink-0 flex items-center gap-2 transition-all"
        >
          <Pill className="w-4 h-4 text-primary" />
          <span>{isAr ? 'خزانة الأدوية' : 'Medications Cabinet'}</span>
        </Link>

        <Link 
          href={`/patients/${patientId}/adherence`}
          className="px-4 py-2.5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low hover:bg-emerald-500/10 text-on-surface font-semibold text-xs border border-outline-variant/30 shrink-0 flex items-center gap-2 transition-all"
        >
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span>{isAr ? 'متابعة الالتزام' : 'Adherence Tracker'}</span>
        </Link>

        <Link 
          href={`/patients/${patientId}/medical-records`}
          className="px-4 py-2.5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low hover:bg-amber-500/10 text-on-surface font-semibold text-xs border border-outline-variant/30 shrink-0 flex items-center gap-2 transition-all"
        >
          <FileText className="w-4 h-4 text-amber-500" />
          <span>{isAr ? 'السجلات الطبية' : 'Medical Records'}</span>
        </Link>
      </div>

      {/* Main Grid: Today's Schedule & Medications Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Today's Dose Timeline (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <AppCard className="p-6 border border-outline-variant/30 rounded-3xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-on-surface flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>{isAr ? 'جرعات اليوم وتأكيد التناول' : "Today's Dose Schedule"}</span>
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  {isAr ? 'تأكيد أو إلغاء التناول نيابة عن المريض لتسجيل الالتزام.' : 'Confirm or skip doses on behalf of the patient to log adherence.'}
                </p>
              </div>

              <AppBadge variant={adherenceRate >= 80 ? 'success' : 'warning'}>
                {adherenceRate}% {isAr ? 'التزام' : 'Adherence'}
              </AppBadge>
            </div>

            {loadingDoses ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-surface-container-low animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : doses.length === 0 ? (
              <div className="text-center py-10 bg-surface-container-low/50 rounded-2xl border border-dashed border-outline-variant/30">
                <Clock className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-on-surface-variant">
                  {isAr ? 'لا توجد جرعات مجدولة لهذا اليوم' : 'No doses scheduled for today'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {doses.map((dose) => {
                  const doseId = dose.doseEventId || dose._id;
                  const isTaken = dose.status === 'TAKEN';
                  const isSkipped = dose.status === 'SKIPPED';
                  const isPending = dose.status === 'PENDING';
                  const isMissed = dose.status === 'MISSED';

                  const timeStr = dose.scheduledFor 
                    ? new Date(dose.scheduledFor).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
                    : '08:00 AM';

                  return (
                    <div 
                      key={doseId}
                      className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isTaken ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                          isSkipped ? 'bg-surface-container-high text-on-surface-variant' :
                          isMissed ? 'bg-red-500/20 text-red-600' : 'bg-primary/10 text-primary'
                        }`}>
                          <Pill className="w-5 h-5" />
                        </div>

                        <div>
                          <h4 className="font-bold text-on-surface text-base">
                            {dose.medicationName || 'Medication'}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-0.5">
                            <span className="font-semibold">{timeStr}</span>
                            <span>•</span>
                            <span className="capitalize">{dose.status}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {isPending && (
                        <div className="flex items-center gap-2 shrink-0">
                          <AppButton
                            size="sm"
                            variant="primary"
                            onClick={() => confirmMutation.mutate({ doseEventId: doseId })}
                            isLoading={confirmMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1 rtl:ml-1" />
                            {isAr ? 'تأكيد التناول' : 'Take Dose'}
                          </AppButton>

                          <AppButton
                            size="sm"
                            variant="outline"
                            onClick={() => skipMutation.mutate({ doseEventId: doseId })}
                            isLoading={skipMutation.isPending}
                            className="text-on-surface-variant hover:bg-surface-container-high text-xs font-semibold"
                          >
                            <XCircle className="w-4 h-4 mr-1 rtl:ml-1" />
                            {isAr ? 'تخطي' : 'Skip'}
                          </AppButton>
                        </div>
                      )}

                      {!isPending && (
                        <AppBadge variant={isTaken ? 'success' : isSkipped ? 'secondary' : 'error'}>
                          {isTaken ? (isAr ? 'تم التناول' : 'Taken') : isSkipped ? (isAr ? 'تم التخطي' : 'Skipped') : (isAr ? 'فائتة' : 'Missed')}
                        </AppBadge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </AppCard>
        </div>

        {/* Right Column: Medications & Quick Actions (1 col) */}
        <div className="space-y-6">
          <AppCard className="p-6 border border-outline-variant/30 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-on-surface text-lg flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                <span>{isAr ? 'الأدوية النشطة' : 'Active Cabinet'}</span>
              </h3>
              <Link 
                href={`/patients/${patientId}/medications`}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>{isAr ? 'عرض الكل' : 'View All'}</span>
                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            </div>

            {loadingMeds ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 bg-surface-container-low animate-pulse rounded-xl" />
                ))}
              </div>
            ) : medications.length === 0 ? (
              <p className="text-xs text-on-surface-variant py-4 text-center">
                {isAr ? 'لا توجد أدوية مسجلة' : 'No active medications registered'}
              </p>
            ) : (
              <div className="space-y-3">
                {medications.slice(0, 4).map((med) => (
                  <div 
                    key={med._id}
                    className="p-3 bg-surface-container-low/60 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-on-surface block">{med.name}</span>
                      <span className="text-on-surface-variant">{med.instructions?.relationToMeals || 'Daily'}</span>
                    </div>

                    <AppBadge variant={med.inventory?.currentQuantity <= med.inventory?.refillThreshold ? 'warning' : 'secondary'}>
                      {med.inventory?.currentQuantity ?? 0} {isAr ? 'متبقي' : 'left'}
                    </AppBadge>
                  </div>
                ))}
              </div>
            )}
          </AppCard>

          {/* Chronic Conditions Summary */}
          <AppCard className="p-6 border border-outline-variant/30 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-on-surface text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <span>{isAr ? 'الحالات الصحية' : 'Health Conditions'}</span>
              </h3>
              <Link 
                href={`/patients/${patientId}/medical-records`}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>{isAr ? 'عرض الكل' : 'View All'}</span>
                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            </div>

            {loadingConditions ? (
              <div className="h-16 bg-surface-container-low animate-pulse rounded-xl" />
            ) : conditions.length === 0 ? (
              <p className="text-xs text-on-surface-variant py-4 text-center">
                {isAr ? 'لا توجد حالات صحية مسجلة' : 'No medical conditions recorded'}
              </p>
            ) : (
              <div className="space-y-2">
                {conditions.slice(0, 3).map((cond) => (
                  <div 
                    key={cond._id}
                    className="p-3 bg-surface-container-low/60 rounded-xl flex items-center justify-between text-xs font-semibold text-on-surface"
                  >
                    <span>{cond.diseaseName}</span>
                    <span className="text-xs font-normal text-on-surface-variant">
                      {cond.isChronic ? (isAr ? 'مزمن' : 'Chronic') : (isAr ? 'حاد' : 'Acute')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </AppCard>
        </div>
      </div>
    </div>
  );
}
export default CaregiverPatientDetailComponent;
