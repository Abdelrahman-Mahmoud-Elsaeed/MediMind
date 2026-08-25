import React from 'react';
import { motion } from 'framer-motion';

const colorMap = {
    optimal: { text: 'text-[#00BBA5]', bar: 'bg-[#00BBA5]' },
    healthy: { text: 'text-[#2563EB]', bar: 'bg-[#2563EB]' },
    low: { text: 'text-[#E11D48]', bar: 'bg-[#E11D48]' },
    low_stock: { text: 'text-[#E11D48]', bar: 'bg-[#E11D48]' },
    urgent: { text: 'text-[#C5221F]', bar: 'bg-[#C5221F]' },
    active: { text: 'text-teal-600 dark:text-teal-400', bar: 'bg-teal-600' },
    finished: { text: 'text-slate-500', bar: 'bg-slate-400' },
};

export const MedicationProgress = ({ currentStock, totalStock, unit = 'tablets', status }) => {
    const normalizedStatus = String(status || '').toLowerCase().trim();
    const colors = colorMap[normalizedStatus] || colorMap.optimal;
    const safeCurrent = Math.max(0, Number(currentStock) || 0);
    const safeTotal = Number(totalStock) > 0 ? Number(totalStock) : Math.max(safeCurrent, 30);
    const percentage = Math.min(100, Math.max(0, (safeCurrent / safeTotal) * 100));

    return (
        <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center text-[10px] font-bold tracking-wider">
                <span className="text-slate-400 uppercase">CURRENT STOCK</span>
                <span className={`${colors.text} uppercase font-extrabold`}>
                    {safeCurrent}/{safeTotal} {unit}
                </span>
            </div>

            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <motion.div
                    className={`h-full rounded-full ${colors.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
                {normalizedStatus === 'urgent' && (
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#C5221F] rounded-full ring-2 ring-rose-200" />
                )}
            </div>
        </div>
    );
};
