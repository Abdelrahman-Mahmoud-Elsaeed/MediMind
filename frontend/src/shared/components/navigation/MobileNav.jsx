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
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isAr = locale === 'ar';
  const userRole = user?.role;

  const isPharmacist = userRole === 'PHARMACIST';
  const isCaregiver = ['FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER'].includes(userRole);

  const pharmacistItems = [
    { href: '/pharmacy', icon: 'local_pharmacy', label: isAr ? 'الصيدلية' : 'Pharmacy' },
    { href: '/pharmacy/orders', icon: 'medication', label: isAr ? 'الطلبات' : 'Orders' },
    { href: '/pharmacies', icon: 'storefront', label: isAr ? 'الدليل' : 'Directory' },
    { href: '/profile', icon: 'person', label: isAr ? 'الملف' : 'Profile' },
  ];

  const caregiverItems = [
    { href: '/dashboard', icon: 'dashboard', label: isAr ? 'الرئيسية' : 'Dashboard' },
    { href: '/patients', icon: 'groups', label: isAr ? 'مرضاي' : 'My Patients' },
    { href: '/profile', icon: 'person', label: isAr ? 'الملف الشخصي' : 'Profile' },
  ];

  const patientItems = [
    { href: '/home', icon: 'home', labelKey: 'patient.nav.home', fallbackLabel: isAr ? 'الرئيسية' : 'Home' },
    { href: '/medications', icon: 'medication', labelKey: 'patient.nav.meds', fallbackLabel: isAr ? 'الأدوية' : 'Meds' },
    { href: '/refills', icon: 'autorenew', labelKey: 'patient.nav.refills', fallbackLabel: isAr ? 'التعبئة' : 'Refills' },
    { href: '/adherence', icon: 'query_stats', labelKey: 'patient.nav.adherence', fallbackLabel: isAr ? 'الالتزام' : 'Adherence' },
    { href: '/caregivers', icon: 'groups', labelKey: 'patient.nav.care', fallbackLabel: isAr ? 'الرعاية' : 'Care' },
    { href: '/profile', icon: 'person', labelKey: 'patient.nav.profile', fallbackLabel: isAr ? 'الملف' : 'Profile' },
  ];

  const navItems = isPharmacist ? pharmacistItems : isCaregiver ? caregiverItems : patientItems;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-3 sm:px-6 py-2 pb-safe bg-surface-container-lowest/90 dark:bg-surface-container-low/95 backdrop-blur-2xl border-t border-outline-variant/30 shadow-[0_-6px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-6px_25px_rgba(0,0,0,0.4)] transition-colors duration-300">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href === '/pharmacy' && (pathname === '/pharmacy' || pathname === '/pharmacy/dashboard')) ||
          (item.href === '/pharmacy/orders' && pathname === '/pharmacy/orders') ||
          (item.href === '/refills' && pathname?.startsWith('/refills')) ||
          (item.href === '/home' && (pathname === '/home' || pathname === '/dashboard' || pathname === '/')) ||
          (item.href === '/medications' && (pathname?.startsWith('/medications') || pathname?.startsWith('/ocr-scan'))) ||
          (item.href === '/caregivers' && pathname?.startsWith('/caregivers')) ||
          (item.href === '/patients' && pathname?.startsWith('/patients')) ||
          (item.href === '/pharmacies' && pathname?.startsWith('/pharmacies')) ||
          (item.href === '/profile' && (pathname?.startsWith('/profile') || pathname?.startsWith('/medical-records')));

        const displayLabel = item.label || (item.labelKey ? t(item.labelKey) : item.fallbackLabel);

        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 group cursor-pointer active:scale-95 transition-transform duration-150"
          >
            {/* Active Pill Glow Background */}
            {isActive && (
              <span className="absolute inset-x-1 sm:inset-x-2 top-0.5 bottom-0.5 rounded-2xl bg-primary-container/30 dark:bg-primary-container/20 border border-primary/20 animate-in fade-in zoom-in-95 duration-200" />
            )}

            {/* Icon */}
            <span
              className={`material-symbols-outlined text-[22px] sm:text-[24px] relative z-10 transition-all duration-200 ${isActive
                ? 'text-primary scale-110'
                : 'text-on-surface-variant group-hover:text-on-surface'
                }`}
              style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 600" } : { fontVariationSettings: "'FILL' 0, 'wght' 400" }}
            >
              {item.icon}
            </span>

            {/* Label */}
            <span
              className={`text-[10px] sm:text-[11px] leading-tight tracking-tight relative z-10 mt-0.5 transition-all duration-200 ${isActive
                ? 'text-primary font-black scale-105'
                : 'text-on-surface-variant font-medium group-hover:text-on-surface'
                }`}
            >
              {displayLabel}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
export default MobileNav;
