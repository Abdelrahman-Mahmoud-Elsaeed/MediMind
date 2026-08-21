'use client';

import React from 'react';
import { Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18nContext';
import { AppCard, AppBadge } from '@/shared/components/ui';

export function CaregiverPatientAdherenceSummary({ adherenceData }) {
  const { t } = useTranslation();

  const rate = adherenceData?.adherenceRate ?? 85;
  const takenCount = adherenceData?.takenCount ?? 12;
  const missedCount = adherenceData?.missedCount ?? 2;

  return (
    <AppCard className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <Activity className="w-4 h-4" />
          <span>{t('caregiver.patientHub.adherenceSummary')}</span>
        </div>
        <AppBadge variant={rate >= 80 ? 'primaryContainer' : 'secondary'}>
          {rate}% {t('common.nav.adherence')}
        </AppBadge>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="p-4 bg-surface-container-low rounded-2xl text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('caregiver.patientHub.confirmedDoses')}</span>
          </div>
          <span className="text-2xl font-black text-on-surface block">{takenCount}</span>
        </div>

        <div className="p-4 bg-surface-container-low rounded-2xl text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs">
            <ShieldAlert className="w-4 h-4" />
            <span>{t('caregiver.patientHub.missedDoses')}</span>
          </div>
          <span className="text-2xl font-black text-on-surface block">{missedCount}</span>
        </div>
      </div>
    </AppCard>
  );
}

export default CaregiverPatientAdherenceSummary;
