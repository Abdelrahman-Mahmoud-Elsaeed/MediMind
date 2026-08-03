'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/shared/lib/i18nContext';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const MobileNav = () => {
    const pathname = usePathname();
    const { t, locale } = useTranslation();
    const { user } = useAuth();
    const isAr = locale === 'ar';

    const isCaregiver = ['FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER'].includes(user?.role);

    const caregiverItems = [
        { href: '/dashboard', icon: 'dashboard', label: isAr ? 'الرئيسية' : 'Dashboard' },
        { href: '/patients', icon: 'groups', label: isAr ? 'مرضاي' : 'My Patients' },
        { href: '/profile', icon: 'person', label: isAr ? 'الملف الشخصي' : 'Profile' },
    ];

    const patientItems = [
        { href: '/home', icon: 'home', label: isAr ? 'الرئيسية' : 'Home' },
        { href: '/medications', icon: 'medication', label: isAr ? 'الأدوية' : 'Meds' },
        { href: '/adherence', icon: 'query_stats', label: isAr ? 'الالتزام' : 'Adherence' },
        { href: '/caregivers', icon: 'groups', label: isAr ? 'الرعاية' : 'Care' },
        { href: '/profile', icon: 'person', label: isAr ? 'الملف' : 'Profile' },
    ];

    const navItems = isCaregiver ? caregiverItems : patientItems;

    return (<nav className="lg:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface-container/90 backdrop-blur-xl border-t border-outline-variant/10 shadow-lg">
      {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/home' && pathname?.startsWith(item.href)) ||
              (item.href === '/medications' && pathname?.startsWith('/ocr-scan')) ||
              (item.href === '/profile' && pathname?.startsWith('/medical-records'));
            return (<Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center px-3 py-1 transition-transform duration-300 ${isActive
                    ? 'text-primary font-bold scale-105'
                    : 'text-on-surface-variant hover:text-primary'}`}>
            <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
              {item.icon}
            </span>
            <span className="font-label-sm text-[10px] mt-0.5">{item.label || (item.labelKey ? t(item.labelKey) : '')}</span>
          </Link>);
        })}
    </nav>);
};
export default MobileNav;
