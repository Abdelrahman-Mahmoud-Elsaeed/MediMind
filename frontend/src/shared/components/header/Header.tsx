'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Moon, Sun, HeartPulse, User, LogOut, ShieldCheck } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from '@/shared/lib/i18nContext';
import { LanguageToggler } from '@/shared/components/LanguageToggler';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { locale, t } = useTranslation();
  const { logout, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAr = mounted && locale === 'ar';

  return (
    <header className="sticky top-0 z-30 w-full bg-surface-container-lowest dark:bg-surface-container-low border-b border-outline-variant/30 transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Left Section: Brand Logo on Mobile / Title on Desktop */}
        <div className="flex items-center gap-3">
          {/* Mobile Brand Logo */}
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-xs">
              <HeartPulse className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-on-surface">
              MediMind
            </span>
          </div>

        </div>

        {/* Right Section: Mobile Language & Account Dropdown, Shared Theme & Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 1. Language Toggle (MOBILE ONLY - lg:hidden) */}
          <div className="lg:hidden">
            <LanguageToggler />
          </div>

          {/* 2. Dark/Light Theme Toggle */}
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-all cursor-pointer shadow-2xs"
            aria-label="Toggle Theme"
            title="Toggle Theme"
          >
            {mounted && resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-on-surface-variant" />
            )}
          </button>

          {/* 3. Notification Bell */}
          <Link
            href="/notifications"
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-all cursor-pointer shadow-2xs group"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-on-surface-variant group-hover:text-on-surface group-hover:scale-110 transition-transform" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-background" />
          </Link>

          {/* 4. Account / Profile Action Trigger using Shadcn DropdownMenu (MOBILE ONLY - lg:hidden) */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary-container/40 transition-all cursor-pointer shadow-2xs group"
                  aria-label="Account Profile Menu"
                  title="Account Profile Menu"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align={isAr ? 'start' : 'end'} className="w-52">
                {/* User Info Header */}
                <div className="p-3 border-b border-outline-variant/20 mb-1">
                  <p className="text-xs font-bold text-on-surface truncate">
                    {user?.name || user?.email || (isAr ? 'حساب المريض' : 'Patient Account')}
                  </p>
                  <p className="text-[10px] text-on-surface-variant capitalize">
                    {user?.role?.toLowerCase() || (isAr ? 'مريض' : 'patient')}
                  </p>
                </div>

                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container transition-colors w-full"
                  >
                    <User className="w-4 h-4 text-primary" />
                    <span>{t('patient.nav.profile')}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/caregivers"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container transition-colors w-full"
                  >
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>{t('patient.nav.care')}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => logout?.()}
                  className="text-error hover:bg-error-container/20 text-xs font-bold gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-error" />
                  <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
