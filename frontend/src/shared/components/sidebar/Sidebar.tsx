'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Pill,
  TrendingUp,
  Users,
  User,
  HeartPulse,
  Menu,
  X,
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { SidebarFooter } from './SidebarFooter';
import { useTranslation } from '@/shared/lib/i18nContext';

interface SidebarProps {
  activePath?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePath = '/dashboard' }) => {
  const { locale } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAr = mounted && locale === 'ar';

  const navItems = [
    {
      label: isAr ? 'الرئيسية' : 'Dashboard',
      href: '/home',
      icon: LayoutGrid,
    },
    {
      label: isAr ? 'خزانة الأدوية' : 'Medications Cabinet',
      href: '/medications',
      icon: Pill,
    },
    {
      label: isAr ? 'متابعة الالتزام' : 'Adherence Tracker',
      href: '/adherence',
      icon: TrendingUp,
    },
    {
      label: isAr ? 'دائرة الرعاية' : 'Caregivers Circle',
      href: '/caregivers',
      icon: Users,
    },
    {
      label: isAr ? 'الملف الشخصي' : 'My Profile',
      href: '/profile',
      icon: User,
    },
  ];

  return (
    <>
      {/* Mobile Top Bar (visible only on < lg screens) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-xs">
            <HeartPulse className="w-4 h-4" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
            MediMind
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
          aria-label="Toggle Menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Content */}
      <aside
        className={`lg:hidden fixed top-0 bottom-0 z-50 w-[280px] bg-white dark:bg-slate-900 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl ${
          isAr ? 'right-0' : 'left-0'
        } ${
          isMobileOpen
            ? 'translate-x-0'
            : isAr
            ? 'translate-x-full'
            : '-translate-x-full'
        }`}
        suppressHydrationWarning
      >
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                  MediMind
                </h1>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  {isAr ? 'منصة الرعاية الصحية' : 'Healthcare Dashboard'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={
                  activePath === item.href ||
                  (activePath === '/dashboard' && item.href === '/home') ||
                  (activePath === '/' && item.href === '/home')
                }
              />
            ))}
          </nav>
        </div>

        <SidebarFooter />
      </aside>

      {/* Desktop Sidebar (visible on lg: 1024px+ screens) */}
      <aside
        className="hidden lg:flex w-[280px] shrink-0 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-[#EEF2F6] dark:border-slate-800 rtl:border-r-0 rtl:border-l p-6 flex-col justify-between z-30 transition-colors duration-300"
        suppressHydrationWarning
      >
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                MediMind
              </h1>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                {isAr ? 'منصة الرعاية الصحية' : 'Healthcare Dashboard'}
              </p>
            </div>
          </div>

          {/* Navigation List */}
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={
                  activePath === item.href ||
                  (activePath === '/dashboard' && item.href === '/home') ||
                  (activePath === '/' && item.href === '/home')
                }
              />
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <SidebarFooter />
      </aside>
    </>
  );
};
