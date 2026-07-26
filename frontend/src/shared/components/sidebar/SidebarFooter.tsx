'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/shared/lib/i18nContext';

export const SidebarFooter: React.FC = () => {
  const { locale, toggleLanguage } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAr = mounted && locale === 'ar';

  return (
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-5" suppressHydrationWarning>
      {/* Language Switch Pill */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-full w-fit max-w-[140px]">
        <button
          type="button"
          onClick={() => isAr && toggleLanguage()}
          className={`flex-1 px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
            !isAr
              ? 'bg-[#006C4E] text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => !isAr && toggleLanguage()}
          className={`flex-1 px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
            isAr
              ? 'bg-[#006C4E] text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          AR
        </button>
      </div>

      {/* Patient Profile Card */}
      <div className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
            alt="Sarah"
            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/30 group-hover:border-emerald-500 transition-colors"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
            {isAr ? 'سارة' : 'Sarah'}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {isAr ? 'مريض' : 'Patient'}
          </span>
        </div>
      </div>
    </div>
  );
};
