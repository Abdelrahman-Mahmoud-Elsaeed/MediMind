'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Pill, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  HeartPulse,
  Bell,
  Activity,
  UserCheck
} from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18nContext';
import { AppCard, AppButton, AppBadge } from '@/shared/components/ui';
import { 
  useCaregiverRelationshipsQuery, 
  useCaregiverProfileQuery,
  useUpdateRelationshipStatusMutation
} from '../hooks/useCaregiverQueries';

export function CaregiverDashboardComponent() {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const { data: profile } = useCaregiverProfileQuery();
  const { data: relationships = [], isLoading } = useCaregiverRelationshipsQuery();
  const updateStatusMutation = useUpdateRelationshipStatusMutation();

  const activePatients = relationships.filter((r) => r.status === 'ACCEPTED');
  const pendingRequests = relationships.filter((r) => r.status === 'PENDING');

  const isProfessional = profile?.caregiverType === 'PROFESSIONAL_CAREGIVER';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-2 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isProfessional 
                  ? (isAr ? 'مقدم رعاية محترف (مرخص)' : 'Professional Caregiver Portal') 
                  : (isAr ? 'مقدم رعاية عائلي' : 'Family Caregiver Portal')}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
              {isAr 
                ? `مرحباً بك، ${profile?.firstName || 'مقدم الرعاية'} 👋` 
                : `Welcome Back, ${profile?.firstName || 'Caregiver'} 👋`}
            </h1>
            <p className="text-on-surface-variant mt-2 text-sm sm:text-base max-w-2xl">
              {isAr 
                ? 'تابع حالة مرضائك، واطلع على جداول الجرعات والالتزام اليومي، واستجب لطلبات الربط الجديدة.' 
                : 'Monitor linked patient adherence, daily dose schedules, and accept connection requests.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/patients">
              <AppButton variant="primary" className="shadow-lg shadow-primary/20">
                <Users className="w-4 h-4 mr-2 rtl:ml-2" />
                <span>{isAr ? 'عرض كافة المرضى' : 'View Patients Roster'}</span>
              </AppButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AppCard className="p-6 border border-outline-variant/30 rounded-3xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
              {isAr ? 'المرضى النشطين' : 'Active Patients'}
            </span>
            <span className="text-3xl font-black text-primary mt-1 block">{activePatients.length}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </AppCard>

        <AppCard className="p-6 border border-outline-variant/30 rounded-3xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
              {isAr ? 'طلبات معلقة' : 'Pending Requests'}
            </span>
            <span className="text-3xl font-black text-amber-500 mt-1 block">{pendingRequests.length}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </AppCard>

        <AppCard className="p-6 border border-outline-variant/30 rounded-3xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
              {isAr ? 'متوسط الالتزام' : 'Avg Adherence'}
            </span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">94%</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </AppCard>

        <AppCard className="p-6 border border-outline-variant/30 rounded-3xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface-variant block uppercase tracking-wider">
              {isAr ? 'نوع الحساب' : 'Caregiver Role'}
            </span>
            <span className="text-sm font-extrabold text-on-surface mt-1 block">
              {isProfessional ? (isAr ? 'محترف' : 'Professional') : (isAr ? 'عائلي' : 'Family Care')}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-on-surface flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6 text-primary" />
          </div>
        </AppCard>
      </div>

      {/* Pending Requests Alert section */}
      {pendingRequests.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
            <h2 className="text-lg font-extrabold text-on-surface">
              {isAr ? 'طلبات الربط المعلقة' : 'Pending Connection Requests'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div 
                key={req.relationshipId}
                className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-on-surface text-base">
                    {req.patientId?.firstName} {req.patientId?.lastName}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {isAr ? 'العلاقة المطلوبة: ' : 'Relation: '} 
                    <span className="font-bold text-primary">{req.relation || 'Caregiver'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <AppButton
                    size="sm"
                    variant="primary"
                    onClick={() => updateStatusMutation.mutate({ relationshipId: req.relationshipId, status: 'ACCEPTED' })}
                    isLoading={updateStatusMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1 rtl:ml-1" />
                    {isAr ? 'قبول' : 'Accept'}
                  </AppButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Linked Patients Stream */}
      <AppCard className="p-6 border border-outline-variant/30 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-on-surface flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>{isAr ? 'قائمة المرضى المرتبطين' : 'Active Linked Patients'}</span>
          </h2>

          <Link href="/patients" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span>{isAr ? 'عرض الكل' : 'View All'}</span>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-surface-container-low animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : activePatients.length === 0 ? (
          <div className="text-center py-10 bg-surface-container-low/40 rounded-2xl">
            <Users className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-on-surface-variant">
              {isAr ? 'لا يوجد مرضى نشطين مرتبطيين حالياً' : 'No active linked patients'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePatients.map((item) => {
              const p = item.patientId || {};
              const pId = p._id || p.id;
              const name = `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient';

              return (
                <div 
                  key={item.relationshipId}
                  className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 flex items-center justify-between gap-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-on-surface text-base">{name}</h3>
                      <p className="text-xs text-on-surface-variant">{item.relation || 'Patient'}</p>
                    </div>
                  </div>

                  <Link 
                    href={`/patients/${pId}`}
                    className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-1 shadow-sm"
                  >
                    <span>{isAr ? 'المتابعة' : 'Manage'}</span>
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </AppCard>
    </div>
  );
}
export default CaregiverDashboardComponent;
