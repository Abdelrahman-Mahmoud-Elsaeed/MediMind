import React from 'react';

export const MedicationStatusBadge = ({ status }) => {
    const badgeConfig = {
        optimal: {
            label: 'OPTIMAL',
            className: 'bg-[#00BBA5] text-white',
        },
        healthy: {
            label: 'HEALTHY',
            className: 'bg-[#DCEBFF] text-[#2563EB]',
        },
        low: {
            label: 'LOW',
            className: 'bg-[#FFE4DE] text-[#E11D48]',
        },
        low_stock: {
            label: 'LOW STOCK',
            className: 'bg-[#FFE4DE] text-[#E11D48]',
        },
        urgent: {
            label: 'URGENT REFILL',
            className: 'bg-[#C5221F] text-white',
        },
        active: {
            label: 'ACTIVE',
            className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
        },
        finished: {
            label: 'FINISHED',
            className: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        },
    };

    const normalizedStatus = String(status || '').toLowerCase().trim();
    const config = badgeConfig[normalizedStatus] || badgeConfig.optimal;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${config.className}`}>
            {config.label}
        </span>
    );
};
