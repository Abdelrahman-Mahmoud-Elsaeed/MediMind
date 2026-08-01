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
        urgent: {
            label: 'URGENT REFILL',
            className: 'bg-[#C5221F] text-white',
        },
    };
    const config = badgeConfig[status];
    return (<span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${config.className}`}>
      {config.label}
    </span>);
};
