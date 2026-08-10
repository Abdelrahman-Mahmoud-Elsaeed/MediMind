'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { useTranslation } from '@/shared/lib/i18nContext';
import { AppCard, AppBadge } from '@/shared/components/ui';
import { 
  Bell, 
  UserCheck, 
  UserX, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Users, 
  Filter 
} from 'lucide-react';
import { 
  useCaregiverRelationshipsQuery, 
  useUpdateRelationshipStatusMutation 
} from '@/modules/caregiver/hooks/useCaregiverQueries';

import { useSocketNotifications } from '@/shared/hooks';

export default function CaregiverNotifications() {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const [activeFilter, setActiveFilter] = useState('ALL');

  const { notifications: dbNotifications = [], markAsRead } = useSocketNotifications();

  // Fetch pending invitations & relationships
  const { data: relationships = [], isLoading } = useCaregiverRelationshipsQuery();
  const updateStatusMutation = useUpdateRelationshipStatusMutation();

  const pendingIncoming = relationships.filter((r) => r.status === 'PENDING' && r.initiatedBy === 'PATIENT');
  const pendingOutgoing = relationships.filter((r) => r.status === 'PENDING' && r.initiatedBy === 'CAREGIVER');
  const activePatients = relationships.filter((r) => r.status === 'ACCEPTED');

  const handleResponse = (relationshipId, status) => {
    updateStatusMutation.mutate({ relationshipId, status });
  };

  return (
    <MainLayout activePath="/notifications">
      <div className="max-w-5xl mx-auto space-y-8 pb-12" dir={isAr ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-on-surface flex items-center gap-3">
              <Bell className="w-8 h-8 text-primary" />
              <span>{isAr ? 'الإشعارات والدعوات' : 'Notifications & Invites'}</span>
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              {isAr ? 'متابعة طلبات الربط والتنبيهات الخاصة بالمرضى.' : 'Manage patient connection invites and track adherence alerts.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-lowest dark:bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/30 text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {isAr ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setActiveFilter('INVITES')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeFilter === 'INVITES'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>{isAr ? 'طلبات الربط' : 'Invites'}</span>
              {pendingIncoming.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingIncoming.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Section 1: Pending Patient Connection Invites */}
        {(activeFilter === 'ALL' || activeFilter === 'INVITES') && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span>{isAr ? 'طلبات ربط المرضى المعلقة' : 'Pending Patient Connection Requests'}</span>
            </h2>

            {isLoading ? (
              <div className="p-8 bg-surface-container-low animate-pulse rounded-3xl" />
            ) : pendingIncoming.length === 0 && pendingOutgoing.length === 0 ? (
              <AppCard className="p-6 text-center border border-outline-variant/30 rounded-3xl">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-on-surface-variant">
                  {isAr ? 'لا توجد طلبات ربط معلقة حالياً' : 'No pending connection requests'}
                </p>
              </AppCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Incoming Requests */}
                {pendingIncoming.map((invite) => {
                  const patientName = invite.patientId 
                    ? `${invite.patientId.firstName || ''} ${invite.patientId.lastName || ''}`.trim() || invite.patientId.email
                    : (isAr ? 'مريض جديد' : 'New Patient');
                  const phone = invite.patientId?.phone || '';

                  return (
                    <AppCard 
                      key={invite.relationshipId}
                      className="p-5 border border-primary/20 bg-primary/5 rounded-3xl flex flex-col justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-on-surface text-base">
                              {patientName}
                            </h3>
                            <p className="text-xs text-on-surface-variant font-medium">
                              {isAr ? `صلة القرابة: ${invite.relation || 'عائلة'}` : `Relation: ${invite.relation || 'Family'}`}
                              {phone && ` • ${phone}`}
                            </p>
                          </div>
                        </div>

                        <AppBadge variant="warning">
                          {isAr ? 'طلب جديد' : 'Incoming Request'}
                        </AppBadge>
                      </div>

                      <div className="flex items-center gap-3 pt-2 border-t border-outline-variant/20">
                        <button
                          onClick={() => handleResponse(invite.relationshipId, 'ACCEPTED')}
                          disabled={updateStatusMutation.isPending}
                          className="flex-1 py-2 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>{isAr ? 'قبول الطلب' : 'Accept Request'}</span>
                        </button>
                        <button
                          onClick={() => handleResponse(invite.relationshipId, 'REJECTED')}
                          disabled={updateStatusMutation.isPending}
                          className="py-2 px-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <UserX className="w-4 h-4" />
                          <span>{isAr ? 'رفض' : 'Decline'}</span>
                        </button>
                      </div>
                    </AppCard>
                  );
                })}

                {/* Outgoing Requests */}
                {pendingOutgoing.map((invite) => {
                  const patientName = invite.patientId 
                    ? `${invite.patientId.firstName || ''} ${invite.patientId.lastName || ''}`.trim() || invite.patientId.email
                    : (isAr ? 'مريض' : 'Patient');

                  return (
                    <AppCard 
                      key={invite.relationshipId}
                      className="p-5 border border-outline-variant/30 bg-surface-container-low/40 rounded-3xl flex flex-col justify-between gap-4 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-on-surface text-base">
                              {patientName}
                            </h3>
                            <p className="text-xs text-on-surface-variant font-medium">
                              {isAr ? 'تم إرسال دعوة للمريض' : 'Invitation sent to patient'}
                            </p>
                          </div>
                        </div>

                        <AppBadge variant="warning">
                          {isAr ? 'بانتظار موافقة المريض' : 'Pending Patient Confirmation'}
                        </AppBadge>
                      </div>
                    </AppCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Section 2: General Caregiver Activity Notifications */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span>{isAr ? 'سجل التنبيهات والأنشطة' : 'Recent Patient Alerts & Logs'}</span>
          </h2>

          <div className="space-y-3">
            {dbNotifications.length === 0 ? (
              <AppCard className="p-6 text-center border border-outline-variant/30 rounded-2xl text-xs font-semibold text-on-surface-variant">
                {isAr ? 'لا توجد إشعارات مسجلة في النظام بعد' : 'No system notifications recorded yet.'}
              </AppCard>
            ) : (
              dbNotifications.map((notif) => (
                <AppCard
                  key={notif.id || notif.notificationId}
                  onClick={() => !notif.isRead && markAsRead(notif.id || notif.notificationId)}
                  className={`p-4 border border-outline-variant/30 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                    !notif.isRead ? 'bg-teal-500/5 font-bold' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-xs">
                        {isAr && notif.titleAr ? notif.titleAr : notif.title}
                      </h4>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        {isAr && notif.messageAr ? notif.messageAr : notif.message}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-on-surface-variant font-mono shrink-0">
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </span>
                </AppCard>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
