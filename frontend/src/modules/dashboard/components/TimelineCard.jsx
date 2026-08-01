'use client';
import React, { useState } from 'react';
import { AppCard } from '@/shared/components/ui/AppCard';
import { TimelineItem } from './TimelineItem';
import { useTranslation } from '@/shared/lib/i18nContext';
export const TimelineCard = () => {
    const { locale, t } = useTranslation();
    const initialItems = [
        {
            id: '1',
            timeSlot: t('patient.home.morningDose'),
            medication: locale === 'ar' ? 'ليزينوبريل • تم التناول الساعة 07:45 ص' : 'Lisinopril • Taken at 07:45 AM',
            time: '08:00 AM',
            status: 'completed',
        },
        {
            id: '2',
            timeSlot: t('patient.home.lunchtimeDose'),
            medication: locale === 'ar' ? 'أتورفاستاتين 10مجم - قرص واحد' : 'Atorvastatin 10mg - 1 Tablet',
            time: '01:00 PM',
            status: 'due',
        },
        {
            id: '3',
            timeSlot: t('patient.home.eveningDose'),
            medication: locale === 'ar' ? 'سيدوفاج/ميتفورمين 500مجم - قادمة' : 'Metformin 500mg - Upcoming',
            time: '08:00 PM',
            status: 'upcoming',
        },
    ];
    const [items, setItems] = useState(initialItems);
    const handleMarkAsTaken = (id) => {
        setItems((prev) => prev.map((item) => item.id === id
            ? {
                ...item,
                status: 'completed',
                medication: `${item.medication.split(' - ')[0]} • ${locale === 'ar' ? 'تم التناول الآن' : 'Taken just now'}`,
            }
            : item));
    };
    const handleSnooze = (id) => {
        alert(locale === 'ar' ? 'تم الغفوة لمدة 15 دقيقة' : 'Snoozed for 15 minutes');
    };
    const formattedDate = new Date().toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric',
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

      {/* Timeline Items List */}
      <div className="space-y-0">
        {items.map((item, index) => (<TimelineItem key={item.id} item={item} isFirst={index === 0} isLast={index === items.length - 1} onMarkAsTaken={handleMarkAsTaken} onSnooze={handleSnooze}/>))}
      </div>
    </AppCard>);
};
