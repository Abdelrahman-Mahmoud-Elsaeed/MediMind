'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { useTranslation } from '@/shared/lib/i18nContext';
import { Card, Badge, Button, Input } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/sonner';
import {
  useAllAccounts,
  useUpdateAccountStatus,
} from '../hooks/useAdminHooks';
import {
  Users,
  Search,
  Lock,
  Unlock,
} from 'lucide-react';

export default function AdminAccountsComponent() {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const { data: accountsData, isLoading: isAccountsLoading } = useAllAccounts();
  const updateStatusMutation = useUpdateAccountStatus();

  const accounts = Array.isArray(accountsData) ? accountsData : [];

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

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.phone?.includes(searchQuery) ||
      acc.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout activePath="/admin-dashboard/accounts">
      <div className="max-w-[1280px] mx-auto space-y-8 pb-16">
        {/* Main Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl border border-indigo-500/20">
          <div className="relative z-10 space-y-2">
            <Badge variant="default" className="bg-indigo-600 text-white font-extrabold text-[10px] px-3 py-1">
              <Users className="w-3.5 h-3.5 mr-1" />
              {isAr ? 'إدارة جميع الحسابات' : 'System Accounts Management'}
            </Badge>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {isAr ? 'سجل حسابات النظام والتفعيل' : 'System Accounts & Status Controls'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {isAr
                ? 'البحث في كافة حسابات المنصة، والتحكم في تفعيل أو تجميد الوصول فوراً.'
                : 'Search all system registered accounts and manage real-time active / suspended status.'}
            </p>
          </div>
        </div>

        {/* System Accounts Table Card */}
        <Card className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 p-6 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
            <div>
              <h3 className="font-extrabold text-lg text-on-surface flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                {isAr ? 'سجل الحسابات المسجلة' : 'System Accounts Directory'}
              </h3>
              <p className="text-xs text-on-surface-variant font-medium">
                {isAr ? 'عرض وتصفية جميع المستخدمين' : 'View and filter all active & suspended user accounts.'}
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
      </div>
    </MainLayout>
  );
}
