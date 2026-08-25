'use client';

import { useAuth } from '@/modules/auth/hooks/useAuth';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { useTranslation } from '@/shared/lib/i18nContext';
import Link from 'next/link';
import React from 'react';
import { useRefillOrders, useUpdateRefillStatus } from '../hooks/usePharmacyHooks';

export default function PharmacyOverviewComponent() {
  const { user } = useAuth();
  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const { data: refillOrders = [], isLoading } = useRefillOrders();
  const updateStatusMutation = useUpdateRefillStatus();

  const totalOrders = refillOrders.length;
  const pendingOrders = refillOrders.filter((o) => o.orderStatus === 'SUBMITTED');
  const inProgressOrders = refillOrders.filter((o) =>
    ['APPROVED', 'DISPENSED', 'READY_FOR_PICKUP'].includes(o.orderStatus),
  ).length;
  const completedOrders = refillOrders.filter((o) => o.orderStatus === 'COMPLETED').length;

  const handleQuickApprove = (orderId) => {
    updateStatusMutation.mutate({
      id: orderId,
      orderStatus: 'APPROVED',
      pharmacistNotes: 'تم الاعتماد السريع من لوحة تحكم الصيدلية الرئيسية.',
    });
  };

  return (
    <MainLayout activePath="/pharmacy">
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Main Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 p-6 sm:p-8 text-white shadow-xl border border-teal-500/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30 uppercase tracking-wider">
                  {isAr ? 'المركز الرئيسي للصيدلة' : 'Central Pharmacy Operations'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isAr ? 'مستعد لاستقبال الطلبات 24/7' : 'Open for Refills 24/7'}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {isAr ? 'أهلاً بك، ' : 'Welcome back, '}
                <span className="text-teal-400">
                  {user?.pharmacyName || (isAr ? 'الصيدلية المركزية' : 'Central Pharmacy')}
                </span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {isAr
                  ? 'ملخص العمليات اليومية، متابعة مخزون الأدوية الحرج، واعتماد طلبات التعبئة الواردة من المرضى والمرافقين.'
                  : 'Daily operations overview, critical medication stock tracking, and incoming prescription refill signoffs.'}
              </p>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/pharmacy/orders"
                className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">local_pharmacy</span>
                <span>{isAr ? 'إدارة الطلبات والصرف' : 'Manage Refill Queue'}</span>
              </Link>

              <Link
                href="/pharmacies"
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">storefront</span>
                <span>{isAr ? 'دليل الصيدليات' : 'Directory'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Executive Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {isAr ? 'إجمالي الطلبات المسجلة' : 'Total Refill Orders'}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">inventory</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {totalOrders}
              </span>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">+14% الشهر</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {isAr ? 'طلبات جديدة عاجلة' : 'Urgent Pending Signoffs'}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">pending_actions</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {pendingOrders.length}
              </span>
              {pendingOrders.length > 0 && (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                  {isAr ? 'يتطلب إجراء فورياً' : 'Immediate Action'}
                </span>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {isAr ? 'طلبات قيد التجهيز والصرف' : 'Currently Dispensing'}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">vaccines</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {inProgressOrders}
              </span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {isAr ? 'تجهيز بالفرع' : 'In Fulfillment'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {isAr ? 'طلبات مكتملة ومسلمة' : 'Completed Deliveries'}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">task_alt</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {completedOrders}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {isAr ? 'نسبة نجاح 98.5%' : '98.5% Rate'}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Two-Column Grid: Urgent Pending Requests + Inventory Warnings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Urgent Pending Refills List (2 Columns) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-xl">
                  priority_high
                </span>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isAr ? 'طلبات التعبئة المنتظرة للاعتماد السريع' : 'Pending Signoff Queue'}
                </h2>
              </div>
              <Link
                href="/pharmacy/orders"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1"
              >
                <span>{isAr ? 'عرض الكل' : 'View All'}</span>
                <span className="material-symbols-outlined text-sm rtl:rotate-180">
                  arrow_forward
                </span>
              </Link>
            </div>

            {isLoading ? (
              <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ) : pendingOrders.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                <span className="material-symbols-outlined text-4xl block mb-1 text-slate-300">
                  done_all
                </span>
                {isAr
                  ? 'لا توجد طلبات جديدة معلقة حالياً'
                  : 'All pending refill requests are signed off!'}
              </div>
            ) : (
              <div className="space-y-3">
                {pendingOrders.slice(0, 4).map((order) => {
                  const patientName = order.patientId?.firstName
                    ? `${order.patientId.firstName} ${order.patientId.lastName || ''}`
                    : 'MediMind Patient';
                  const medName = order.medicationId?.name || 'Medication';

                  return (
                    <div
                      key={order._id || order.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-extrabold flex items-center justify-center text-sm">
                          {patientName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {patientName}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {medName} •{' '}
                            <strong className="text-teal-600 dark:text-teal-400">
                              {order.quantityRequested} units
                            </strong>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleQuickApprove(order._id || order.id)}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        <span>{isAr ? 'اعتماد سريع' : 'Quick Signoff'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Low Stock & Replenishment Warnings (1 Column) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-500 text-xl">warning</span>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isAr ? 'تنبيهات المخزون الحرِج' : 'Low Stock Alerts'}
                </h2>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { name: 'Metformin ER 500mg', stock: 4, thresh: 10, status: 'حرج للغاية' },
                { name: 'Lisinopril 10mg', stock: 2, thresh: 10, status: 'حرج للغاية' },
                { name: 'Rosuvastatin 10mg', stock: 5, thresh: 15, status: 'ينفد قريباً' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold block mt-0.5">
                      {isAr ? 'المتبقي بالمخزون:' : 'Current Stock:'} {item.stock}{' '}
                      {isAr ? 'عبوات' : 'units'}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white font-extrabold text-[10px]">
                    {item.status}
                  </span>
                </div>
              ))}

              <button
                onClick={() =>
                  alert(
                    isAr
                      ? 'تم إرسال طلب توريد عاجل للمورد المعتمد'
                      : 'Supplier restock order placed!',
                  )
                }
                className="w-full py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <span className="material-symbols-outlined text-base">local_shipping</span>
                <span>{isAr ? 'طلب إعادة توريد للمخزون' : 'Order Stock Replenishment'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
