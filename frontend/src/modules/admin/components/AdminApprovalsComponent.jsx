'use client';

import React from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { useTranslation } from '@/shared/lib/i18nContext';
import { Card, Badge, Button } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/sonner';
import {
  usePendingApprovals,
  useVerifyDoctor,
  useVerifyPharmacist,
  useVerifyCaregiver,
} from '../hooks/useAdminHooks';
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  Stethoscope,
  HeartHandshake,
  UserCheck,
} from 'lucide-react';

export default function AdminApprovalsComponent() {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const { data: pendingData, isLoading: isPendingLoading } = usePendingApprovals();
  const verifyDoctorMutation = useVerifyDoctor();
  const verifyPharmacistMutation = useVerifyPharmacist();
  const verifyCaregiverMutation = useVerifyCaregiver();

  const pendingDoctors = pendingData?.doctors || [];
  const pendingPharmacists = pendingData?.pharmacists || [];
  const pendingCaregivers = pendingData?.caregivers || [];
  const totalPending = pendingDoctors.length + pendingPharmacists.length + pendingCaregivers.length;

  const handleApproveDoctor = (id, name) => {
    verifyDoctorMutation.mutate(id, {
      onSuccess: () => {
        toast.success(isAr ? `تمت موافقة وتمكين الطبيب: ${name}` : `Approved & Enabled Doctor: ${name}`);
      },
      onError: (err) => {
        toast.error(isAr ? 'فشل إتمام عملية الاعتماد' : 'Approval Failed', {
          description: err?.response?.data?.message || err?.message,
        });
      },
    });
  };

  const handleApprovePharmacist = (id, name) => {
    verifyPharmacistMutation.mutate(id, {
      onSuccess: () => {
        toast.success(isAr ? `تمت موافقة وتفعيل الصيدلية: ${name}` : `Approved & Activated Pharmacy: ${name}`);
      },
      onError: (err) => {
        toast.error(isAr ? 'فشل إتمام عملية الاعتماد' : 'Approval Failed', {
          description: err?.response?.data?.message || err?.message,
        });
      },
    });
  };

  const handleApproveCaregiver = (id, name) => {
    verifyCaregiverMutation.mutate(id, {
      onSuccess: () => {
        toast.success(isAr ? `تم اعتماد مقدم الرعاية المحترف: ${name}` : `Approved Caregiver: ${name}`);
      },
      onError: (err) => {
        toast.error(isAr ? 'فشل إتمام عملية الاعتماد' : 'Approval Failed', {
          description: err?.response?.data?.message || err?.message,
        });
      },
    });
  };

  return (
    <MainLayout activePath="/admin-dashboard/approvals">
      <div className="max-w-[1280px] mx-auto space-y-8 pb-16">
        {/* Main Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl border border-indigo-500/20">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-indigo-600 text-white font-extrabold text-[10px] px-3 py-1">
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  {isAr ? 'مسار طلبات الاعتماد' : 'Approval Workflow Queue'}
                </Badge>
                {totalPending > 0 && (
                  <Badge variant="destructive" className="animate-pulse text-[10px] font-bold">
                    {totalPending} {isAr ? 'طلبات تنتظر الاعتماد' : 'Pending Approvals'}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {isAr ? 'مراجعة واعتماد المزودين الجدد' : 'Provider Approval Workflow'}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {isAr
                  ? 'مراجعة ترخيص ونقابة الأطباء والصيدليات ومقدمي الرعاية المحترفين وتفعيل حساباتهم فوراً.'
                  : 'Review syndicate IDs, pharmacy licenses, and professional caregiver accreditations.'}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Approvals Content */}
        <div className="space-y-8">
          {/* Pending Doctors */}
          <Card className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-on-surface">
                    {isAr ? 'أطباء ينتظرون الاعتماد' : 'Pending Doctor Verification'}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium">
                    {isAr ? 'مراجعة رقم النقابة وتفاصيل العيادة قبل تفعيل الحساب' : 'Review syndicate ID & credentials before account activation.'}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="font-bold text-xs">
                {pendingDoctors.length} {isAr ? 'طبيب' : 'Doctors'}
              </Badge>
            </div>

            {isPendingLoading ? (
              <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ) : pendingDoctors.length === 0 ? (
              <div className="text-center py-8 text-xs text-on-surface-variant font-semibold">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                {isAr ? 'لا يوجد أطباء ينتظرون الاعتماد حالياً' : 'All doctor registration requests are reviewed!'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingDoctors.map((doc) => (
                  <div
                    key={doc._id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-base text-on-surface">
                          Dr. {doc.firstName} {doc.lastName}
                        </h4>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">
                          {doc.specialty || 'General Practitioner'}
                        </span>
                      </div>
                      <Badge variant="warning">{isAr ? 'قيد المراجعة' : 'Pending Review'}</Badge>
                    </div>

                    <div className="text-xs space-y-1 text-on-surface-variant">
                      <div>
                        <strong>Syndicate ID:</strong> {doc.syndicateId || 'N/A'}
                      </div>
                      <div>
                        <strong>Clinic:</strong> {doc.clinicName || 'N/A'}
                      </div>
                      <div>
                        <strong>Email:</strong> {doc.accountId?.email || 'N/A'}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleApproveDoctor(doc._id, `Dr. ${doc.firstName} ${doc.lastName}`)}
                      disabled={verifyDoctorMutation.isPending}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      {isAr ? 'اعتماد وتفعيل حساب الطبيب' : 'Approve & Activate Doctor'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pending Pharmacies */}
          <Card className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-on-surface">
                    {isAr ? 'صيدليات تنتظر الاعتماد والتفعيل' : 'Pending Pharmacy Verification'}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium">
                    {isAr ? 'مراجعة ترخيص الصيدلية وتفعيل الاشتراكات' : 'Review pharmacy license number and activate portal subscriptions.'}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="font-bold text-xs">
                {pendingPharmacists.length} {isAr ? 'صيدلية' : 'Pharmacies'}
              </Badge>
            </div>

            {isPendingLoading ? (
              <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ) : pendingPharmacists.length === 0 ? (
              <div className="text-center py-8 text-xs text-on-surface-variant font-semibold">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                {isAr ? 'جميع طلبات الصيدليات معتمدة' : 'All pharmacy registration requests are reviewed!'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingPharmacists.map((ph) => (
                  <div
                    key={ph._id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-base text-on-surface">
                          {ph.pharmacyName || 'Pharmacy'}
                        </h4>
                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 block">
                          Owner: {ph.ownerName || `${ph.firstName} ${ph.lastName}`}
                        </span>
                      </div>
                      <Badge variant="warning">{isAr ? 'معلق' : 'Pending'}</Badge>
                    </div>

                    <div className="text-xs space-y-1 text-on-surface-variant">
                      <div>
                        <strong>License No:</strong> {ph.licenseNumber || 'N/A'}
                      </div>
                      <div>
                        <strong>Email:</strong> {ph.accountId?.email || 'N/A'}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleApprovePharmacist(ph._id, ph.pharmacyName || ph.firstName)}
                      disabled={verifyPharmacistMutation.isPending}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      {isAr ? 'اعتماد الصيدلية وتفعيل Portal' : 'Approve & Activate Pharmacy'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pending Caregivers */}
          <Card className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-on-surface">
                    {isAr ? 'مقدمو رعاية محترفون ينتظرون الاعتماد' : 'Pending Professional Caregivers'}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium">
                    {isAr ? 'التحقق من التراخيص المهنية' : 'Verify professional license & nursing accreditation.'}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="font-bold text-xs">
                {pendingCaregivers.length} {isAr ? 'مقدم رعاية' : 'Caregivers'}
              </Badge>
            </div>

            {isPendingLoading ? (
              <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ) : pendingCaregivers.length === 0 ? (
              <div className="text-center py-8 text-xs text-on-surface-variant font-semibold">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                {isAr ? 'لا يوجد طلبات معلقة لمقدمي الرعاية' : 'All caregiver verification requests are reviewed!'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingCaregivers.map((cg) => (
                  <div
                    key={cg._id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-base text-on-surface">
                          {cg.firstName} {cg.lastName}
                        </h4>
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block">
                          {cg.specialization || 'Nursing Care'}
                        </span>
                      </div>
                      <Badge variant="warning">{isAr ? 'معلق' : 'Pending'}</Badge>
                    </div>

                    <div className="text-xs space-y-1 text-on-surface-variant">
                      <div>
                        <strong>License:</strong> {cg.licenseNumber || 'N/A'}
                      </div>
                      <div>
                        <strong>Hourly Rate:</strong> ${cg.hourlyRate || 0}/hr
                      </div>
                    </div>

                    <Button
                      onClick={() => handleApproveCaregiver(cg._id, `${cg.firstName} ${cg.lastName}`)}
                      disabled={verifyCaregiverMutation.isPending}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      {isAr ? 'اعتماد وتفعيل مقدم الرعاية' : 'Approve & Activate Caregiver'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
