'use client';
import React from 'react';
import { Check, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/shared/lib/i18nContext';
import { AppButton } from '@/shared/components/ui/AppButton';

export const TimelineItem = ({ item, isFirst = false, isLast = false, onMarkAsTaken, onSnooze, index = 0 }) => {
  const { t, dir } = useTranslation();
  const isRtl = dir === 'rtl';

  const isCompleted = item.status === 'completed' || item.status === 'TAKEN';
  const isDue = item.status === 'due' || item.status === 'PENDING' || item.status === 'DUE';
  const isMissed = item.status === 'missed' || item.status === 'MISSED';

  const timeSlotTitle = item.timeSlotName || item.timeSlot || item.time || '08:00 AM';
  const medicationSubtitle = item.subtext || item.medication || 'Medication';
  const targetId = item.doseEventId || item.id;

  // Dynamic continuous connector line colors
  const lineColor = isCompleted
    ? 'bg-emerald-500/80 dark:bg-emerald-400/80'
    : isDue
    ? 'bg-gradient-to-b from-teal-500 to-emerald-500 shadow-[0_0_8px_rgba(20,184,166,0.35)]'
    : 'bg-slate-200 dark:bg-slate-700/80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
      className="relative flex items-stretch gap-3 sm:gap-5 group"
    >
      {/* LEFT COLUMN: Perfectly Aligned Centered Node & Continuous Connector Line */}
      <div className="w-8 shrink-0 relative flex flex-col items-center select-none">
        {/* Connector Line spanning full height behind node (handles single-item and n-items gracefully) */}
        {!isFirst || !isLast ? (
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-[2.5px] ${lineColor} pointer-events-none transition-all duration-300 z-0 ${
              isFirst ? 'top-5 bottom-0' : isLast ? 'top-0 h-5' : 'top-0 bottom-0'
            }`}
          />
        ) : null}

        {/* Node Circle Indicator */}
        <div className="relative z-10 mt-3.5">
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 ring-4 ring-slate-50 dark:ring-slate-900"
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </motion.div>
          ) : isDue ? (
            <div className="relative w-7 h-7 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.35, 1],
                  opacity: [0.4, 0.85, 0.4],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-full bg-teal-500/30 border border-teal-500/50"
              />
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white ring-4 ring-slate-50 dark:ring-slate-900 flex items-center justify-center shadow-md shadow-teal-500/30 z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
          ) : isMissed ? (
            <div className="w-7 h-7 rounded-full bg-rose-500/10 border-2 border-rose-500 text-rose-600 dark:text-rose-400 flex items-center justify-center ring-4 ring-slate-50 dark:ring-slate-900">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 flex items-center justify-center ring-4 ring-slate-50 dark:ring-slate-900 transition-colors">
              <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Content Card Container */}
      <div className="flex-1 pb-4">
        <motion.div
          whileHover={{ x: isRtl ? -3 : 3 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
            isDue
              ? 'bg-teal-50/90 dark:bg-teal-950/40 border-teal-500/40 shadow-sm ring-1 ring-teal-500/20'
              : isCompleted
              ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/70'
              : isMissed
              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
              : 'bg-white dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800'
          }`}
        >
          {/* Speech Bubble Arrow Notch Pointer */}
          {isDue && (
            <div
              className={`absolute top-4 ${
                isRtl
                  ? '-right-2 border-y-[6px] border-y-transparent border-l-[8px] border-l-teal-100 dark:border-l-teal-900/80'
                  : '-left-2 border-y-[6px] border-y-transparent border-r-[8px] border-r-teal-100 dark:border-r-teal-900/80'
              } w-0 h-0 pointer-events-none hidden sm:block`}
            />
          )}

          {/* Card Header & Content */}
          <div className="flex justify-between items-start mb-1.5 gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug tracking-tight">
                  {timeSlotTitle}
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed truncate">
                {medicationSubtitle}
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isDue ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300/80 dark:border-teal-700/60 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  {t('patient.home.dueNow')}
                </span>
              ) : isCompleted ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <Check className="w-3 h-3" />
                  {isRtl ? 'تم التناول' : 'Taken'}
                </span>
              ) : isMissed ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                  {isRtl ? 'فائتة' : 'Missed'}
                </span>
              ) : null}
            </div>
          </div>

          {/* Action Buttons for Active 'Due Now' Item */}
          {isDue && (
            <div className="flex flex-wrap items-center gap-2.5 pt-3 mt-3 border-t border-teal-200/60 dark:border-teal-900/60">
              <AppButton
                type="button"
                variant="default"
                size="sm"
                onClick={() => onMarkAsTaken?.(targetId)}
                leftIcon={<Check className="w-3.5 h-3.5 stroke-[3]" />}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
              >
                {t('patient.home.markAsTaken')}
              </AppButton>

              <AppButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSnooze?.(targetId)}
                leftIcon={<Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                {t('patient.home.snooze')}
              </AppButton>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
