'use client';
import React, { useMemo, useState } from 'react';
import { AppCard } from '@/shared/components/ui/AppCard';
import { TimelineItem } from './TimelineItem';
import { useTranslation } from '@/shared/lib/i18nContext';
import { CheckCircle2, Clock, Calendar } from 'lucide-react';
import {
  usePatientDosesQuery,
  useConfirmDoseMutation,
  useSkipDoseMutation,
  useSnoozeDoseMutation
} from '@/modules/patient/hooks/usePatientQueries';

export const TimelineCard = () => {
  const { locale, t } = useTranslation();
  const isAr = locale === 'ar';
  const dateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'

  const { data: doses = [], isLoading, error } = usePatientDosesQuery(dateStr);
  const confirmDoseMutation = useConfirmDoseMutation();
  const skipDoseMutation = useSkipDoseMutation();
  const snoozeDoseMutation = useSnoozeDoseMutation();

  const handleMarkAsTaken = (id) => {
    confirmDoseMutation.mutate({ doseEventId: id });
  };

  const handleSnooze = (id) => {
    snoozeDoseMutation.mutate({ doseEventId: id, minutes: 15 });
  };

  const formattedDate = new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });

  // Map & priority-sort doses (DUE/PENDING first, then UPCOMING, then TAKEN)
  const items = useMemo(() => {
    if (!doses || doses.length === 0) return [];

    const mapped = doses.map((dose) => {
      const timeFormatted = dose.scheduledFor
        ? new Date(dose.scheduledFor).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
          })
        : '08:00 AM';

      let status = 'upcoming';
      if (dose.status === 'TAKEN') status = 'completed';
      else if (dose.status === 'MISSED' || dose.status === 'SKIPPED') status = 'missed';
      else if (dose.status === 'PENDING') status = 'due';

      return {
        id: dose.doseEventId || dose._id || dose.id,
        doseEventId: dose.doseEventId || dose._id || dose.id,
        timeSlot: timeFormatted,
        medication: `${dose.medicationName || dose.medicationId?.name || 'Medication'} • ${
          status === 'completed'
            ? isAr ? 'تم التناول' : 'Taken'
            : status === 'missed'
            ? isAr ? 'جرعة فائتة' : 'Missed Dose'
            : isAr ? 'مجدولة' : 'Scheduled'
        }`,
        time: timeFormatted,
        status,
        rawStatus: dose.status,
      };
    });

    // Sort priority: 1. Waiting for taking (DUE/PENDING), 2. Taken (TAKEN/COMPLETED), 3. Missed (MISSED/SKIPPED), then time
    return [...mapped].sort((a, b) => {
      const getStatusPriority = (s) => {
        const status = String(s || '').toUpperCase();
        if (status === 'DUE' || status === 'PENDING') return 0;
        if (status === 'TAKEN' || status === 'COMPLETED') return 1;
        if (status === 'MISSED' || status === 'SKIPPED') return 2;
        return 3;
      };

      const p1 = getStatusPriority(a.rawStatus || a.status);
      const p2 = getStatusPriority(b.rawStatus || b.status);
      if (p1 !== p2) return p1 - p2;

      const t1 = a.scheduledFor ? new Date(a.scheduledFor).getTime() : 0;
      const t2 = b.scheduledFor ? new Date(b.scheduledFor).getTime() : 0;
      return t1 - t2;
    });
  }, [doses, isAr]);

  const pendingCount = useMemo(() => items.filter(i => i.status === 'due' || i.status === 'upcoming').length, [items]);
  const completedCount = useMemo(() => items.filter(i => i.status === 'completed').length, [items]);

  const filteredItems = useMemo(() => {
    if (filter === 'pending') return items.filter(i => i.status === 'due' || i.status === 'upcoming');
    if (filter === 'completed') return items.filter(i => i.status === 'completed');
    return items;
  }, [items, filter]);

  return (
    <AppCard className="p-6 sm:p-7 hover:shadow-md transition-all duration-200 border border-slate-200/80 dark:border-slate-800 rounded-[28px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-inner border border-teal-200/60 dark:border-teal-800/40">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('patient.home.activeTimeline')}
            </h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isAr ? 'متابعة الجرعات والجدول الزمني النشط' : 'Track doses & take instant action'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {items.length > 0 && (
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-3 py-1.5 rounded-full border border-teal-200/80 dark:border-teal-800/60">
              {items.length} {isAr ? 'جرعات اليوم' : 'Doses Today'}
            </span>
          )}
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {t('patient.home.todayDate', { date: formattedDate })}
          </span>
        </div>
      </div>

      {/* Filter Tabs for Large Lists (5+ items) */}
      {items.length >= 5 && (
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/80 text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isAr ? 'الكل' : 'All'} ({items.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              filter === 'pending'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isAr ? 'المعلقة' : 'Pending'} ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isAr ? 'المكتملة' : 'Completed'} ({completedCount})
          </button>
        </div>
      )}

      {/* Content View */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-slate-400 font-bold animate-pulse flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
          <span>{isAr ? 'جاري تحميل الجرعات اليومية...' : 'Loading daily schedule...'}</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-bold text-center">
          {isAr ? 'تعذر تحميل الجرعات اليومية' : 'Failed to load daily doses'}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
              {isAr ? 'ممتاز! لا توجد جرعات متبقية' : 'All caught up!'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              {isAr ? 'أكملت جميع الجرعات المجدولة لهذا اليوم 🎉' : 'No pending doses scheduled for today 🎉'}
            </p>
          </div>
        </div>
      ) : (
        <div className="max-h-[580px] overflow-y-auto overflow-x-hidden snap-y snap-mandatory px-1.5 pr-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {filteredItems.map((item, index) => (
            <TimelineItem
              key={item.id}
              item={item}
              nextItem={filteredItems[index + 1]}
              index={index}
              isFirst={index === 0}
              isLast={index === filteredItems.length - 1}
              onMarkAsTaken={handleMarkAsTaken}
              onSnooze={handleSnooze}
            />
          ))}
        </div>
      )}
    </AppCard>
  );
};

export default TimelineCard;
