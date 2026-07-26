'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

interface DayStatus {
  day: string;
  status: 'completed' | 'missed' | 'upcoming';
}

const weeklyData: DayStatus[] = [
  { day: 'M', status: 'completed' },
  { day: 'T', status: 'completed' },
  { day: 'W', status: 'completed' },
  { day: 'T', status: 'missed' },
  { day: 'F', status: 'completed' },
  { day: 'S', status: 'upcoming' },
  { day: 'S', status: 'upcoming' },
];

export const WeeklyChart: React.FC = () => {
  return (
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
      <h4 className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
        Weekly Compliance
      </h4>

      <div className="flex items-center justify-between px-1">
        {weeklyData.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {item.day}
            </span>

            <div className="flex items-center justify-center">
              {item.status === 'completed' && (
                <div className="w-4 h-4 rounded-full bg-[#16B364] flex items-center justify-center text-white text-[9px] shadow-xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              {item.status === 'missed' && (
                <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-white text-[9px] shadow-xs">
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              {item.status === 'upcoming' && (
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-transparent" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
