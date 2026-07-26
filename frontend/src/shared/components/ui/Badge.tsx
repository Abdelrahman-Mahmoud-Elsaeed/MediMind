import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'slate' | 'rose' | 'teal';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  className = '',
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
    teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/60',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
