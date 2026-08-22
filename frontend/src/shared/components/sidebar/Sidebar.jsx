'use client';
import React, { useState, useEffect } from 'react';
import { LayoutGrid, Pill, TrendingUp, Users, User, HeartPulse, RefreshCw } from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { SidebarFooter } from './SidebarFooter';
import { useTranslation } from '@/shared/lib/i18nContext';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const Sidebar = ({ activePath = '/dashboard', isSidebarSlim = false, setIsSidebarSlim }) => {
    const { locale } = useTranslation();
    const isAr = locale === 'ar';
    const { user } = useAuth();

    const userRole = user?.role;
    const isPharmacist = userRole === 'PHARMACIST';
    const isCaregiver = ['FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER'].includes(userRole);

    const pharmacistNavItems = [
        {
            label: isAr ? 'بوابة الصيدلية' : 'Pharmacy Portal',
            href: '/pharmacy',
            icon: LayoutGrid,
        },
        {
            label: isAr ? 'طلبات تعبئة الأدوية' : 'Refill Orders',
            href: '/pharmacy/orders',
            icon: Pill,
        },
        {
            label: isAr ? 'دليل الصيدليات' : 'Pharmacy Directory',
            href: '/pharmacies',
            icon: Users,
        },
        {
            label: isAr ? 'ملف الصيدلية' : 'Pharmacy Profile',
            href: '/profile',
            icon: User,
        },
    ];

    const caregiverNavItems = [
        {
            label: isAr ? 'الرئيسية' : 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            label: isAr ? 'مرضاي وقائمة المتابعة' : 'My Patients',
            href: '/patients',
            icon: Users,
        },
        {
            label: isAr ? 'الملف الشخصي' : 'My Profile',
            href: '/profile',
            icon: User,
        },
    ];

    const patientNavItems = [
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
            label: isAr ? 'إعادة التعبئة' : 'Refill Orders',
            href: '/refills',
            icon: RefreshCw,
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

    const navItems = isPharmacist ? pharmacistNavItems : isCaregiver ? caregiverNavItems : patientNavItems;
    return (<>
      <aside className={`hidden lg:flex shrink-0 h-screen sticky top-0 bg-surface-container-lowest dark:bg-surface-container-low border-r border-outline-variant/30 rtl:border-r-0 rtl:border-l flex-col justify-between z-30 transition-all duration-300 ${isSidebarSlim ? 'w-20 p-3' : 'w-[280px] p-6'}`} suppressHydrationWarning>
        <div className="space-y-8">
          {/* Brand Header & Toggle Button */}
          {!isSidebarSlim ? (
            <div className="flex items-center gap-2 w-full transition-all duration-300">
              {setIsSidebarSlim && (
                <button
                  type="button"
                  onClick={() => setIsSidebarSlim(!isSidebarSlim)}
                  className="hidden lg:flex p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer items-center justify-center shrink-0"
                  aria-label="Toggle Sidebar"
                  title="Toggle Sidebar"
                >
                  <span className="material-symbols-outlined !text-[24px]">
                    {isAr ? "menu_open" : "menu_open"}
                  </span>
                </button>
              )}

              <Link href="/home" className="flex items-center gap-3 group cursor-pointer overflow-hidden transition-all duration-300">
                <img
                  src="/images/logo.png"
                  alt="MediMind Logo"
                  className="w-10 h-10 object-contain rounded-2xl shadow-md group-hover:scale-105 transition-transform shrink-0"
                />
                <div>
                  <h1 className="text-xl font-black tracking-tight leading-tight whitespace-nowrap">
                    <span className="text-[#0047ba] dark:text-[#3b82f6]">Medi</span>
                    <span className="text-[#00a396] dark:text-[#14b8a6]">Mind</span>
                  </h1>
                  <p className="text-xs font-semibold text-on-surface-variant whitespace-nowrap">
                    {isAr ? 'منصة الرعاية الصحية' : 'Healthcare Dashboard'}
                  </p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full transition-all duration-300">
              {setIsSidebarSlim && (
                <button
                  type="button"
                  onClick={() => setIsSidebarSlim(!isSidebarSlim)}
                  className="hidden lg:flex p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer items-center justify-center shrink-0"
                  aria-label="Toggle Sidebar"
                  title="Toggle Sidebar"
                >
                  <span className="material-symbols-outlined !text-[24px]">
                    {isAr ? "menu" : "menu"}
                  </span>
                </button>
              )}

              <Link href="/home" className="flex items-center justify-center group cursor-pointer" title="MediMind">
                <img
                  src="/images/logo.png"
                  alt="MediMind Logo"
                  className="w-10 h-10 object-contain rounded-2xl shadow-md group-hover:scale-105 transition-transform shrink-0"
                />
              </Link>
            </div>
          )}

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive =
                activePath === item.href ||
                (item.href === '/pharmacy' && (activePath === '/pharmacy' || activePath === '/pharmacy/dashboard')) ||
                (item.href === '/pharmacy/orders' && activePath === '/pharmacy/orders') ||
                (item.href === '/refills' && activePath.startsWith('/refills')) ||
                (item.href === '/home' && (activePath === '/dashboard' || activePath === '/')) ||
                (item.href === '/medications' && (activePath.startsWith('/medications') || activePath.startsWith('/ocr-scan'))) ||
                (item.href === '/caregivers' && activePath.startsWith('/caregivers')) ||
                (item.href === '/profile' && (activePath.startsWith('/profile') || activePath.startsWith('/medical-records')));

              return (
                <SidebarItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={isActive}
                  isSidebarSlim={isSidebarSlim}
                />
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <SidebarFooter isSidebarSlim={isSidebarSlim} />
      </aside>
    </>);
};
