'use client';

import React from 'react';
import { Check, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/shared/lib/i18nContext';
import { AppButton } from '@/shared/components/ui/AppButton';
import { AppBadge } from '@/shared/components/ui/AppBadge';

export interface TimelineItemData {
  id: string;
  timeSlot: string; // e.g. "Morning Dose", "Lunchtime Dose", "Evening Dose"
  medication: string; // e.g. "Lisinopril • Taken at 07:45 AM"
  time: string; // e.g. "08:00 AM"
  status: 'completed' | 'due' | 'upcoming';
  doseEventId?: string;
  timeSlotName?: string;
  subtext?: string;
  formattedTime?: string;
}

interface TimelineItemProps {
  item: TimelineItemData;
  isFirst?: boolean;
  isLast?: boolean;
  onMarkAsTaken?: (id: string) => void;
  onSnooze?: (id: string) => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  item,
  isFirst = false,
  isLast = false,
  onMarkAsTaken,
  onSnooze,
}) => {
  const { t, dir } = useTranslation();
  const isRtl = dir === 'rtl';

  const isCompleted = item.status === 'completed';
  const isDue = item.status === 'due';

  // Dynamic continuous connector line colors
  const upperLineColor = isCompleted || isDue ? 'bg-primary' : 'bg-outline-variant/30';
  const lowerLineColor = isCompleted ? 'bg-primary' : 'bg-outline-variant/30';

  const timeSlotTitle = item.timeSlotName || item.timeSlot;
  const medicationSubtitle = item.subtext || item.medication;
  const displayTime = item.formattedTime || item.time;
  const targetId = item.doseEventId || item.id;

  return (
    <div className="relative flex items-stretch gap-4 sm:gap-6 group">
      {/* LEFT COLUMN: Perfectly Centered Bullet Node & Continuous Connector Line */}
      <div className="w-10 shrink-0 relative flex flex-col items-center select-none">
        {/* Upper Vertical Connector Line Segment */}
        {!isFirst && (
          <div
            className={`absolute top-0 h-[18px] w-[2px] ${upperLineColor} pointer-events-none transition-colors duration-300 z-0`}
          />
        )}

        {/* Lower Vertical Connector Line Segment */}
        {!isLast && (
          <div
            className={`absolute top-[46px] bottom-0 w-[2px] ${lowerLineColor} pointer-events-none transition-colors duration-300 z-0`}
          />
        )}

        {/* Node Circle Indicator - Center aligned at top-[18px] (y-center = 32px) */}
        <div className="absolute top-[18px] z-10">
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xs"
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </motion.div>
          ) : isDue ? (
            <div className="relative w-7 h-7 flex items-center justify-center">
              {/* Soft Pulse Ring animation */}
              <motion.div
                animate={{
                  scale: [1, 1.25, 1],
                  opacity: [0.5, 0.9, 0.5],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-full bg-primary/20 border border-primary/40"
              />
              <div className="w-7 h-7 rounded-full bg-primary ring-2 ring-primary/30 flex items-center justify-center shadow-xs z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-on-primary" />
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full border-2 border-outline-variant/60 bg-surface-container-lowest flex items-center justify-center shadow-2xs">
              <div className="w-2 h-2 rounded-full bg-on-surface-variant/40" />
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Content Card Container */}
      <div className="flex-1 pb-6">
        <motion.div
          whileHover={{ y: -1 }}
          transition={{ duration: 0.2 }}
          className={`relative p-5 rounded-2xl border transition-all duration-300 ${
            isDue
              ? 'bg-primary-container/10 border-primary/40 shadow-xs ring-1 ring-primary/20'
              : isCompleted
              ? 'bg-surface-container-lowest/80 border-outline-variant/20 dark:bg-surface-container-low/60'
              : 'bg-surface-container-lowest/60 border-outline-variant/20 opacity-85 dark:bg-surface-container-low/40'
          }`}
        >
          {/* Speech Bubble Arrow Notch Pointer (Center aligned at top-[26px] = 32px center) */}
          {isDue && (
            <div
              className={`absolute top-[26px] ${
                isRtl
                  ? '-right-2 border-y-[6px] border-y-transparent border-l-[8px] border-l-primary-container/20 dark:border-l-primary-container/40'
                  : '-left-2 border-y-[6px] border-y-transparent border-r-[8px] border-r-primary-container/20 dark:border-r-primary-container/40'
              } w-0 h-0 pointer-events-none`}
            />
          )}

          {/* Card Header & Content */}
          <div className="flex justify-between items-start mb-1.5 gap-4">
            <div>
              <h3 className="font-bold text-on-surface text-base leading-6 tracking-tight">
                {timeSlotTitle}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-on-surface-variant mt-0.5">
                {medicationSubtitle}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="text-xs font-semibold text-on-surface-variant font-mono">
                {displayTime}
              </span>
              {isDue && (
                <AppBadge variant="default" className="shadow-2xs">
                  {t('patient.home.dueNow')}
                </AppBadge>
              )}
            </div>
          </div>

          {/* Action Buttons for Active 'Due Now' Item */}
          {isDue && (
            <div className="flex flex-wrap items-center gap-3 pt-3 mt-3 border-t border-outline-variant/20">
              <AppButton
                type="button"
                variant="default"
                size="sm"
                onClick={() => onMarkAsTaken?.(targetId)}
                leftIcon={<Check className="w-3.5 h-3.5 stroke-[3]" />}
              >
                {t('patient.home.markAsTaken')}
              </AppButton>

              <AppButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSnooze?.(targetId)}
                leftIcon={<Clock className="w-3.5 h-3.5 text-primary" />}
              >
                {t('patient.home.snooze')}
              </AppButton>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
