'use client';

import React from 'react';
import { Card } from '@/shared/components/ui/Card';
import { AdherenceChart } from '@/shared/components/charts/AdherenceChart';
import { WeeklyChart } from './WeeklyChart';
import { useTranslation } from '@/shared/lib/i18nContext';

export const HealthSummary: React.FC = () => {
  const { locale } = useTranslation();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      {/* Header */}
      <div>
        <h3 className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {locale === 'ar' ? 'ملخص المؤشرات الصحية' : 'Health Summary Panel'}
        </h3>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
          {locale === 'ar' ? 'الالتزام الحيوي بالجرعات' : 'Biometric Waveform'}
        </h2>
      </div>

      {/* Score Display */}
      <div className="flex justify-between items-baseline mt-4 mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            75%
          </span>
        </div>
        <span className="text-[10px] font-extrabold text-[#006C4E] dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
          {locale === 'ar' ? 'تم أخذ ٣ من ٤ جرعات اليوم' : '3 of 4 Doses Taken Today'}
        </span>
      </div>

      {/* Waveform Chart */}
      <AdherenceChart />

      {/* Weekly Compliance */}
      <WeeklyChart />
    </Card>
  );
};
