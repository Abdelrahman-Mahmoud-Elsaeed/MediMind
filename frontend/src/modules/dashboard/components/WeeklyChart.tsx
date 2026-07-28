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
    <div className="pt-4 border-t border-outline-variant/30 mt-4">
      <h4 className="text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider mb-3 opacity-80">
        Weekly Compliance
      </h4>

      <div className="flex items-center justify-between px-1">
        {weeklyData.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant">
              {item.day}
            </span>

            <div className="flex items-center justify-center">
              {item.status === 'completed' && (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-on-primary text-[9px] shadow-2xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              {item.status === 'missed' && (
                <div className="w-4 h-4 rounded-full bg-error flex items-center justify-center text-on-error text-[9px] shadow-2xs">
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              {item.status === 'upcoming' && (
                <div className="w-4 h-4 rounded-full border-2 border-outline-variant/50 bg-transparent" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
