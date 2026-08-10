'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  ArrowLeft, 
  Activity, 
  Calendar, 
  AlertCircle, 
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18nContext';
import { AppCard, AppBadge } from '@/shared/components/ui';
import { usePatientConditionsQuery } from '../hooks/useCaregiverQueries';

export function CaregiverPatientRecordsComponent({ patientId }) {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const { data: conditions = [], isLoading, isError } = usePatientConditionsQuery(patientId);

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

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-on-surface flex items-center gap-3">
          <FileText className="w-8 h-8 text-amber-500" />
          <span>{isAr ? 'السجلات والحالات الصحية للمريض' : 'Patient Health Records'}</span>
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {isAr ? 'متابعة الأمراض المزمنة والحادة والملاحظات الطبية المسجلة للمريض.' : 'Overview of recorded chronic/acute medical conditions and diagnosis notes.'}
        </p>
      </div>

      {/* Conditions List */}
      <AppCard className="p-6 border border-outline-variant/30 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            <span>{isAr ? 'قائمة الحالات التشخيصية' : 'Diagnosed Conditions Roster'}</span>
          </h2>

          <span className="text-xs font-bold text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-xl">
            {conditions.length} {isAr ? 'حالات' : 'Recorded'}
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-surface-container-low animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-6 bg-red-500/10 text-center text-red-500 font-semibold rounded-2xl">
            {isAr ? 'تعذر تحميل السجلات الطبية' : 'Failed to load medical records'}
          </div>
        ) : conditions.length === 0 ? (
          <div className="text-center py-12 bg-surface-container-low/40 rounded-2xl">
            <FileText className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-on-surface-variant">
              {isAr ? 'لا توجد حالات صحية مسجلة لهذا المريض' : 'No medical conditions recorded for this patient'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {conditions.map((cond) => (
              <div 
                key={cond._id}
                className="p-5 bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-on-surface text-base">
                        {cond.diseaseName}
                      </h3>
                      {cond.diagnosedDate && (
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {isAr ? 'تاريخ التشخيص: ' : 'Diagnosed: '}
                          {new Date(cond.diagnosedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <AppBadge variant={cond.isChronic ? 'warning' : 'info'}>
                    {cond.isChronic ? (isAr ? 'مرض مزمن' : 'Chronic') : (isAr ? 'حالة حادة' : 'Acute')}
                  </AppBadge>
                </div>

                {cond.notes && (
                  <div className="text-xs text-on-surface-variant bg-surface-container-low/60 p-3 rounded-xl">
                    <span className="font-bold text-on-surface block mb-0.5">{isAr ? 'ملاحظات طبيب/مريض:' : 'Clinical Notes:'}</span>
                    <span>{cond.notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AppCard>
    </div>
  );
}
export default CaregiverPatientRecordsComponent;
