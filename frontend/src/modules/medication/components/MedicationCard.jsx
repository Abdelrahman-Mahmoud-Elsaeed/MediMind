import React from 'react';
import { motion } from 'framer-motion';
import { MedicationStatusBadge } from './MedicationStatusBadge';
import { MedicationProgress } from './MedicationProgress';
import { MedicationActions } from './MedicationActions';
// Pixel-perfect SVG matching the reference image medicine bottle & spoon icon
const BottleSpoonIcon = ({ className = 'w-6 h-6' }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    {/* Bottle Cap */}
    <rect x="5" y="4" width="8" height="2" rx="0.8"/>
    {/* Bottle Body */}
    <rect x="4" y="7" width="10" height="13" rx="2"/>
    {/* White Cross on Bottle */}
    <path d="M8.25 11H9.75V12.5H11.25V14H9.75V15.5H8.25V14H6.75V12.5H8.25V11Z" fill="#E8F0FE"/>
    {/* Spoon beside bottle */}
    <path d="M17 7C16.17 7 15.5 7.67 15.5 8.5C15.5 9.15 15.91 9.7 16.5 9.9V18.5C16.5 19.33 17.17 20 18 20C18.83 20 19.5 19.33 19.5 18.5V9.9C20.09 9.7 20.5 9.15 20.5 8.5C20.5 7.67 19.83 7 19 7H17Z"/>
  </svg>);
export const MedicationCard = ({ medication, onEdit, onSchedule, onRefill, }) => {
    const isUrgent = medication.status === 'urgent';
    const iconBgMap = {
        pill: 'bg-primary-container/20 text-primary',
        bottle: 'bg-primary-container/20 text-primary',
        kit: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
        urgent_pill: 'bg-error-container/20 text-error',
    };
    return (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2, scale: 1.02 }} transition={{ duration: 0.2 }} className={`rounded-[22px] p-5 transition-all duration-200 border flex flex-col justify-between ${isUrgent
            ? 'bg-error-container/10 border-error/30 shadow-2xs'
            : 'bg-surface-container-lowest dark:bg-surface-container-low border-outline-variant/30 text-on-surface shadow-2xs hover:shadow-md'}`}>
      <div>
        {/* Card Header: Medicine Bottle Icon (matching reference) & Status Badge */}
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${iconBgMap[medication.iconType]}`}>
            <BottleSpoonIcon className="w-6 h-6"/>
          </div>
          <MedicationStatusBadge status={medication.status}/>
        </div>

        {/* Title & Dosage */}
        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base tracking-tight">
          {medication.name}
        </h3>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
          {medication.frequency}
        </p>

        {/* Progress & Current Stock */}
        <MedicationProgress currentStock={medication.currentStock} totalStock={medication.totalStock} unit={medication.unit} status={medication.status}/>
      </div>

      {/* Action Buttons Row */}
      <MedicationActions onEdit={() => onEdit?.(medication.id)} onSchedule={() => onSchedule?.(medication.id)} onRefill={() => onRefill?.(medication.id)} isUrgent={isUrgent}/>
    </motion.div>);
};
