'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar as CalendarIcon,
  AlertCircle,
  Pill,
  Award
} from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18nContext';
import { AppCard, AppButton, AppBadge, AppProgressBar } from '@/shared/components/ui';
import {
  usePatientDosesQuery,
  useConfirmCaregiverDoseMutation,
  useSkipCaregiverDoseMutation
} from '../hooks/useCaregiverQueries';

export function CaregiverPatientAdherenceComponent({ patientId }) {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: doses = [], isLoading, isError } = usePatientDosesQuery(patientId, selectedDate);
  const confirmMutation = useConfirmCaregiverDoseMutation(patientId);
  const skipMutation = useSkipCaregiverDoseMutation(patientId);

  const totalDoses = doses.length;
  const takenDoses = doses.filter((d) => d.status === 'TAKEN').length;
  const skippedDoses = doses.filter((d) => d.status === 'SKIPPED').length;
  const missedDoses = doses.filter((d) => d.status === 'MISSED').length;
  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Back Link */}
      <div>
        <Link
          href={`/patients/${patientId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{isAr ? 'العودة لمركز المريض' : 'Back to Patient Hub'}</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-emerald-500" />
            <span>{isAr ? 'متابعة سجل الالتزام بالجرعات' : 'Dose Adherence Tracker'}</span>
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {isAr ? 'استعراض الالتزام اليومي والجرعات المؤكدة والفائتة للمريض.' : 'Review daily dose completion and verify dose events.'}
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-surface-container-lowest dark:bg-surface-container-low p-2 rounded-2xl border border-outline-variant/30 shrink-0">
          <CalendarIcon className="w-4 h-4 text-primary" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-on-surface focus:outline-none"
          />
        </div>
      </div>

      {/* Adherence Score Card & Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AppCard className="md:col-span-1 p-6 border border-outline-variant/30 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent text-center flex flex-col items-center justify-center">
          <Award className="w-10 h-10 text-emerald-500 mb-2" />
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{adherenceRate}%</span>
          <span className="text-xs font-bold text-on-surface-variant mt-1 uppercase tracking-wider">
            {isAr ? 'نسبة الالتزام اليومي' : 'Daily Adherence'}
          </span>
        </AppCard>

        <AppCard className="md:col-span-3 p-6 border border-outline-variant/30 rounded-3xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-extrabold text-on-surface">
              <span>{isAr ? 'تقدم الجرعات المكتملة' : 'Dose Progress'}</span>
              <span>{takenDoses} / {totalDoses} {isAr ? 'جرعة' : 'doses'}</span>
            </div>
            <AppProgressBar value={adherenceRate} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 mt-4 border-t border-outline-variant/20 text-center">
            <div>
              <span className="text-xs font-semibold text-on-surface-variant block">{isAr ? 'مكتملة' : 'Taken'}</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{takenDoses}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-on-surface-variant block">{isAr ? 'متخظاة' : 'Skipped'}</span>
              <span className="text-xl font-bold text-on-surface-variant">{skippedDoses}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-on-surface-variant block">{isAr ? 'فائتة' : 'Missed'}</span>
              <span className="text-xl font-bold text-red-500">{missedDoses}</span>
            </div>
          </div>
        </AppCard>
      </div>

      {/* Doses List for Selected Date */}
      <AppCard className="p-6 border border-outline-variant/30 rounded-3xl">
        <h2 className="text-lg font-extrabold text-on-surface mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <span>
            {isAr ? `جدول الجرعات ليوم (${selectedDate})` : `Dose Timeline for ${selectedDate}`}
          </span>
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-surface-container-low animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-6 bg-red-500/10 text-center text-red-500 font-semibold rounded-2xl">
            {isAr ? 'تعذر تحميل سجل الجرعات' : 'Failed to load doses timeline'}
          </div>
        ) : doses.length === 0 ? (
          <div className="text-center py-12 bg-surface-container-low/40 rounded-2xl">
            <Clock className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-on-surface-variant">
              {isAr ? 'لا توجد جرعات مجدولة في هذا التاريخ' : 'No dose events for this date'}
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
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-base ${isTaken ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                        isSkipped ? 'bg-surface-container-high text-on-surface-variant' :
                          isMissed ? 'bg-red-500/20 text-red-600' : 'bg-primary/10 text-primary'
                      }`}>
                      <Pill className="w-6 h-6" />
                    </div>

                    <div>
                      <h4 className="font-extrabold text-on-surface text-base">
                        {dose.medicationName || 'Medication'}
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {isAr ? 'الموعد المجدول: ' : 'Scheduled: '}
                        <span className="font-bold text-on-surface">{timeStr}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions or Status Badge */}
                  {isPending ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <AppButton
                        size="sm"
                        variant="primary"
                        onClick={() => confirmMutation.mutate({ doseEventId: doseId })}
                        isLoading={confirmMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1 rtl:ml-1" />
                        {isAr ? 'تأكيد التناول' : 'Confirm Taken'}
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
                  ) : (
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
  );
}
export default CaregiverPatientAdherenceComponent;
