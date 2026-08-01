'use client';
import React, { useMemo } from 'react';
import { AppCard } from '@/shared/components/ui/AppCard';
import { TimelineItem } from './TimelineItem';
import { useTranslation } from '@/shared/lib/i18nContext';
import {
  usePatientDosesQuery,
  useConfirmDoseMutation,
  useSkipDoseMutation
} from '@/modules/patient/hooks/usePatientQueries';

export const TimelineCard = () => {
    const { locale, t } = useTranslation();
    const isAr = locale === 'ar';
    const dateStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    const { data: doses = [], isLoading, error } = usePatientDosesQuery(dateStr);
    const confirmDoseMutation = useConfirmDoseMutation();
    const skipDoseMutation = useSkipDoseMutation();

    const handleMarkAsTaken = (id) => {
      confirmDoseMutation.mutate({ doseEventId: id });
    };

    const handleSnooze = (id) => {
      skipDoseMutation.mutate({ doseEventId: id });
    };

    const formattedDate = new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric',
    });

    const items = doses.map((dose) => {
      const timeFormatted = dose.scheduledFor
        ? new Date(dose.scheduledFor).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
        : '08:00 AM';

      let status = 'upcoming';
      if (dose.status === 'TAKEN') status = 'completed';
      else if (dose.status === 'MISSED' || dose.status === 'SKIPPED') status = 'missed';
      else if (dose.status === 'PENDING') status = 'due';

      return {
        id: dose.doseEventId || dose._id || dose.id,
        timeSlot: timeFormatted,
        medication: `${dose.medicationName || dose.medicationId?.name || 'Medication'} • ${
          status === 'completed'
            ? (isAr ? 'تم التناول' : 'Taken')
            : status === 'missed'
            ? (isAr ? 'جرعة فائتة' : 'Missed Dose')
            : (isAr ? 'مجدولة' : 'Scheduled')
        }`,
        time: timeFormatted,
        status,
      };
    });

    return (<AppCard className="hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-extrabold text-on-surface tracking-tight">
          {t('patient.home.activeTimeline')}
        </h2>
        <span className="text-xs font-semibold text-on-surface-variant font-mono">
          {t('patient.home.todayDate', { date: formattedDate })}
        </span>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-on-surface-variant animate-pulse">
          {isAr ? 'جاري تحميل الجرعات اليومية...' : 'Loading daily doses...'}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold text-center">
          {isAr ? 'تعذر تحميل الجرعات اليومية' : 'Failed to load daily doses'}
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-sm text-on-surface-variant">
          {isAr ? 'لا توجد جرعات مجدولة لهذا اليوم 🎉' : 'No doses scheduled for today 🎉'}
        </div>
      ) : (
        <div className="space-y-0">
          {items.map((item, index) => (
            <TimelineItem
              key={item.id}
              item={item}
              isFirst={index === 0}
              isLast={index === items.length - 1}
              onMarkAsTaken={handleMarkAsTaken}
              onSnooze={handleSnooze}
            />
          ))}
        </div>
      )}
    </AppCard>);
};
