'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18nContext';
import { AppBadge, Avatar, AvatarFallback } from '@/shared/components/ui';

export function CaregiverPatientHeader({ patient, relationship }) {
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';
  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  const user = patient?.user || {};
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || t('caregiver.patientHub.unnamedPatient');
  const initials = (fullName[0] || 'P').toUpperCase();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link 
        href="/caregivers"
        className="inline-flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors group"
      >
        <BackIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
        <span>{t('caregiver.patientHub.backToList')}</span>
      </Link>

      {/* Patient Header Banner Card */}
      <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary/20 shadow-xs">
              <AvatarFallback className="bg-primary-container text-on-primary-container font-black text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-on-surface">
                  {fullName}
                </h1>
                <AppBadge variant={relationship?.status === 'ACTIVE' ? 'primaryContainer' : 'secondary'}>
                  {relationship?.status === 'ACTIVE' 
                    ? t('caregiver.patientHub.activeConnection') 
                    : t('common.actions.pending')}
                </AppBadge>
              </div>
              <p className="text-xs text-on-surface-variant font-medium">
                {user.email || t('caregiver.patientHub.noEmail')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaregiverPatientHeader;
