'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { TimelineItem, TimelineItemData } from './TimelineItem';
import { useTranslation } from '@/shared/lib/i18nContext';

export const TimelineCard: React.FC = () => {
  const { locale } = useTranslation();

  const initialItems: TimelineItemData[] = [
    {
      id: '1',
      timeSlot: locale === 'ar' ? 'جرعة الصباح' : 'Morning Dose',
      medication: locale === 'ar' ? 'ليزينوبريل • تم التناول الساعة 07:45 ص' : 'Lisinopril • Taken at 07:45 AM',
      time: '08:00 AM',
      status: 'completed',
    },
    {
      id: '2',
      timeSlot: locale === 'ar' ? 'جرعة الغداء' : 'Lunchtime Dose',
      medication: locale === 'ar' ? 'أتورفاستاتين 10مجم - قرص واحد' : 'Atorvastatin 10mg - 1 Tablet',
      time: '01:00 PM',
      status: 'due',
    },
    {
      id: '3',
      timeSlot: locale === 'ar' ? 'جرعة المساء' : 'Evening Dose',
      medication: locale === 'ar' ? 'سيدوفاج/ميتفورمين 500مجم - قادمة' : 'Metformin 500mg - Upcoming',
      time: '08:00 PM',
      status: 'upcoming',
    },
  ];

  const [items, setItems] = useState<TimelineItemData[]>(initialItems);

  const handleMarkAsTaken = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'completed',
              medication: `${item.medication.split(' - ')[0]} • ${
                locale === 'ar' ? 'تم التناول الآن' : 'Taken just now'
              }`,
            }
          : item
      )
    );
  };

  const handleSnooze = (id: string) => {
    alert(locale === 'ar' ? 'تم الغفوة لمدة 15 دقيقة' : 'Snoozed for 15 minutes');
  };

  const formattedDate = new Date().toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {locale === 'ar' ? 'الجدول الزمني للجرعات' : 'Active Timeline'}
        </h2>
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          {locale === 'ar' ? `اليوم، ${formattedDate}` : `Today, ${formattedDate}`}
        </span>
      </div>

      {/* Timeline Items */}
      <div className="space-y-1">
        {items.map((item, index) => (
          <TimelineItem
            key={item.id}
            item={item}
            isLast={index === items.length - 1}
            onMarkAsTaken={handleMarkAsTaken}
            onSnooze={handleSnooze}
          />
        ))}
      </div>
    </Card>
  );
};
