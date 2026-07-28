'use client';

import React from 'react';
import { Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export const Header: React.FC = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="flex justify-between items-center py-2 mb-6">
      <div>
        {/* Left header optional title or clean spacer */}
      </div>

      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-[#EEF2F6] dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
          aria-label="Toggle Theme"
        >
          {mounted && resolvedTheme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          )}
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-[#EEF2F6] dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs group"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        </button>
      </div>
    </header>
  );
};
