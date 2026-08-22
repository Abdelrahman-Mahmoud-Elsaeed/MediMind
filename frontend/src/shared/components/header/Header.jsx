'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Moon, Sun, HeartPulse, User, LogOut, ShieldCheck } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from '@/shared/lib/i18nContext';
import { LanguageToggler } from '@/shared/components/LanguageToggler';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, } from '@/shared/components/ui/dropdown-menu';

import { useRouter } from 'next/navigation';
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/modules/notifications/hooks/useNotifications';

// Helper for formatting relative time
function formatRelativeTime(dateString, isAr) {
  if (!dateString) return isAr ? 'الآن' : 'Just now';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return isAr ? 'الآن' : 'Just now';
  if (diffMins < 60) return isAr ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return isAr ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return isAr ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
}

// Resolve route based on notification type and user role
function getNotificationRoute(notification, userRole) {
  if (!notification) return '/notifications';
  const { type } = notification;

  switch (type) {
    case 'REFILL_ORDER_CREATED':
      return userRole === 'PHARMACIST' ? '/pharmacy/orders' : '/refills';
    case 'REFILL_ORDER_UPDATED':
      return userRole === 'PHARMACIST' ? '/pharmacy/orders' : '/refills';
    case 'DOSE_REMINDER':
      return '/home';
    case 'MEDICATION_LOW_STOCK':
      return '/refills';
    case 'CAREGIVER_INVITATION':
      return userRole === 'PATIENT' ? '/caregivers' : '/patients';
    default:
      return '/notifications';
  }
}

// ==========================================
// SUB-COMPONENT: NOTIFICATION POPOVER MENU
// ==========================================
function NotificationPopover({ locale, t }) {
  const router = useRouter();
  const isRtl = locale === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const { user } = useAuth();
  const { data: notificationsData } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const notifications = notificationsData?.data || (Array.isArray(notificationsData) ? notificationsData : []);

  const markAllRead = () => {
    markAllMutation.mutate();
  };

  const markItemRead = (id) => {
    if (id) {
      markReadMutation.mutate(id);
    }
  };

  const handleNotificationClick = (notification) => {
    const notifId = notification._id || notification.id;
    if (!notification.isRead && notifId) {
      markItemRead(notifId);
    }
    setIsOpen(false);
    const targetRoute = getNotificationRoute(notification, user?.role);
    if (targetRoute) {
      if (typeof window !== 'undefined' && window.location.pathname === targetRoute) {
        // If already on the target page, scroll to content or trigger reload
        window.location.reload();
      } else {
        router.push(targetRoute);
      }
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-all cursor-pointer shadow-2xs group relative"
        aria-label="Toggle notifications"
        title="Notifications"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-on-surface-variant group-hover:text-on-surface group-hover:scale-110 transition-transform"/>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-teal-600 text-white rounded-full ring-2 ring-background text-[10px] font-black flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-full mt-2.5 w-80 sm:w-96 bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-xl z-50 text-on-surface overflow-hidden transition-all duration-200`}
        >
          <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container/40">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-on-surface">
                {isRtl ? "الإشعارات" : "Notifications"}
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-black">
                  {unreadCount} {isRtl ? "جديد" : "new"}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                {isRtl ? "تحديد الكل كمقروء" : "Mark all as read"}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/10">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-xs font-medium">
                {isRtl ? "لا توجد إشعارات جديدة" : "No notifications yet"}
              </div>
            ) : (
              notifications.map((n) => {
                const notifId = n._id || n.id;
                const isUnread = !n.isRead;
                const title = n.title;
                const desc = n.message;
                const time = formatRelativeTime(n.createdAt, isRtl);

                return (
                  <div
                    key={notifId}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 hover:bg-surface-container/60 transition-colors flex items-start gap-3.5 cursor-pointer relative ${
                      isUnread ? "bg-teal-500/10 dark:bg-teal-950/40" : ""
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <Bell className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4 className={`text-xs truncate ${isUnread ? 'font-extrabold text-teal-700 dark:text-teal-300' : 'font-bold text-on-surface'}`}>
                          {title}
                        </h4>
                        <span className="text-[10px] text-on-surface-variant shrink-0 font-medium">{time}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                        {desc}
                      </p>
                    </div>

                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1.5 animate-pulse"></span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-surface-container/40 border-t border-outline-variant/20 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
            >
              <span>{isRtl ? "عرض جميع الإشعارات" : "View All Notifications"}</span>
              <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export const Header = () => {
    const { resolvedTheme, setTheme } = useTheme();
    const { locale, t } = useTranslation();
    const { logout, user } = useAuth();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    const isAr = locale === 'ar';
    return (<header className="sticky top-0 z-30 w-full bg-surface-container-lowest dark:bg-surface-container-low border-b border-outline-variant/30 transition-colors duration-200" suppressHydrationWarning>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Brand Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Brand Logo */}
          <Link href="/home" className="lg:hidden flex items-center gap-2.5">
            <img
              src="/images/logo.png"
              alt="MediMind Logo"
              className="w-9 h-9 object-contain rounded-xl shadow-xs"
            />
            <span className="text-lg font-black tracking-tight">
              <span className="text-[#0047ba] dark:text-[#3b82f6]">Medi</span>
              <span className="text-[#00a396] dark:text-[#14b8a6]">Mind</span>
            </span>
          </Link>
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
            suppressHydrationWarning
          >
            {mounted && resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400"/>
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-on-surface-variant"/>
            )}
          </button>

          {/* 3. Notification Popover */}
          <NotificationPopover locale={locale} t={t} />

          {/* 4. Account / Profile Action Trigger using Shadcn DropdownMenu (MOBILE ONLY - lg:hidden) */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary-container/40 transition-all cursor-pointer shadow-2xs group" aria-label="Account Profile Menu" title="Account Profile Menu">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform"/>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align={isAr ? 'start' : 'end'} className="w-52">
                {/* User Info Header */}
                <div className="p-3 border-b border-outline-variant/20 mb-1">
                  <p className="text-xs font-bold text-on-surface truncate">
                    {user?.name || user?.email?.split('@')[0] || (isAr ? 'حساب المستخدم' : 'User Account')}
                  </p>
                  <p className="text-[10px] font-bold text-primary capitalize">
                    {user?.role === 'FAMILY_CAREGIVER' ? (isAr ? 'مقدم رعاية عائلي' : 'Family Caregiver')
                     : user?.role === 'PROFESSIONAL_CAREGIVER' ? (isAr ? 'مقدم رعاية محترف' : 'Professional Caregiver')
                     : user?.role === 'CAREGIVER' ? (isAr ? 'مقدم رعاية' : 'Caregiver')
                     : user?.role === 'ADMIN' ? (isAr ? 'مسؤول النظام' : 'Administrator')
                     : (isAr ? 'مريض' : 'Patient')}
                  </p>
                </div>

                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container transition-colors w-full">
                    <User className="w-4 h-4 text-primary"/>
                    <span>{isAr ? 'الملف الشخصي' : 'My Profile'}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link 
                    href={['FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER'].includes(user?.role) ? '/patients' : '/caregivers'} 
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container transition-colors w-full"
                  >
                    <ShieldCheck className="w-4 h-4 text-primary"/>
                    <span>
                      {['FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER'].includes(user?.role)
                        ? (isAr ? 'قائمة المرضى' : 'My Patients')
                        : (isAr ? 'دائرة الرعاية' : 'Caregivers Circle')}
                    </span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => logout?.()} className="text-error hover:bg-error-container/20 text-xs font-bold gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer">
                  <LogOut className="w-4 h-4 text-error"/>
                  <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>);
};
export default Header;
