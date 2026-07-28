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
      <aside
        className="hidden lg:flex w-[280px] shrink-0 h-screen sticky top-0 bg-surface-container-lowest dark:bg-surface-container-low border-r border-outline-variant/30 rtl:border-r-0 rtl:border-l p-6 flex-col justify-between z-30 transition-colors duration-300"
        suppressHydrationWarning
      >
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-md shadow-primary/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-on-surface leading-tight">
                MediMind
              </h1>
              <p className="text-xs font-semibold text-on-surface-variant">
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
