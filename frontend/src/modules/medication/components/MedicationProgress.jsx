import React from 'react';
import { motion } from 'framer-motion';
export const MedicationProgress = ({ currentStock, totalStock, unit, status, }) => {
    const percentage = Math.min(100, Math.max(0, (currentStock / totalStock) * 100));
    const colorMap = {
        optimal: { text: 'text-[#00BBA5]', bar: 'bg-[#00BBA5]' },
        healthy: { text: 'text-[#2563EB]', bar: 'bg-[#2563EB]' },
        low: { text: 'text-[#E11D48]', bar: 'bg-[#E11D48]' },
        urgent: { text: 'text-[#C5221F]', bar: 'bg-[#C5221F]' },
    };
    const colors = colorMap[status];
    return (<div className="space-y-2 mt-4">
      <div className="flex justify-between items-center text-[10px] font-bold tracking-wider">
        <span className="text-slate-400 uppercase">CURRENT STOCK</span>
        <span className={`${colors.text} uppercase font-extrabold`}>
          {currentStock}/{totalStock} {unit}
        </span>
      </div>

      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
        <motion.div className={`h-full rounded-full ${colors.bar}`} initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}/>
        {status === 'urgent' && (<div className="absolute top-0 left-0 w-2 h-full bg-[#C5221F] rounded-full ring-2 ring-rose-200"/>)}
      </div>
    </div>);
};
