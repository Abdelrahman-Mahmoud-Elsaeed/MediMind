'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  UserCheck, 
  Clock, 
  Pill, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ShieldCheck,
  Heart,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18nContext';
import { AppCard, AppButton, AppBadge } from '@/shared/components/ui';
import { 
  useCaregiverRelationshipsQuery, 
  useUpdateRelationshipStatusMutation 
} from '../hooks/useCaregiverQueries';

export function CaregiverPatientsListComponent() {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const { data: relationships = [], isLoading, isError } = useCaregiverRelationshipsQuery();
  const updateStatusMutation = useUpdateRelationshipStatusMutation();

  const handleStatusUpdate = (relationshipId, status) => {
    updateStatusMutation.mutate({ relationshipId, status });
  };

  // Filter patients
  const filteredList = relationships.filter((item) => {
    const patientName = `${item.patientId?.firstName || ''} ${item.patientId?.lastName || ''}`.toLowerCase();
    const matchesSearch = patientName.includes(searchTerm.toLowerCase()) || 
                          (item.relation || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const activePatients = relationships.filter((r) => r.status === 'ACCEPTED');
  const pendingRequests = relationships.filter((r) => r.status === 'PENDING');

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-2">
              <ShieldCheck className="w-5 h-5" />
              <span>{isAr ? 'لوحة تحكم مقدم الرعاية' : 'Caregiver Portal'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
              {isAr ? 'مرضاي وقائمة المتابعة' : 'My Linked Patients'}
            </h1>
            <p className="text-on-surface-variant mt-2 text-base max-w-2xl">
              {isAr 
                ? 'تابع حالة أدوية عائلتك ومرضاك، واطلع على جداول الجرعات اليومية والسجلات الطبية بسهولة.' 
                : 'Monitor medication adherence, daily dose schedules, and health records for your linked patients.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 shadow-sm text-center min-w-[120px]">
              <span className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">
                {isAr ? 'نشطين' : 'Active'}
              </span>
              <span className="text-2xl font-black text-primary">{activePatients.length}</span>
            </div>

            <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 shadow-sm text-center min-w-[120px]">
              <span className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">
                {isAr ? 'معلقة' : 'Pending'}
              </span>
              <span className="text-2xl font-black text-amber-500">{pendingRequests.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Invitations Banner */}
      {pendingRequests.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
            <h2 className="text-lg font-bold text-on-surface">
              {isAr ? 'طلبات ربط جديدة بانتظار الموافقة' : 'Pending Connection Requests'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div 
                key={req.relationshipId}
                className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-on-surface">
                    {req.patientId?.firstName} {req.patientId?.lastName}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {isAr ? 'العلاقة: ' : 'Relation: '} 
                    <span className="font-semibold text-primary">{req.relation || 'Family'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <AppButton
                    size="sm"
                    variant="primary"
                    onClick={() => handleStatusUpdate(req.relationshipId, 'ACCEPTED')}
                    isLoading={updateStatusMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1 rtl:ml-1" />
                    {isAr ? 'قبول' : 'Accept'}
                  </AppButton>

                  <AppButton
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(req.relationshipId, 'REJECTED')}
                    isLoading={updateStatusMutation.isPending}
                    className="text-red-500 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-1 rtl:ml-1" />
                    {isAr ? 'رفض' : 'Reject'}
                  </AppButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder={isAr ? 'بحث باسم المريض...' : 'Search patient name...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 rtl:pr-9 rtl:pl-4 pr-4 py-2.5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 bg-surface-container-lowest dark:bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/30 text-xs font-semibold">
          {['ALL', 'ACCEPTED', 'PENDING'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                filterStatus === st 
                  ? 'bg-primary text-on-primary shadow-sm' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {st === 'ALL' ? (isAr ? 'الكل' : 'All') : 
               st === 'ACCEPTED' ? (isAr ? 'النشطين' : 'Active') : 
               (isAr ? 'المعلقة' : 'Pending')}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-surface-container-lowest dark:bg-surface-container-low animate-pulse border border-outline-variant/20" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 bg-red-500/5 rounded-3xl border border-red-500/20 p-6">
          <p className="text-red-500 font-semibold">
            {isAr ? 'حدث خطأ أثناء تحميل قائمة المرضى' : 'Failed to load patient roster'}
          </p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl border border-outline-variant/30 p-8">
          <Users className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-on-surface">
            {isAr ? 'لا يوجد مرضى مرتبطين حالياً' : 'No Linked Patients Found'}
          </h3>
          <p className="text-sm text-on-surface-variant mt-1 max-w-md mx-auto">
            {isAr 
              ? 'بمجرد أن يرسل لك المريض دعوة ربط وتوافق عليها، سيظهر في هذه القائمة.' 
              : 'Once a patient sends you a connection invitation and you accept, they will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item) => {
            const patient = item.patientId || {};
            const patientIdStr = patient._id || patient.id;
            const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Patient';
            const isAccepted = item.status === 'ACCEPTED';

            return (
              <AppCard 
                key={item.relationshipId}
                className="p-6 flex flex-col justify-between hover:shadow-lg transition-all border border-outline-variant/30 rounded-3xl relative overflow-hidden group"
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-container/40 flex items-center justify-center text-primary font-extrabold text-lg">
                        {fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-on-surface text-lg group-hover:text-primary transition-colors">
                          {fullName}
                        </h3>
                        <p className="text-xs font-medium text-on-surface-variant">
                          {item.relation || (isAr ? 'مريض مرتبط' : 'Linked Patient')}
                        </p>
                      </div>
                    </div>

                    <AppBadge variant={isAccepted ? 'success' : 'warning'}>
                      {isAccepted ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معلق' : 'Pending')}
                    </AppBadge>
                  </div>

                  {/* Phone & Status Info */}
                  {patient.phone && (
                    <div className="text-xs text-on-surface-variant mb-4 bg-surface-container-low/50 p-2.5 rounded-xl flex items-center justify-between">
                      <span>{isAr ? 'رقم الهاتف:' : 'Phone:'}</span>
                      <span className="font-semibold text-on-surface" dir="ltr">{patient.phone}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Action Nav Links */}
                {isAccepted ? (
                  <div className="space-y-2 mt-4 pt-4 border-t border-outline-variant/20">
                    <div className="grid grid-cols-2 gap-2">
                      <Link 
                        href={`/patients/${patientIdStr}/medications`}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all"
                      >
                        <Pill className="w-3.5 h-3.5" />
                        <span>{isAr ? 'الأدوية' : 'Medications'}</span>
                      </Link>

                      <Link 
                        href={`/patients/${patientIdStr}/adherence`}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{isAr ? 'الالتزام' : 'Adherence'}</span>
                      </Link>
                    </div>

                    <Link 
                      href={`/patients/${patientIdStr}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-surface-container-high dark:bg-surface-container hover:bg-primary hover:text-white text-on-surface text-xs font-bold transition-all shadow-sm group-hover:shadow-md"
                    >
                      <span>{isAr ? 'الملف الكامل والتفاصيل' : 'View Patient Hub'}</span>
                      <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-outline-variant/20 text-xs text-on-surface-variant text-center">
                    {isAr ? 'بانتظار قبول طلب الربط لتفعيل متابعة الأدوية.' : 'Awaiting confirmation to enable care tracking.'}
                  </div>
                )}
              </AppCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default CaregiverPatientsListComponent;
