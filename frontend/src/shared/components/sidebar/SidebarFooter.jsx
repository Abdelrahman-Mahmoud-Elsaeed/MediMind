'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18nContext';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LanguageToggler } from '@/shared/components/LanguageToggler';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar';
import { usePatientProfileQuery } from '@/modules/patient/hooks/usePatientQueries';
import { useCaregiverProfileQuery } from '@/modules/caregiver/hooks/useCaregiverQueries';

export const SidebarFooter = ({ isSidebarSlim = false }) => {
  const { t, locale } = useTranslation();
  const { user, logout } = useAuth();
  const isAr = locale === 'ar';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeUser = mounted ? user : null;
  const userRoleStr = activeUser?.role;
  const isPharmacist = userRoleStr === 'PHARMACIST';
  const isCaregiver = ['FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER'].includes(userRoleStr);

  const { data: patientProfile } = usePatientProfileQuery({ enabled: Boolean(mounted && activeUser && !isCaregiver && !isPharmacist) });
  const { data: caregiverProfile } = useCaregiverProfileQuery({ enabled: Boolean(mounted && activeUser && isCaregiver) });

  const activeProfile = isCaregiver ? caregiverProfile : patientProfile;

  const userName = isPharmacist
    ? activeUser?.pharmacyName || activeUser?.name || activeUser?.email?.split('@')[0] || (isAr ? 'صيدلية معتمدة' : 'Pharmacy')
    : activeProfile?.firstName && activeProfile?.lastName
    ? `${activeProfile.firstName} ${activeProfile.lastName}`
    : activeUser?.name || activeUser?.email?.split('@')[0] || (isAr ? 'مستخدم' : 'User');

  const userRole = activeUser?.role === 'PHARMACIST'
    ? t('common.roles.pharmacist')
    : activeUser?.role === 'ADMIN'
    ? t('common.roles.admin')
    : activeUser?.role === 'FAMILY_CAREGIVER' 
    ? t('common.roles.familyCaregiver')
    : activeUser?.role === 'PROFESSIONAL_CAREGIVER'
    ? t('common.roles.professionalCaregiver')
    : activeUser?.role === 'CAREGIVER'
    ? t('common.roles.caregiver')
    : t('common.roles.patient');

  const userInitial = userName.charAt(0).toUpperCase();
  const avatarSrc = activeProfile?.profilePictureUrl || activeUser?.profilePictureUrl || '';

  if (isSidebarSlim) {
    return (
      <div className="pt-4 border-t border-outline-variant/30 flex flex-col items-center gap-3" suppressHydrationWarning>
        <Link href="/profile" title={userName} className="group">
          <Avatar className="w-10 h-10 border-2 border-primary/30 group-hover:border-primary transition-colors">
            {avatarSrc ? <AvatarImage src={avatarSrc} alt={userName} className="object-cover" /> : null}
            <AvatarFallback className="bg-teal-600 text-white font-bold">{userInitial}</AvatarFallback>
          </Avatar>
        </Link>
        {logout && (
          <button
            type="button"
            onClick={() => logout()}
            className="w-10 h-10 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-all cursor-pointer shrink-0 shadow-2xs"
            title={t('common.nav.logout')}
            aria-label={t('common.nav.logout')}
          >
            <LogOut className="w-4 h-4"/>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="pt-4 border-t border-outline-variant/30 space-y-3.5" suppressHydrationWarning>
      {/* Language Switcher */}
      <div className="w-full flex justify-center">
        <LanguageToggler />
      </div>

      {/* Patient Profile Card */}
      <div className="p-2.5 rounded-2xl bg-surface-container/40 dark:bg-surface-container/60 border border-outline-variant/20 hover:border-primary/30 hover:bg-surface-container/80 transition-all duration-200 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0 group">
            <div className="relative shrink-0">
              <Avatar className="w-10 h-10 border-2 border-primary/30 group-hover:border-primary transition-colors">
                {avatarSrc ? <AvatarImage src={avatarSrc} alt={userName} className="object-cover" /> : null}
                <AvatarFallback className="bg-teal-600 text-white font-bold">{userInitial}</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-background rounded-full"/>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                {userName}
              </span>
              <span className="text-[11px] text-on-surface-variant font-medium capitalize">
                {userRole}
              </span>
            </div>
          </Link>

          {/* Quick Sign Out Action Button */}
          {logout && (
            <button
              type="button"
              onClick={() => logout()}
              className="w-8 h-8 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-all cursor-pointer shrink-0 shadow-2xs"
              title={t('common.nav.logout')}
              aria-label={t('common.nav.logout')}
            >
              <LogOut className="w-4 h-4"/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
