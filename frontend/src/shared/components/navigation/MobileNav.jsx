'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/shared/lib/i18nContext';
export const MobileNav = () => {
    const pathname = usePathname();
    const { t } = useTranslation();
    const navItems = [
        { href: '/home', icon: 'home', labelKey: 'patient.nav.home' },
        { href: '/medications', icon: 'medication', labelKey: 'patient.nav.meds' },
        { href: '/adherence', icon: 'query_stats', labelKey: 'patient.nav.adherence' },
        { href: '/caregivers', icon: 'groups', labelKey: 'patient.nav.care' },
        { href: '/profile', icon: 'person', labelKey: 'patient.nav.profile' },
    ];
    return (<nav className="lg:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface-container/90 backdrop-blur-xl border-t border-outline-variant/10 shadow-lg">
      {navItems.map((item) => {
            const isActive = pathname === item.href ||
                (item.href !== '/home' && pathname?.startsWith(item.href));
            return (<Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center px-3 py-1 transition-transform duration-300 ${isActive
                    ? 'text-primary font-bold scale-105'
                    : 'text-on-surface-variant hover:text-primary'}`}>
            <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
              {item.icon}
            </span>
            <span className="font-label-sm text-[10px] mt-0.5">{t(item.labelKey)}</span>
          </Link>);
        })}
    </nav>);
};
export default MobileNav;
