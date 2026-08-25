'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { useTranslation } from '@/shared/lib/i18nContext';
import { Card, Badge, Button, Input } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/sonner';
import {
  useRegisterProvider,
  useRegisterProfessional,
} from '../hooks/useAdminHooks';
import { UserPlus, Sparkles } from 'lucide-react';

export default function AdminCreateUserComponent() {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const [creationRole, setCreationRole] = useState('DOCTOR'); // 'DOCTOR' | 'PHARMACIST' | 'PROFESSIONAL_CAREGIVER'

  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalNumber: '',
    password: '',
    specialty: '',
    syndicateId: '',
    clinicName: '',
    pharmacyName: '',
    licenseNumber: '',
    specialization: '',
    hourlyRate: '',
  });

  const registerProviderMutation = useRegisterProvider();
  const registerProfessionalMutation = useRegisterProfessional();

  const handleCreateSubmit = (e) => {
    e.preventDefault();

    if (!createForm.email || !createForm.password || !createForm.firstName) {
      toast.error(isAr ? 'يرجى إكمال البيانات الأساسية' : 'Please fill out all required fields');
      return;
    }

    if (creationRole === 'PROFESSIONAL_CAREGIVER') {
      registerProfessionalMutation.mutate(
        {
          firstName: createForm.firstName,
          lastName: createForm.lastName,
          email: createForm.email,
          phone: createForm.phone,
          nationalNumber: createForm.nationalNumber || '1000000000',
          password: createForm.password,
          licenseNumber: createForm.licenseNumber || 'LIC-100',
          specialization: createForm.specialization || 'General Care',
          hourlyRate: Number(createForm.hourlyRate) || 50,
        },
        {
          onSuccess: () => {
            toast.success(isAr ? 'تم إنشاء حساب مقدم الرعاية المحترف بنجاح!' : 'Professional Caregiver Account Created!');
            setCreateForm({
              firstName: '', lastName: '', email: '', phone: '', nationalNumber: '', password: '',
              specialty: '', syndicateId: '', clinicName: '', pharmacyName: '', licenseNumber: '', specialization: '', hourlyRate: '',
            });
          },
          onError: (err) => {
            toast.error(isAr ? 'فشل إنشاء الحساب' : 'Creation Failed', {
              description: err?.response?.data?.message || err?.message,
            });
          },
        }
      );
    } else {
      registerProviderMutation.mutate(
        {
          role: creationRole,
          firstName: createForm.firstName,
          lastName: createForm.lastName,
          email: createForm.email,
          phone: createForm.phone,
          nationalNumber: createForm.nationalNumber || '1000000000',
          password: createForm.password,
          specialty: createForm.specialty || 'General Practice',
          syndicateId: createForm.syndicateId || 'SYN-999',
          clinicName: createForm.clinicName || 'MediClinic',
          pharmacyName: createForm.pharmacyName || 'Central Pharma',
          licenseNumber: createForm.licenseNumber || 'LIC-200',
        },
        {
          onSuccess: () => {
            toast.success(
              isAr
                ? `تم إنشاء حساب ${creationRole === 'DOCTOR' ? 'الطبيب' : 'الصيدلية'} المعتمد بنجاح!`
                : `${creationRole === 'DOCTOR' ? 'Doctor' : 'Pharmacy'} Account Created Successfully!`
            );
            setCreateForm({
              firstName: '', lastName: '', email: '', phone: '', nationalNumber: '', password: '',
              specialty: '', syndicateId: '', clinicName: '', pharmacyName: '', licenseNumber: '', specialization: '', hourlyRate: '',
            });
          },
          onError: (err) => {
            toast.error(isAr ? 'فشل إنشاء الحساب' : 'Creation Failed', {
              description: err?.response?.data?.message || err?.message,
            });
          },
        }
      );
    }
  };

  return (
    <MainLayout activePath="/admin-dashboard/create">
      <div className="max-w-[1280px] mx-auto space-y-8 pb-16">
        {/* Main Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl border border-indigo-500/20">
          <div className="relative z-10 space-y-2">
            <Badge variant="default" className="bg-indigo-600 text-white font-extrabold text-[10px] px-3 py-1">
              <UserPlus className="w-3.5 h-3.5 mr-1" />
              {isAr ? 'إصدار حساب مفعل' : 'Single-Entry Account Creation'}
            </Badge>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {isAr ? 'إنشاء حساب مزود جديد مباشر' : 'Single-Entry User Creation'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {isAr
                ? 'إنشاء حساب طبيب أو صيدلي أو مقدم رعاية محترف مباشرة مع الاعتماد المسبق والتفعيل الفوري.'
                : 'Create pre-approved provider accounts directly bypassing manual registration approval queues.'}
            </p>
          </div>
        </div>

        {/* Creation Form Card */}
        <Card className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 p-8 rounded-3xl max-w-2xl mx-auto space-y-6">
          {/* Role Switcher */}
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setCreationRole('DOCTOR')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                creationRole === 'DOCTOR' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {isAr ? 'طبيب' : 'Doctor'}
            </button>
            <button
              type="button"
              onClick={() => setCreationRole('PHARMACIST')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                creationRole === 'PHARMACIST' ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {isAr ? 'صيدلية' : 'Pharmacy'}
            </button>
            <button
              type="button"
              onClick={() => setCreationRole('PROFESSIONAL_CAREGIVER')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                creationRole === 'PROFESSIONAL_CAREGIVER' ? 'bg-white dark:bg-slate-800 text-purple-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {isAr ? 'مقدم رعاية' : 'Caregiver'}
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold block mb-1">{isAr ? 'الاسم الأول' : 'First Name'}</label>
                <Input
                  required
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">{isAr ? 'اسم العائلة' : 'Last Name'}</label>
                <Input
                  required
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold block mb-1">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
                <Input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="doctor@example.com"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">{isAr ? 'رقم الهاتف' : 'Phone Number'}</label>
                <Input
                  required
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="+201000000000"
                />
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1">{isAr ? 'كلمة السر المبدئية' : 'Initial Password'}</label>
              <Input
                type="password"
                required
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            {/* Role-Specific Fields */}
            {creationRole === 'DOCTOR' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="font-bold block mb-1">{isAr ? 'التخصص' : 'Specialty'}</label>
                  <Input
                    value={createForm.specialty}
                    onChange={(e) => setCreateForm({ ...createForm, specialty: e.target.value })}
                    placeholder="Cardiology"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">{isAr ? 'رقم النقابة' : 'Syndicate ID'}</label>
                  <Input
                    value={createForm.syndicateId}
                    onChange={(e) => setCreateForm({ ...createForm, syndicateId: e.target.value })}
                    placeholder="SYN-998877"
                  />
                </div>
              </div>
            )}

            {creationRole === 'PHARMACIST' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="font-bold block mb-1">{isAr ? 'اسم الصيدلية' : 'Pharmacy Name'}</label>
                  <Input
                    value={createForm.pharmacyName}
                    onChange={(e) => setCreateForm({ ...createForm, pharmacyName: e.target.value })}
                    placeholder="El-Ezaby Pharmacy"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">{isAr ? 'رقم الترخيص' : 'License Number'}</label>
                  <Input
                    value={createForm.licenseNumber}
                    onChange={(e) => setCreateForm({ ...createForm, licenseNumber: e.target.value })}
                    placeholder="LIC-554433"
                  />
                </div>
              </div>
            )}

            {creationRole === 'PROFESSIONAL_CAREGIVER' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="font-bold block mb-1">{isAr ? 'التخصص التمريضي' : 'Specialization'}</label>
                  <Input
                    value={createForm.specialization}
                    onChange={(e) => setCreateForm({ ...createForm, specialization: e.target.value })}
                    placeholder="Elderly Intensive Care"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">{isAr ? 'الأجر بالساعة ($)' : 'Hourly Rate ($)'}</label>
                  <Input
                    type="number"
                    value={createForm.hourlyRate}
                    onChange={(e) => setCreateForm({ ...createForm, hourlyRate: e.target.value })}
                    placeholder="45"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={registerProviderMutation.isPending || registerProfessionalMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 h-auto rounded-2xl shadow-lg mt-4"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isAr ? 'إنشاء وتفعيل الحساب فوراً' : 'Issue Direct Pre-Verified Account'}
            </Button>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
