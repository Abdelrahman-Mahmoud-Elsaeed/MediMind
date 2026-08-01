'use client';
import React from 'react';
import { Check, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/shared/lib/i18nContext';
import { AppButton } from '@/shared/components/ui/AppButton';
import { AppBadge } from '@/shared/components/ui/AppBadge';

export const TimelineItem = ({ item, isFirst = false, isLast = false, onMarkAsTaken, onSnooze }) => {
    const { t, dir } = useTranslation();
    const isRtl = dir === 'rtl';
    const isCompleted = item.status === 'completed';
    const isDue = item.status === 'due';
    
    // Dynamic continuous connector line colors
    const lineColor = isCompleted || isDue ? 'bg-teal-600 dark:bg-teal-500' : 'bg-slate-200 dark:bg-slate-700';
    const timeSlotTitle = item.timeSlotName || item.timeSlot;
    const medicationSubtitle = item.subtext || item.medication;
    const targetId = item.doseEventId || item.id;

    return (
      <div className="relative flex items-stretch gap-4 sm:gap-6 group">
        {/* LEFT COLUMN: Perfectly Aligned Centered Node & Continuous Connector Line */}
        <div className="w-8 shrink-0 relative flex flex-col items-center select-none">
          {/* Connector Line spanning full height behind node */}
          <div className={`absolute left-1/2 -translate-x-1/2 w-[2px] ${lineColor} pointer-events-none transition-colors duration-300 z-0 ${
            isFirst ? 'top-6 bottom-0' : isLast ? 'top-0 h-6' : 'top-0 bottom-0'
          }`} />

          {/* Node Circle Indicator */}
          <div className="relative z-10 mt-3.5">
            {isCompleted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs"
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </motion.div>
            ) : isDue ? (
              <div className="relative w-7 h-7 flex items-center justify-center">
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
                  className="absolute inset-0 rounded-full bg-teal-500/20 border border-teal-500/40"
                />
                <div className="w-7 h-7 rounded-full bg-teal-600 ring-2 ring-teal-500/30 flex items-center justify-center shadow-xs z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center shadow-2xs">
                <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Content Card Container */}
        <div className="flex-1 pb-5">
          <motion.div
            whileHover={{ y: -1 }}
            transition={{ duration: 0.2 }}
            className={`relative p-5 rounded-2xl border transition-all duration-300 ${
              isDue
                ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-500/40 shadow-xs ring-1 ring-teal-500/20'
                : isCompleted
                ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80'
                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-90'
            }`}
          >
            {/* Speech Bubble Arrow Notch Pointer */}
            {isDue && (
              <div className={`absolute top-4 ${
                isRtl
                  ? '-right-2 border-y-[6px] border-y-transparent border-l-[8px] border-l-teal-100 dark:border-l-teal-900'
                  : '-left-2 border-y-[6px] border-y-transparent border-r-[8px] border-r-teal-100 dark:border-r-teal-900'
              } w-0 h-0 pointer-events-none`} />
            )}

            {/* Card Header & Content */}
            <div className="flex justify-between items-start mb-1.5 gap-4">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base leading-6 tracking-tight">
                  {timeSlotTitle}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                  {medicationSubtitle}
                </p>
              </div>

              {/* Status Badge Only (No redundant timestamp) */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isDue ? (
                  <AppBadge variant="default" className="bg-teal-100 text-teal-800 dark:bg-teal-900/80 dark:text-teal-200 font-bold border border-teal-200 dark:border-teal-700 shadow-2xs">
                    {t('patient.home.dueNow')}
                  </AppBadge>
                ) : isCompleted ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    <Check className="w-3 h-3" />
                    {isRtl ? 'تم التناول' : 'Taken'}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Action Buttons for Active 'Due Now' Item */}
            {isDue && (
              <div className="flex flex-wrap items-center gap-3 pt-3 mt-3 border-t border-teal-200/60 dark:border-teal-900/60">
                <AppButton type="button" variant="default" size="sm" onClick={() => onMarkAsTaken?.(targetId)} leftIcon={<Check className="w-3.5 h-3.5 stroke-[3]" />}>
                  {t('patient.home.markAsTaken')}
                </AppButton>

                <AppButton type="button" variant="outline" size="sm" onClick={() => onSnooze?.(targetId)} leftIcon={<Clock className="w-3.5 h-3.5 text-teal-600" />}>
                  {t('patient.home.snooze')}
                </AppButton>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
};
