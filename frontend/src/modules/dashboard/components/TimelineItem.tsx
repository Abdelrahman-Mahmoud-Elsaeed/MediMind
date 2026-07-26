'use client';

import React from 'react';
import { Check, Clock, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

export interface TimelineItemData {
  id: string;
  timeSlot: string; // e.g. "Morning Dose", "Lunchtime Dose", "Evening Dose"
  medication: string; // e.g. "Lisinopril • Taken at 07:45 AM"
  time: string; // e.g. "08:00 AM"
  status: 'completed' | 'due' | 'upcoming';
}

interface TimelineItemProps {
  item: TimelineItemData;
  isLast?: boolean;
  onMarkAsTaken?: (id: string) => void;
  onSnooze?: (id: string) => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  item,
  isLast = false,
  onMarkAsTaken,
  onSnooze,
}) => {
  const isCompleted = item.status === 'completed';
  const isDue = item.status === 'due';
  const isUpcoming = item.status === 'upcoming';

  return (
    <div className="relative flex gap-5 group">
      {/* Timeline Node & Line */}
      <div className="flex flex-col items-center shrink-0 pt-1">
        {/* Node Icon */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
            isCompleted
              ? 'bg-[#16B364] text-white shadow-sm ring-4 ring-emerald-50 dark:ring-emerald-950/40'
              : isDue
              ? 'bg-[#16B364] text-white ring-4 ring-emerald-100 dark:ring-emerald-900/50 animate-pulse'
              : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-400'
          }`}
        >
          {isCompleted ? (
            <Check className="w-4 h-4 stroke-[3]" />
          ) : isDue ? (
            <div className="w-2.5 h-2.5 bg-white rounded-full" />
          ) : (
            <Circle className="w-3 h-3 text-slate-300 dark:text-slate-600" />
          )}
        </div>

        {/* Connecting Vertical Line */}
        {!isLast && (
          <div className="w-0.5 grow bg-slate-200 dark:bg-slate-800 my-2 min-h-[40px]" />
        )}
      </div>

      {/* Item Body Card */}
      <div className="grow pb-6">
        <motion.div
          whileHover={{ y: -1 }}
          className={`p-5 rounded-2xl border transition-all duration-200 ${
            isDue
              ? 'bg-[#F0F7FF] dark:bg-slate-800/80 border-[#D4E5FF] dark:border-slate-700 shadow-sm'
              : 'bg-[#F8FAFC] dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800'
          }`}
        >
          <div className="flex justify-between items-start mb-2 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {item.timeSlot}
                </span>
                {isDue && (
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-[#16B364]/10 text-[#006C4E] dark:text-emerald-400 rounded-full">
                    Due Now
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {item.medication}
              </p>
            </div>

            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-mono shrink-0">
              {item.time}
            </span>
          </div>

          {/* Action Buttons for 'Due Now' */}
          {isDue && (
            <div className="flex flex-wrap items-center gap-3 pt-3 mt-3 border-t border-blue-100/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => onMarkAsTaken?.(item.id)}
                className="bg-[#16B364] hover:bg-[#129B56] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 shadow-sm shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                Mark as Taken
              </button>
              <button
                type="button"
                onClick={() => onSnooze?.(item.id)}
                className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Snooze
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
