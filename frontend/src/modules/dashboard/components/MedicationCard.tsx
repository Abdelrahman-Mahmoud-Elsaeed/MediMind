'use client';

import React from 'react';
import { Pill, Activity, AlertCircle, RefreshCw, Calendar, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProgressBar } from '@/shared/components/ui/ProgressBar';

export interface MedicationData {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  remainingPills: number;
  totalPills: number;
  status: 'active' | 'low_stock';
  iconType?: 'pill' | 'heart' | 'capsule';
}

interface MedicationCardProps {
  medication: MedicationData;
  onRefill?: (id: string) => void;
  onEdit?: (id: string) => void;
  onSchedule?: (id: string) => void;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  onRefill,
  onEdit,
  onSchedule,
}) => {
  const isLowStock = medication.remainingPills <= 15 || medication.status === 'low_stock';

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="p-5 rounded-[16px] bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Icon & Info */}
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isLowStock
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}
          >
            {medication.iconType === 'heart' ? (
              <Activity className="w-6 h-6" />
            ) : (
              <Pill className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                {medication.name}
              </h3>
              {isLowStock && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-3 h-3" />
                  Low Stock
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              {medication.dosage} • {medication.frequency}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => onEdit?.(medication.id)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Edit Medication"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onSchedule?.(medication.id)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Schedule"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onRefill?.(medication.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              isLowStock
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            Refill
          </button>
        </div>
      </div>

      {/* Stock Progress Bar */}
      <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 space-y-1.5">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400">Remaining Stock</span>
          <span className={isLowStock ? 'text-amber-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>
            {medication.remainingPills}/{medication.totalPills} left
          </span>
        </div>
        <ProgressBar
          value={medication.remainingPills}
          max={medication.totalPills}
          color={isLowStock ? '#F59E0B' : '#16B364'}
          height="h-2"
        />
      </div>
    </motion.div>
  );
};
