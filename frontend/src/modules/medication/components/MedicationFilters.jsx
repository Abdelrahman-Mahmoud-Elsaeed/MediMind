'use client';
import React from 'react';
import { useTranslation } from '@/shared/lib/i18nContext';
export const MedicationFilters = ({ activeFilter, onFilterChange, lowStockCount = 2, }) => {
    const { locale } = useTranslation();
    const filters = [
        { id: 'all', label: locale === 'ar' ? 'الكل' : 'All' },
        { id: 'active', label: locale === 'ar' ? 'نشط' : 'Active' },
        { id: 'finished', label: locale === 'ar' ? 'منتهي' : 'Finished' },
        { id: 'low_stock', label: locale === 'ar' ? 'مخزون منخفض' : 'Low Stock', badge: lowStockCount },
    ];
    return (<div className="flex flex-wrap items-center gap-3">
      {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (<button key={filter.id} type="button" onClick={() => onFilterChange(filter.id)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${isActive
                    ? 'bg-[#006C4E] text-white border-[#006C4E] shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}>
            <span>{filter.label}</span>
            {filter.badge !== undefined && filter.badge > 0 && (<span className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${isActive
                        ? 'bg-rose-500 text-white'
                        : 'bg-rose-500 text-white'}`}>
                {filter.badge}
              </span>)}
          </button>);
        })}
    </div>);
};
