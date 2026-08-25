'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { useTranslation } from '@/shared/lib/i18nContext';
import { Card, Badge, Button, Input } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/sonner';
import {
  usePendingApprovals,
  useAllAccounts,
  useVerifyDoctor,
  useVerifyPharmacist,
  useVerifyCaregiver,
  useUpdateAccountStatus,
  useRegisterProvider,
  useRegisterProfessional,
} from '../hooks/useAdminHooks';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  UserPlus,
  UserCheck,
  Building2,
  Stethoscope,
  HeartHandshake,
  Users,
  Search,
  Lock,
  Unlock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export default function AdminDashboardComponent() {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' | 'create' | 'accounts'
  const [creationRole, setCreationRole] = useState('DOCTOR'); // 'DOCTOR' | 'PHARMACIST' | 'PROFESSIONAL_CAREGIVER'
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for Single-Entry Creation
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

  // Queries & Mutations
  const { data: pendingData, isLoading: isPendingLoading } = usePendingApprovals();
  const { data: accountsData, isLoading: isAccountsLoading } = useAllAccounts();

  const verifyDoctorMutation = useVerifyDoctor();
  const verifyPharmacistMutation = useVerifyPharmacist();
  const verifyCaregiverMutation = useVerifyCaregiver();
  const updateStatusMutation = useUpdateAccountStatus();
  const registerProviderMutation = useRegisterProvider();
  const registerProfessionalMutation = useRegisterProfessional();

  const pendingDoctors = pendingData?.doctors || [];
  const pendingPharmacists = pendingData?.pharmacists || [];
  const pendingCaregivers = pendingData?.caregivers || [];
  const totalPending = pendingDoctors.length + pendingPharmacists.length + pendingCaregivers.length;

  const accounts = Array.isArray(accountsData) ? accountsData : [];

  // Approval Handlers
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

  // Toggle Account Active / Inactive
  const handleToggleAccountStatus = (id, currentStatus) => {
    updateStatusMutation.mutate(
      { id, isActive: !currentStatus, reason: 'Admin toggle status' },
      {
        onSuccess: () => {
          toast.success(
            !currentStatus
              ? (isAr ? 'تم تفعيل الحساب بنجاح' : 'Account activated successfully')
              : (isAr ? 'تم تعطيل الحساب' : 'Account deactivated')
          );
        },
        onError: (err) => {
          toast.error(isAr ? 'تعذر تغيير حالة الحساب' : 'Failed to update status', {
            description: err?.response?.data?.message || err?.message,
          });
        },
      }
    );
  };

  // Form Submit Handler for Single-Entry Creation
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

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.phone?.includes(searchQuery) ||
      acc.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout activePath="/admin-dashboard">
      <div className="max-w-[1280px] mx-auto space-y-8 pb-16">
        {/* Main Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl border border-indigo-500/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-indigo-600 text-white font-extrabold text-[10px] px-3 py-1">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  {isAr ? 'لوحة التحكم الإدارية' : 'Admin Control Center'}
                </Badge>
                {totalPending > 0 && (
                  <Badge variant="destructive" className="animate-pulse text-[10px] font-bold">
                    {totalPending} {isAr ? 'طلبات تنتظر الاعتماد' : 'Pending Signoffs'}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {isAr ? 'إدارة المنصة والتحقق من المزودين' : 'MediMind System Administration'}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {isAr
                  ? 'إدارة اعتماد الأطباء، الصيدليات، ومقدمي الرعاية المحترفين، وإنشاء الحسابات المباشرة والتكميلية.'
                  : 'Approve provider registrations, issue pre-verified credentials, and manage system active accounts.'}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl text-center">
                <span className="text-2xl font-black text-white block">{totalPending}</span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  {isAr ? 'طلبات المعاينة' : 'Pending Reviews'}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl text-center">
                <span className="text-2xl font-black text-indigo-400 block">{accounts.length}</span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  {isAr ? 'إجمالي الحسابات' : 'Total Accounts'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <Button
            variant={activeTab === 'approvals' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('approvals')}
            className={`rounded-full font-bold text-xs px-6 py-2.5 ${
              activeTab === 'approvals' ? 'bg-indigo-600 text-white shadow-md' : ''
            }`}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            {isAr ? 'طلبات الاعتماد' : 'Approval Workflow'} ({totalPending})
          </Button>

          <Button
            variant={activeTab === 'create' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('create')}
            className={`rounded-full font-bold text-xs px-6 py-2.5 ${
              activeTab === 'create' ? 'bg-indigo-600 text-white shadow-md' : ''
            }`}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {isAr ? 'إنشاء حساب جديد (Single-Entry)' : 'Single-Entry Creation'}
          </Button>

          <Button
            variant={activeTab === 'accounts' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('accounts')}
            className={`rounded-full font-bold text-xs px-6 py-2.5 ${
              activeTab === 'accounts' ? 'bg-indigo-600 text-white shadow-md' : ''
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            {isAr ? 'إدارة جميع الحسابات' : 'System Accounts'}
          </Button>
        </div>

        {/* TAB 1: APPROVAL WORKFLOW QUEUE */}
        {activeTab === 'approvals' && (
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

              {pendingDoctors.length === 0 ? (
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

              {pendingPharmacists.length === 0 ? (
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

              {pendingCaregivers.length === 0 ? (
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
        )}

        {/* TAB 2: SINGLE-ENTRY USER CREATION FORM */}
        {activeTab === 'create' && (
          <Card className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 p-8 rounded-3xl max-w-2xl mx-auto space-y-6">
            <div className="space-y-2 border-b border-outline-variant/20 pb-4">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                {isAr ? 'إضافة حساب مزود جديد (مفعل تلقائياً)' : 'Issue Direct Pre-Verified Account'}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {isAr
                  ? 'إنشاء حساب طبيب أو صيدلي أو مقدم رعاية محترف مباشرة مع التفعيل المسبق.'
                  : 'Create a pre-approved provider account directly bypasses manual approval queues.'}
              </p>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setCreationRole('DOCTOR')}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  creationRole === 'DOCTOR' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                {isAr ? 'طبيب' : 'Doctor'}
              </button>
              <button
                type="button"
                onClick={() => setCreationRole('PHARMACIST')}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  creationRole === 'PHARMACIST' ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                {isAr ? 'صيدلية' : 'Pharmacy'}
              </button>
              <button
                type="button"
                onClick={() => setCreationRole('PROFESSIONAL_CAREGIVER')}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
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
        )}

        {/* TAB 3: SYSTEM ACCOUNTS & TOGGLE ACTIVE STATUS */}
        {activeTab === 'accounts' && (
          <Card className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 p-6 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
              <div>
                <h3 className="font-extrabold text-lg text-on-surface flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  {isAr ? 'سجل حسابات النظام' : 'System Accounts Management'}
                </h3>
                <p className="text-xs text-on-surface-variant font-medium">
                  {isAr ? 'تمكين أو تعطيل حسابات المستخدمين فوراً' : 'Toggle user account activation status in real-time.'}
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'بحث بالبريد أو الدور...' : 'Search email or role...'}
                  className="pl-9 text-xs rounded-full"
                />
              </div>
            </div>

            {isAccountsLoading ? (
              <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ) : filteredAccounts.length === 0 ? (
              <div className="text-center py-8 text-xs text-on-surface-variant font-semibold">
                {isAr ? 'لم يتم العثور على حسابات مطابقة' : 'No matching accounts found.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left rtl:text-right">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <th className="py-3 px-4 font-bold">{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                      <th className="py-3 px-4 font-bold">{isAr ? 'الهاتف' : 'Phone'}</th>
                      <th className="py-3 px-4 font-bold">{isAr ? 'الدور' : 'Role'}</th>
                      <th className="py-3 px-4 font-bold">{isAr ? 'الحالة' : 'Status'}</th>
                      <th className="py-3 px-4 font-bold text-right rtl:text-left">{isAr ? 'إجراء' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((acc) => (
                      <tr key={acc._id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="py-3 px-4 font-bold text-on-surface">{acc.email}</td>
                        <td className="py-3 px-4 text-on-surface-variant">{acc.phone || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-bold text-[10px]">
                            {acc.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {acc.isActive ? (
                            <Badge variant="success">{isAr ? 'مفعل' : 'Active'}</Badge>
                          ) : (
                            <Badge variant="destructive">{isAr ? 'معطل' : 'Suspended'}</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right rtl:text-left">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleAccountStatus(acc._id, acc.isActive)}
                            disabled={updateStatusMutation.isPending}
                            className="text-xs font-bold"
                          >
                            {acc.isActive ? (
                              <span className="text-rose-600 flex items-center">
                                <Lock className="w-3.5 h-3.5 mr-1" />
                                {isAr ? 'تعطيل' : 'Suspend'}
                              </span>
                            ) : (
                              <span className="text-emerald-600 flex items-center">
                                <Unlock className="w-3.5 h-3.5 mr-1" />
                                {isAr ? 'تفعيل' : 'Activate'}
                              </span>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
