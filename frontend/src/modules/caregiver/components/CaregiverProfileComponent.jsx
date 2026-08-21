'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Save, 
  CheckCircle2
} from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18nContext';
import { AppCard, AppButton, AppBadge, AppInput, Avatar, AvatarFallback } from '@/shared/components/ui';
import { 
  useCaregiverProfileQuery, 
  useUpdateCaregiverProfileMutation 
} from '@/modules/caregiver/hooks/useCaregiverQueries';

export function CaregiverProfileComponent() {
  const { t } = useTranslation();

  const { data: profile, isLoading } = useCaregiverProfileQuery();
  const updateMutation = useUpdateCaregiverProfileMutation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    alternativePhone: '',
    bio: '',
    hourlyRate: 150,
    isAvailable: true,
    specialties: ['General Nursing'],
    licenseNumber: '',
    experienceYears: 3,
    whatsappOptIn: false,
    preferredLanguage: 'ar',
    alertSettings: {
      instantMissed: true,
      weeklyReport: true,
      monthlyReport: false
    }
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        alternativePhone: profile.alternativePhone || '',
        bio: profile.bio || '',
        hourlyRate: profile.hourlyRate ?? 150,
        isAvailable: profile.isAvailable ?? true,
        specialties: profile.specialties || ['General Nursing'],
        licenseNumber: profile.licenseNumber || '',
        experienceYears: profile.experienceYears ?? 3,
        whatsappOptIn: profile.whatsappOptIn ?? false,
        preferredLanguage: profile.preferredLanguage || 'ar',
        alertSettings: {
          instantMissed: profile.alertSettings?.instantMissed ?? true,
          weeklyReport: profile.alertSettings?.weeklyReport ?? true,
          monthlyReport: profile.alertSettings?.monthlyReport ?? false
        }
      });
    }
  }, [profile]);

  const isProfessional = profile?.caregiverType === 'PROFESSIONAL_CAREGIVER';

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData, {
      onSuccess: () => {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-40 bg-surface-container-low rounded-3xl" />
        <div className="h-64 bg-surface-container-low rounded-3xl" />
      </div>
    );
  }

  const initials = `${formData.firstName?.[0] || 'C'}${formData.lastName?.[0] || ''}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <AppCard className="p-6 md:p-8 bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-high border-outline-variant/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-md">
            <AvatarFallback className="bg-primary-container text-on-primary-container font-black text-3xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center md:text-start flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl font-extrabold text-on-surface">
                {formData.firstName} {formData.lastName}
              </h1>
              <AppBadge variant={isProfessional ? 'primaryContainer' : 'secondary'}>
                {isProfessional 
                  ? t('caregiver.profile.professionalTitle') 
                  : t('caregiver.profile.familyTitle')}
              </AppBadge>
            </div>
            
            <p className="text-sm text-on-surface-variant max-w-lg">
              {formData.bio || t('caregiver.profile.noBio')}
            </p>
          </div>
        </div>
      </AppCard>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details Card */}
        <AppCard className="p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-on-surface">
              {t('caregiver.profile.personalInfo')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AppInput
              label={t('caregiver.profile.firstName')}
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <AppInput
              label={t('caregiver.profile.lastName')}
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
            <AppInput
              label={t('caregiver.profile.phone')}
              leftIcon={<Phone className="w-4 h-4" />}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <AppInput
              label={t('caregiver.profile.altPhone')}
              leftIcon={<Phone className="w-4 h-4" />}
              value={formData.alternativePhone}
              onChange={(e) => setFormData({ ...formData, alternativePhone: e.target.value })}
            />
          </div>
        </AppCard>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4">
          {saveSuccess && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>{t('common.actions.savedSuccessfully')}</span>
            </div>
          )}
          <AppButton
            type="submit"
            isLoading={updateMutation.isPending}
            leftIcon={<Save className="w-4 h-4" />}
            size="lg"
            className="ms-auto"
          >
            {t('common.actions.save')}
          </AppButton>
        </div>
      </form>
    </div>
  );
}

export default CaregiverProfileComponent;
