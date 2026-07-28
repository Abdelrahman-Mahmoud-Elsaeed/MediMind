'use client';

import React from 'react';
import { AppCard } from '@/shared/components/ui/AppCard';
import { AppBadge } from '@/shared/components/ui/AppBadge';
import { AdherenceChart } from '@/shared/components/charts/AdherenceChart';
import { WeeklyChart } from './WeeklyChart';
import { useTranslation } from '@/shared/lib/i18nContext';

export const HealthSummary: React.FC = () => {
  const { locale } = useTranslation();

  return (
    <AppCard className="hover:shadow-lg transition-shadow">
      {/* Header */}
      <div>
        <h3 className="text-[11px] font-extrabold text-on-surface-variant uppercase tracking-widest opacity-80">
          {locale === 'ar' ? 'ملخص المؤشرات الصحية' : 'Health Summary Panel'}
        </h3>
        <h2 className="text-2xl font-black text-on-surface tracking-tight mt-0.5">
          {locale === 'ar' ? 'الالتزام الحيوي بالجرعات' : 'Biometric Waveform'}
        </h2>
      </div>

      {/* Score Display */}
      <div className="flex justify-between items-baseline mt-4 mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-on-surface tracking-tight">
            75%
          </span>
        </div>
        <AppBadge variant="default">
          {locale === 'ar' ? 'تم أخذ ٣ من ٤ جرعات اليوم' : '3 of 4 Doses Taken Today'}
        </AppBadge>
      </div>

      {/* Waveform Chart */}
      <AdherenceChart />

      {/* Weekly Compliance */}
      <WeeklyChart />
    </AppCard>
  );
};
