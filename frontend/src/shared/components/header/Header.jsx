'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Moon, Sun, HeartPulse, User, LogOut, ShieldCheck } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from '@/shared/lib/i18nContext';
import { LanguageToggler } from '@/shared/components/LanguageToggler';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, } from '@/shared/components/ui/dropdown-menu';

import { useSocketNotifications } from '@/shared/hooks';
import { 
  usePatientRelationshipsQuery, 
  useUpdateRelationshipStatusMutation as useUpdatePatientStatusMutation 
} from '@/modules/patient/hooks/usePatientQueries';
import { 
  useCaregiverRelationshipsQuery, 
  useUpdateRelationshipStatusMutation as useUpdateCaregiverStatusMutation 
} from '@/modules/caregiver/hooks/useCaregiverQueries';

// ==========================================
// SUB-COMPONENT: NOTIFICATION POPOVER MENU
// ==========================================
function NotificationPopover({ locale, t }) {
  const isRtl = locale === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { user } = useAuth();

  const { notifications = [], unreadCount: notifUnreadCount, markAsRead, markAllAsRead } = useSocketNotifications();

  const isCaregiverRole = ['FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER', 'DOCTOR'].includes(user?.role);

  const { data: patientRels = [] } = usePatientRelationshipsQuery();
  const patientUpdateStatus = useUpdatePatientStatusMutation();

  const { data: caregiverRels = [] } = useCaregiverRelationshipsQuery();
  const caregiverUpdateStatus = useUpdateCaregiverStatusMutation();

  const pendingIncoming = isCaregiverRole
    ? caregiverRels.filter((r) => r.status === 'PENDING' && r.initiatedBy === 'PATIENT')
    : patientRels.filter((r) => r.status === 'PENDING' && r.initiatedBy === 'CAREGIVER');

  const totalUnread = pendingIncoming.length + notifUnreadCount;

  const handleResponse = (relationshipId, status) => {
    if (isCaregiverRole) {
      caregiverUpdateStatus.mutate({ relationshipId, status });
    } else {
      patientUpdateStatus.mutate({ relationshipId, status });
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
        {totalUnread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-background animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-full mt-2.5 w-80 sm:w-96 bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-xl z-50 text-on-surface overflow-hidden transition-all duration-200`}
        >
          <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container/40">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-on-surface">
                {isRtl ? "الإشعارات وطلبات الربط" : "Notifications & Invites"}
              </h3>
              {totalUnread > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-black">
                  {totalUnread} {isRtl ? "جديد" : "new"}
                </span>
              )}
            </div>
            {notifUnreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                {isRtl ? "تحديد الكل كقروء" : "Mark all read"}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/10">
            {pendingIncoming.length === 0 && notifications.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-xs font-medium">
                {isRtl ? "لا توجد إشعارات أو طلبات ربط جديدة" : "No new notifications or connection requests"}
              </div>
            ) : (
              <>
                {/* 1. Pending Relationship Requests */}
                {pendingIncoming.map((n) => {
                  const partnerName = isCaregiverRole
                    ? (n.patientId ? `${n.patientId.firstName || ''} ${n.patientId.lastName || ''}`.trim() || n.patientId.email : (isRtl ? 'مريض' : 'Patient'))
                    : (n.caregiverId ? `${n.caregiverId.firstName || ''} ${n.caregiverId.lastName || ''}`.trim() || n.caregiverId.email : (isRtl ? 'مقدم رعاية' : 'Caregiver'));

                  const isPendingMut = isCaregiverRole ? caregiverUpdateStatus.isPending : patientUpdateStatus.isPending;

                  return (
                    <div
                      key={n.relationshipId}
                      className="p-4 hover:bg-surface-container/60 transition-colors flex flex-col gap-2.5 relative bg-primary-container/10"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 font-bold">
                          <Bell className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-extrabold text-on-surface truncate">
                            {partnerName}
                          </h4>
                          <p className="text-[11px] text-on-surface-variant leading-relaxed">
                            {isRtl
                              ? `طلب ربط حساب جديد - صلة القرابة: ${n.relation || 'عائلة'}`
                              : `New connection request - Relation: ${n.relation || 'Family'}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleResponse(n.relationshipId, 'ACCEPTED')}
                          disabled={isPendingMut}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isRtl ? "قبول" : "Accept"}
                        </button>
                        <button
                          onClick={() => handleResponse(n.relationshipId, 'REJECTED')}
                          disabled={isPendingMut}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isRtl ? "رفض" : "Decline"}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* 2. Real-Time Persisted DB Notifications */}
                {notifications.slice(0, 10).map((notif) => (
                  <div
                    key={notif.id || notif.notificationId}
                    onClick={() => !notif.isRead && markAsRead(notif.id || notif.notificationId)}
                    className={`p-3.5 hover:bg-surface-container/60 transition-colors flex items-start gap-3 relative ${
                      !notif.isRead ? 'bg-teal-500/5' : ''
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 font-bold">
                      <Bell className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-on-surface truncate">
                        {isRtl && notif.titleAr ? notif.titleAr : notif.title}
                      </h4>
                      <p className="text-[11px] text-on-surface-variant leading-snug line-clamp-2 mt-0.5">
                        {isRtl && notif.messageAr ? notif.messageAr : notif.message}
                      </p>
                    </div>

                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1" />
                    )}
                  </div>
                ))}
              </>
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
    const isAr = mounted && locale === 'ar';
    return (<header className="sticky top-0 z-30 w-full bg-surface-container-lowest dark:bg-surface-container-low border-b border-outline-variant/30 transition-colors duration-200">
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
          <button type="button" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-all cursor-pointer shadow-2xs" aria-label="Toggle Theme" title="Toggle Theme">
            {mounted && resolvedTheme === 'dark' ? (<Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400"/>) : (<Moon className="w-4 h-4 sm:w-5 sm:h-5 text-on-surface-variant"/>)}
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
                    {user?.name || user?.email?.split('@')[0] || t('common.roles.userAccount')}
                  </p>
                  <p className="text-[10px] font-bold text-primary capitalize">
                    {user?.role === 'FAMILY_CAREGIVER' ? t('common.roles.familyCaregiver')
                     : user?.role === 'PROFESSIONAL_CAREGIVER' ? t('common.roles.professionalCaregiver')
                     : user?.role === 'CAREGIVER' ? t('common.roles.caregiver')
                     : user?.role === 'ADMIN' ? t('common.roles.admin')
                     : t('common.roles.patient')}
                  </p>
                </div>

                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container transition-colors w-full">
                    <User className="w-4 h-4 text-primary"/>
                    <span>{t('common.nav.myProfile')}</span>
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
                        ? t('common.nav.myPatients')
                        : t('common.nav.caregiversCircle')}
                    </span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => logout?.()} className="text-error hover:bg-error-container/20 text-xs font-bold gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer">
                  <LogOut className="w-4 h-4 text-error"/>
                  <span>{t('common.nav.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>);
};
export default Header;
