'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { 
  User, 
  Phone, 
  ShieldCheck, 
  Bell, 
  DollarSign, 
  Award, 
  Briefcase, 
  Globe, 
  Save, 
  CheckCircle2, 
  MessageSquare,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18nContext';
import { AppCard, AppButton, AppBadge, AppInput } from '@/shared/components/ui';
import { 
  useCaregiverProfileQuery, 
  useUpdateCaregiverProfileMutation 
} from '@/modules/caregiver/hooks/useCaregiverQueries';

export default function CaregiverProfile() {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';

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
      <MainLayout activePath="/profile">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-40 bg-surface-container-low rounded-3xl" />
          <div className="h-64 bg-surface-container-low rounded-3xl" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout activePath="/profile">
      <div className="space-y-8 max-w-4xl mx-auto pb-12" dir={isAr ? 'rtl' : 'ltr'}>
        {/* Profile Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 p-6 sm:p-8 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary font-black text-2xl shadow-lg shadow-primary/20 shrink-0">
                {(formData.firstName || 'C').charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AppBadge variant={isProfessional ? 'primary' : 'secondary'}>
                    {isProfessional 
                      ? (isAr ? 'مقدم رعاية محترف (مرخص)' : 'Professional Caregiver') 
                      : (isAr ? 'مقدم رعاية عائلي' : 'Family Caregiver')}
                  </AppBadge>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                  {formData.firstName} {formData.lastName}
                </h1>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {isAr ? 'إدارة بيانات الحساب وإعدادات التنبيهات' : 'Account profile & alert notifications management'}
                </p>
              </div>
            </div>

            {saveSuccess && (
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-2xl text-xs font-bold border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAr ? 'تم حفظ التغييرات بنجاح!' : 'Profile saved successfully!'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal Details */}
          <AppCard className="p-6 border border-outline-variant/30 rounded-3xl space-y-6">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2 border-b border-outline-variant/20 pb-3">
              <User className="w-5 h-5 text-primary" />
              <span>{isAr ? 'البيانات الشخصية' : 'Personal Information'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                  {isAr ? 'الاسم الأول' : 'First Name'}
                </label>
                <input 
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                  {isAr ? 'اسم العائلة' : 'Last Name'}
                </label>
                <input 
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                  {isAr ? 'رقم الهاتف البديل' : 'Alternative Phone'}
                </label>
                <input 
                  type="text"
                  value={formData.alternativePhone}
                  onChange={(e) => setFormData({ ...formData, alternativePhone: e.target.value })}
                  placeholder="+20 100 000 0000"
                  className="w-full px-4 py-2.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                  {isAr ? 'اللغة المفضلة' : 'Preferred Language'}
                </label>
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ar">العربية (Arabic)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </AppCard>

          {/* Section 2: Professional Caregiver Details (Only rendered if Professional Caregiver) */}
          {isProfessional && (
            <AppCard className="p-6 border border-outline-variant/30 rounded-3xl space-y-6 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
              <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2 border-b border-outline-variant/20 pb-3">
                <Briefcase className="w-5 h-5 text-primary" />
                <span>{isAr ? 'بيانات الاعتماد المهني والتكلفة' : 'Professional Credentials & Rates'}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                    {isAr ? 'سعر الساعة (جنيه مصري)' : 'Hourly Rate (EGP/hr)'}
                  </label>
                  <input 
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                    {isAr ? 'رقم الترخيص المهني' : 'License Number'}
                  </label>
                  <input 
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    placeholder="LIC-99201"
                    className="w-full px-4 py-2.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                    {isAr ? 'نبذة شخصية والخبرات' : 'Professional Bio'}
                  </label>
                  <textarea 
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder={isAr ? 'اكتب نبذة مختصرة عن خبراتك ومؤهلاتك الرعائية...' : 'Write a short bio about your caregiving background...'}
                    className="w-full px-4 py-2.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between bg-surface-container-low p-4 rounded-2xl">
                  <div>
                    <span className="font-bold text-sm text-on-surface block">
                      {isAr ? 'متاح لاستقبال طلبات العمل الفورية' : 'Available for immediate hires'}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {isAr ? 'تفعيل ظهورك في قائمة البحث للمرضى العائلات' : 'Enable discovery in caregiver directory for families'}
                    </span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-5 h-5 rounded accent-primary cursor-pointer"
                  />
                </div>
              </div>
            </AppCard>
          )}

          {/* Section 3: Notification & Alert Preferences */}
          <AppCard className="p-6 border border-outline-variant/30 rounded-3xl space-y-4">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2 border-b border-outline-variant/20 pb-3">
              <Bell className="w-5 h-5 text-amber-500" />
              <span>{isAr ? 'إعدادات التنبيهات والإشعارات' : 'Notification Preferences'}</span>
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-surface-container-low rounded-2xl">
                <div>
                  <span className="font-bold text-xs text-on-surface block">
                    {isAr ? 'تنبيه فوري عند تباعد أو نسيان الجرعة' : 'Instant Missed Dose Alert'}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    {isAr ? 'إرسال إشعار فوراً في حال عدم تأكيد المريض للجرعة' : 'Receive immediate push notification when a dose is missed'}
                  </span>
                </div>
                <input 
                  type="checkbox"
                  checked={formData.alertSettings.instantMissed}
                  onChange={(e) => setFormData({
                    ...formData,
                    alertSettings: { ...formData.alertSettings, instantMissed: e.target.checked }
                  })}
                  className="w-5 h-5 rounded accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-surface-container-low rounded-2xl">
                <div>
                  <span className="font-bold text-xs text-on-surface block">
                    {isAr ? 'تقرير الالتزام الأسبوعي' : 'Weekly Adherence Digest'}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    {isAr ? 'ملخص أسبوعي شاملاً نسب الالتزام لجميع المرضى المرتبطين' : 'Weekly adherence breakdown for all linked patients'}
                  </span>
                </div>
                <input 
                  type="checkbox"
                  checked={formData.alertSettings.weeklyReport}
                  onChange={(e) => setFormData({
                    ...formData,
                    alertSettings: { ...formData.alertSettings, weeklyReport: e.target.checked }
                  })}
                  className="w-5 h-5 rounded accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-surface-container-low rounded-2xl">
                <div>
                  <span className="font-bold text-xs text-on-surface block">
                    {isAr ? 'تفعيل تنبيهات واتساب' : 'WhatsApp Notification Opt-In'}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    {isAr ? 'استلام تنبيهات الالتزام والجرعات الهامة عبر WhatsApp' : 'Receive urgent care alerts directly on WhatsApp'}
                  </span>
                </div>
                <input 
                  type="checkbox"
                  checked={formData.whatsappOptIn}
                  onChange={(e) => setFormData({ ...formData, whatsappOptIn: e.target.checked })}
                  className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </AppCard>

          {/* Submit Button */}
          <div className="flex justify-end">
            <AppButton 
              type="submit" 
              variant="primary" 
              isLoading={updateMutation.isPending}
              className="px-8 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20"
            >
              <Save className="w-4 h-4 mr-2 rtl:ml-2" />
              <span>{isAr ? 'حفظ التعديلات' : 'Save Profile Changes'}</span>
            </AppButton>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
