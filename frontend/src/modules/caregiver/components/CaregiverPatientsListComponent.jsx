'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  X, 
  Check, 
  AlertCircle
} from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18nContext';
import { AppCard, AppButton, AppBadge, Avatar, AvatarFallback } from '@/shared/components/ui';
import { 
  useCaregiverRelationshipsQuery, 
  useUpdateRelationshipStatusMutation 
} from '../hooks/useCaregiverQueries';

export function CaregiverPatientsListComponent() {
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const { data: relationships = [], isLoading, isError } = useCaregiverRelationshipsQuery();
  const updateStatusMutation = useUpdateRelationshipStatusMutation();

  const handleStatusUpdate = (relationshipId, newStatus) => {
    updateStatusMutation.mutate({ relationshipId, status: newStatus });
  };

  const activePatients = relationships.filter(r => r.status === 'ACTIVE' || r.status === 'ACCEPTED');
  const pendingRequests = relationships.filter(r => r.status === 'PENDING');

  const filteredRelationships = relationships.filter((rel) => {
    const p = rel.patientId || rel.patient || {};
    const u = p.user || {};
    const firstName = p.firstName || u.firstName || '';
    const lastName = p.lastName || u.lastName || '';
    const email = p.email || u.email || p.accountId?.email || '';
    const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (activeTab === 'ACTIVE') return rel.status === 'ACTIVE' || rel.status === 'ACCEPTED';
    if (activeTab === 'PENDING') return rel.status === 'PENDING';
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-2">
              <ShieldCheck className="w-5 h-5" />
              <span>{t('caregiver.portal')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
              {t('caregiver.myLinkedPatients')}
            </h1>
            <p className="text-on-surface-variant mt-2 text-base max-w-2xl">
              {t('caregiver.listDesc')}
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto">
            <Link 
              href="/caregivers/invite" 
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-primary text-on-primary font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition-all whitespace-nowrap cursor-pointer"
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>{t('caregiver.invitePatient')}</span>
            </Link>

            <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3 sm:p-4 shadow-sm text-center min-w-[90px] sm:min-w-[100px]">
              <span className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">
                {t('common.actions.active')}
              </span>
              <span className="text-xl sm:text-2xl font-black text-primary leading-none mt-1 block">{activePatients.length}</span>
            </div>

            <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3 sm:p-4 shadow-sm text-center min-w-[90px] sm:min-w-[100px]">
              <span className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">
                {t('common.actions.pending')}
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-500 leading-none mt-1 block">{pendingRequests.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute start-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
          <input
            type="text"
            placeholder={isAr ? 'البحث باسم المريض أو البريد الإلكتروني...' : 'Search by patient name or email...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-11 pe-4 py-3 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/30 rounded-2xl text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-surface-container-low border border-outline-variant/20 rounded-2xl self-start sm:self-auto">
          {[
            { id: 'ALL', label: t('common.actions.all') },
            { id: 'ACTIVE', label: t('common.actions.active') },
            { id: 'PENDING', label: t('common.actions.pending') }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-surface-container-lowest dark:bg-surface-container-high text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 bg-surface-container-low rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-error-container/20 border border-error/20 rounded-3xl text-error space-y-2">
          <AlertCircle className="w-10 h-10 mx-auto" />
          <p className="font-bold">{isAr ? 'تعذر تحميل قائمة المرضى' : 'Failed to load linked patients'}</p>
        </div>
      ) : filteredRelationships.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant/20 rounded-3xl space-y-4">
          <Users className="w-12 h-12 text-on-surface-variant/40 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-on-surface">
              {isAr ? 'لا يوجد مرضى مرتبطون مطابقون' : 'No matching linked patients found'}
            </h3>
            <p className="text-sm text-on-surface-variant">
              {isAr ? 'جرّب البحث باسم آخر أو قم بإرسال دعوة لمريض جديد.' : 'Try adjusting your search or invite a new patient.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRelationships.map((rel) => {
            const p = rel.patientId || rel.patient || {};
            const u = p.user || {};
            const firstName = p.firstName || u.firstName || '';
            const lastName = p.lastName || u.lastName || '';
            const email = p.email || u.email || p.accountId?.email || '';
            const fullName = `${firstName} ${lastName}`.trim() || email || t('caregiver.patientHub.unnamedPatient');
            const isPending = rel.status === 'PENDING';

            return (
              <AppCard 
                key={rel.id || rel._id || rel.relationshipId} 
                className="p-6 bg-surface-container-lowest dark:bg-surface-container-low border-outline-variant/30 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border border-primary/20">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary-container/40 text-primary font-extrabold text-lg">
                          {fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-on-surface text-lg group-hover:text-primary transition-colors">
                          {fullName}
                        </h3>
                        <p className="text-xs text-on-surface-variant">{email || p.phone}</p>
                      </div>
                    </div>

                    <AppBadge variant={isPending ? 'secondary' : 'primaryContainer'}>
                      {isPending 
                        ? t('common.actions.pending') 
                        : t('common.actions.active')}
                    </AppBadge>
                  </div>

                  {/* Information snippet */}
                  <div className="space-y-2 py-3 border-y border-outline-variant/15 my-4 text-xs">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>{t('caregiver.patientHub.linkedSince')}</span>
                      <span className="font-semibold text-on-surface">
                        {new Date(rel.createdAt || Date.now()).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2">
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <AppButton 
                        size="sm"
                        onClick={() => handleStatusUpdate(rel.id, 'ACTIVE')}
                        isLoading={updateStatusMutation.isPending}
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 me-1" />
                        {t('common.actions.accept')}
                      </AppButton>

                      <AppButton 
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(rel.id, 'REVOKED')}
                        isLoading={updateStatusMutation.isPending}
                        className="flex-1 text-error border-error/30 hover:bg-error/10"
                      >
                        <X className="w-4 h-4 me-1" />
                        {t('common.actions.decline')}
                      </AppButton>
                    </div>
                  ) : (
                    <Link href={`/patients/${p.id || p._id || rel.patientId?.id || rel.patientId?._id || rel.patientId}`} className="block w-full">
                      <AppButton variant="secondary" className="w-full flex items-center justify-between gap-2 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <span className="inline-flex items-center gap-2">{t('caregiver.patientHub.viewDetails')}</span>
                        {isAr ? <ChevronLeft className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                      </AppButton>
                    </Link>
                  )}
                </div>
              </AppCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CaregiverPatientsListComponent;
