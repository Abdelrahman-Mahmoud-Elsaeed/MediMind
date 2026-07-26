import React from 'react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  active?: boolean;
  badge?: string | number;
  onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  href = '#',
  active = false,
  badge,
  onClick,
}) => {
  const content = (
    <div
      onClick={onClick}
      className={`group flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200 ${
        active
          ? 'bg-[#E8F7F0] dark:bg-emerald-950/40 text-[#006C4E] dark:text-emerald-400 font-semibold shadow-xs'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <Icon
          className={`w-5 h-5 transition-colors duration-200 ${
            active
              ? 'text-[#16B364] dark:text-emerald-400'
              : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
          }`}
        />
        <span className="text-sm tracking-tight">{label}</span>
      </div>
      {badge !== undefined && (
        <span
          className={`px-2 py-0.5 text-xs font-bold rounded-full ${
            active
              ? 'bg-[#16B364] text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          {badge}
        </span>
      )}
    </div>
  );

  if (href && href !== '#') {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};
