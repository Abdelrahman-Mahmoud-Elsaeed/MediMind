import React, { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { useTranslation } from '@/shared/lib/i18nContext';
import { useRefillOrders, useUpdateRefillStatus } from '../hooks/usePharmacyHooks';
import { getSocket } from '@/shared/lib/socketClient';

export default function PharmacistOrdersComponent() {
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNoteModalOrder, setActiveNoteModalOrder] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  const { data: refillOrders = [], isLoading } = useRefillOrders();
  const updateStatusMutation = useUpdateRefillStatus();

  // Real-time listener for incoming orders from patients
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewOrder = (data) => {
      showToast(
        isAr
          ? '🔔 طلب صرف دواء جديد وارد الآن من المريض!'
          : '🔔 New incoming refill request received!'
      );
    };

    socket.on('new_refill_order', handleNewOrder);
    return () => {
      socket.off('new_refill_order', handleNewOrder);
    };
  }, [isAr]);

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = refillOrders.length;
    const pending = refillOrders.filter((o) => o.orderStatus === 'SUBMITTED').length;
    const inProgress = refillOrders.filter((o) =>
      ['APPROVED', 'DISPENSED', 'READY_FOR_PICKUP'].includes(o.orderStatus)
    ).length;
    const completed = refillOrders.filter((o) => o.orderStatus === 'COMPLETED').length;
    return { total, pending, inProgress, completed };
  }, [refillOrders]);

  const [toastMsg, setToastMsg] = useState(null);
  const [viewDetailsOrder, setViewDetailsOrder] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleStatusChange = (orderId, newStatus, customNotes) => {
    updateStatusMutation.mutate(
      {
        id: orderId,
        orderStatus: newStatus,
        pharmacistNotes: customNotes,
      },
      {
        onSuccess: () => {
          setActiveNoteModalOrder(null);
          setNoteInput('');
          showToast(
            isAr
              ? `تم تحديث حالة الطلب إلى (${newStatus}) بنجاح!`
              : `Order status updated to (${newStatus}) successfully!`
          );
        },
        onError: (err) => {
          showToast(
            err?.response?.data?.message ||
              (isAr ? 'فشل تغيير حالة الطلب' : 'Failed to update order status')
          );
        },
      }
    );
  };

  const filteredOrders = useMemo(() => {
    return refillOrders.filter((order) => {
      // Status Filter
      if (filterStatus === 'PENDING' && order.orderStatus !== 'SUBMITTED') return false;
      if (
        filterStatus === 'IN_PROGRESS' &&
        !['APPROVED', 'DISPENSED', 'READY_FOR_PICKUP'].includes(order.orderStatus)
      )
        return false;
      if (filterStatus === 'COMPLETED' && order.orderStatus !== 'COMPLETED') return false;
      if (filterStatus === 'REJECTED' && order.orderStatus !== 'REJECTED') return false;

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const patientName = `${order.patientId?.firstName || ''} ${
          order.patientId?.lastName || ''
        }`.toLowerCase();
        const medName = (order.medicationId?.name || '').toLowerCase();
        const rxNum = String(order._id || order.id).toLowerCase();
        return patientName.includes(q) || medName.includes(q) || rxNum.includes(q);
      }

      return true;
    });
  }, [refillOrders, filterStatus, searchQuery]);

  return (
    <MainLayout activePath="/pharmacy/orders">
      <div className="space-y-8 pb-12 max-w-7xl mx-auto">
        {/* Pharmacy Dashboard Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 p-6 sm:p-8 text-white shadow-xl border border-teal-500/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 bg-teal-500/20 border border-teal-500/30 text-teal-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm">local_pharmacy</span>
                  <span>{t('pharmacy.portal')}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{t('pharmacy.verifiedCentral')}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                {t('pharmacy.dashboardTitle')}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                {t('pharmacy.dashboardDesc')}
              </p>
            </div>

            {/* Store Operational Status Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-center gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-300 block font-semibold">
                  {t('pharmacy.acceptingRefills')}
                </span>
                <span className="font-bold text-white text-sm">
                  {isStoreOpen
                    ? t('pharmacy.activeAccepting')
                    : t('pharmacy.paused')}
                </span>
              </div>
              <button
                onClick={() => setIsStoreOpen(!isStoreOpen)}
                className={`px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                  isStoreOpen
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
              >
                {isStoreOpen ? t('pharmacy.online') : t('pharmacy.turnOn')}
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Total Orders */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t('pharmacy.totalOrders')}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">inventory_2</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{metrics.total}</span>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+12%</span>
              </span>
            </div>
          </div>

          {/* Card 2: Pending Requests */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {t('pharmacy.pendingRequests')}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">pending_actions</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{metrics.pending}</span>
              {metrics.pending > 0 && (
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                  {isAr ? 'يتطلب إجراء' : 'Action Needed'}
                </span>
              )}
            </div>
          </div>

          {/* Card 3: In Progress */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {isAr ? 'قيد التجهيز والصرف' : 'In Progress'}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">vaccines</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{metrics.inProgress}</span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {isAr ? 'تجهيز الدواء' : 'Dispensing'}
              </span>
            </div>
          </div>

          {/* Card 4: Completed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {isAr ? 'طلبات مكتملة' : 'Completed Orders'}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">check_circle</span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{metrics.completed}</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {isAr ? 'تم الاستلام' : 'Delivered'}
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'ALL', labelAr: 'جميع الطلبات', labelEn: 'All Orders' },
                { id: 'PENDING', labelAr: 'طلبات جديدة', labelEn: 'New Requests' },
                { id: 'IN_PROGRESS', labelAr: 'قيد التجهيز', labelEn: 'In Progress' },
                { id: 'COMPLETED', labelAr: 'المكتملة', labelEn: 'Completed' },
                { id: 'REJECTED', labelAr: 'المرفوضة', labelEn: 'Rejected' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap ${
                    filterStatus === f.id
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {isAr ? f.labelAr : f.labelEn}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute right-3.5 top-3 text-slate-400 text-lg rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto">
                search
              </span>
              <input
                type="text"
                placeholder={isAr ? 'بحث باسم المريض أو الدواء...' : 'Search patient or med...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 px-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Refill Orders Queue List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-3">
              inbox_customize
            </span>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'لا توجد طلبات تطابق هذا العرض' : 'No Refill Orders Found'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {isAr
                ? 'ستظهر هنا جميع الطلبات المقدمة من المرضى فور إنشائها.'
                : 'All refill orders created by patients will appear here in real-time.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const patientName =
                order.patientId?.firstName
                  ? `${order.patientId.firstName} ${order.patientId.lastName || ''}`
                  : isAr
                  ? 'مريض MediMind'
                  : 'MediMind Patient';

              const medName = order.medicationId?.name || (isAr ? 'دواء محدد' : 'Medication');
              const rxCode = `RX-${String(order._id || order.id).slice(-6).toUpperCase()}`;

              return (
                <div
                  key={order._id || order.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 space-y-4"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-extrabold flex items-center justify-center text-base">
                        {patientName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                            {patientName}
                          </h3>
                          <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                            {rxCode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {isAr ? 'تاريخ الطلب:' : 'Requested:'}{' '}
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Recent'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Payment Status Badge */}
                      {order.paymentMethod === 'CARD' || order.paymentMethod === 'STRIPE' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">credit_card</span>
                          <span>{isAr ? 'مدفوع (Stripe)' : 'Paid (Stripe)'}</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">payments</span>
                          <span>{isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</span>
                        </span>
                      )}

                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          {order.fulfillmentType === 'DELIVERY' ? 'two_wheeler' : 'storefront'}
                        </span>
                        <span>
                          {order.fulfillmentType === 'DELIVERY'
                            ? isAr
                              ? 'توصيل منزلي'
                              : 'Home Delivery'
                            : isAr
                            ? 'استلام من الصيدلية'
                            : 'Pharmacy Pickup'}
                        </span>
                      </span>

                      <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900">
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Medication Requested Details Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shrink-0">
                          <span className="material-symbols-outlined text-xl">medication</span>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            {isAr ? 'الدواء المطلوب تعبئته' : 'Requested Medication'}
                          </span>
                          <span className="font-extrabold text-slate-900 dark:text-white text-base">
                            {medName}
                          </span>
                          <span className="text-xs text-teal-600 dark:text-teal-400 font-bold block mt-0.5">
                            {order.quantityRequested} {isAr ? 'وحدة (عبوة)' : 'units'}
                          </span>
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">{isAr ? 'قيمة الطلب' : 'Total'}</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{order.totalAmount || (order.quantityRequested * 5)} EGP</span>
                      </div>
                    </div>

                    {/* Fulfillment Details (Address & Phone) */}
                    <div className="bg-slate-50 dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold shrink-0">
                        <span className="material-symbols-outlined text-xl">
                          {order.fulfillmentType === 'DELIVERY' ? 'home_pin' : 'store'}
                        </span>
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            {order.fulfillmentType === 'DELIVERY'
                              ? isAr
                                ? 'عنوان التوصيل للمريض'
                                : 'Delivery Address'
                              : isAr
                              ? 'استلام مباشر من الفرع'
                              : 'Branch Pickup'}
                          </span>
                          {order.patientId?.phone && (
                            <span className="text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">call</span>
                              <span>{order.patientId.phone}</span>
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm block truncate">
                          {order.deliveryAddress?.street
                            ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city || ''}`
                            : order.patientId?.address?.[0]?.street
                            ? `${order.patientId.address[0].street}, ${order.patientId.address[0].city || ''}`
                            : isAr
                            ? 'العنوان المسجل بحساب المريض'
                            : 'Default Patient Profile Address'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pharmacist Notes (if existing) */}
                  {order.pharmacistNotes && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 p-3.5 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-amber-600 text-base mt-0.5">
                        chat_bubble
                      </span>
                      <div>
                        <strong className="block font-bold">{isAr ? 'ملاحظة الصيدلي:' : 'Pharmacist Note:'}</strong>
                        <span>{order.pharmacistNotes}</span>
                      </div>
                    </div>
                  )}

                  {/* Workflow Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      {order.orderStatus === 'SUBMITTED' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(order._id || order.id, 'APPROVED')}
                            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-base">check</span>
                            <span>{isAr ? 'قبول ورصد الطلب' : 'Approve Order'}</span>
                          </button>
                          <button
                            onClick={() => handleStatusChange(order._id || order.id, 'REJECTED')}
                            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-base">close</span>
                            <span>{isAr ? 'رفض الطلب' : 'Reject Order'}</span>
                          </button>
                        </>
                      )}

                      {order.orderStatus === 'APPROVED' && (
                        <button
                          onClick={() => handleStatusChange(order._id || order.id, 'DISPENSED')}
                          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-base">vaccines</span>
                          <span>{isAr ? 'تحديد كـ "تم صرف الدواء"' : 'Mark as Dispensed'}</span>
                        </button>
                      )}

                      {order.orderStatus === 'DISPENSED' && (
                        <button
                          onClick={() => handleStatusChange(order._id || order.id, 'READY_FOR_PICKUP')}
                          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-base">local_shipping</span>
                          <span>{isAr ? 'جاهز للاستلام / التوصيل' : 'Ready for Pickup'}</span>
                        </button>
                      )}

                      {order.orderStatus === 'READY_FOR_PICKUP' && (
                        <button
                          onClick={() => handleStatusChange(order._id || order.id, 'COMPLETED')}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-base">task_alt</span>
                          <span>{isAr ? 'إكمال وتحديث مخزون المريض' : 'Complete & Replenish Stock'}</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setActiveNoteModalOrder(order);
                        setNoteInput(order.pharmacistNotes || '');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 ms-auto"
                    >
                      <span className="material-symbols-outlined text-base">edit_note</span>
                      <span>{isAr ? 'إضافة/تعديل ملاحظة' : 'Add Note'}</span>
                    </button>

                    <button
                      onClick={() => setViewDetailsOrder(order)}
                      className="px-3.5 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-xs hover:bg-teal-100 dark:hover:bg-teal-900 transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">visibility</span>
                      <span>{isAr ? 'التفاصيل' : 'Details'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PHARMACIST NOTE MODAL */}
        {activeNoteModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-600">edit_note</span>
                  <span>{isAr ? 'إضافة ملاحظة على الطلب' : 'Pharmacist Order Note'}</span>
                </h3>
                <button
                  onClick={() => setActiveNoteModalOrder(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
                >
                  ✕
                </button>
              </div>

              <textarea
                rows={4}
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder={
                  isAr
                    ? 'اكتب توجيهات الصيدلي للمريض (مثال: الجرعة تؤخذ بعد الإفطار، تم التأكد من تاريخ الصلاحية)...'
                    : 'Write instructions or notes for the patient...'
                }
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setActiveNoteModalOrder(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={() =>
                    handleStatusChange(
                      activeNoteModalOrder._id || activeNoteModalOrder.id,
                      activeNoteModalOrder.orderStatus,
                      noteInput
                    )
                  }
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md"
                >
                  {isAr ? 'حفظ الملاحظة' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RX PRESCRIPTION DETAILS MODAL */}
        {viewDetailsOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">description</span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {isAr ? 'تفاصيل الوصفة الطبية والطلب' : 'Prescription & Order Details'}
                    </h3>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      RX-#{String(viewDetailsOrder._id || viewDetailsOrder.id).slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewDetailsOrder(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 rounded-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Patient Info Box */}
                <div className="bg-slate-50 dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block">
                    {isAr ? 'بيانات المريض:' : 'Patient Details:'}
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-800 dark:text-slate-200">
                    <div>
                      <strong className="block font-semibold">{isAr ? 'الاسم:' : 'Name:'}</strong>
                      <span>
                        {viewDetailsOrder.patientId?.firstName
                          ? `${viewDetailsOrder.patientId.firstName} ${viewDetailsOrder.patientId.lastName || ''}`
                          : 'MediMind Patient'}
                      </span>
                    </div>
                    <div>
                      <strong className="block font-semibold">{isAr ? 'رقم الهاتف:' : 'Phone:'}</strong>
                      <span>{viewDetailsOrder.patientId?.phone || '+20 100 123 4567'}</span>
                    </div>
                  </div>
                </div>

                {/* Medication Details Box */}
                <div className="bg-teal-50/60 dark:bg-teal-950/30 p-4 rounded-2xl border border-teal-200/50 dark:border-teal-900/40 space-y-2">
                  <span className="font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">
                    {isAr ? 'بيانات الدواء المطلوبة:' : 'Medication Specs:'}
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-800 dark:text-slate-200">
                    <div>
                      <strong className="block font-semibold">{isAr ? 'اسم الدواء:' : 'Med Name:'}</strong>
                      <span className="font-extrabold text-teal-700 dark:text-teal-300">
                        {viewDetailsOrder.medicationId?.name || 'Medication'}
                      </span>
                    </div>
                    <div>
                      <strong className="block font-semibold">{isAr ? 'الكمية المطلوبة:' : 'Quantity:'}</strong>
                      <span className="font-bold">{viewDetailsOrder.quantityRequested} units</span>
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown Box */}
                <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/40 space-y-2">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                    {isAr ? 'بيانات الدفع والمحاسبة:' : 'Payment Breakdown:'}
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-800 dark:text-slate-200">
                    <div>
                      <strong className="block font-semibold">{isAr ? 'طريقة الدفع:' : 'Payment Method:'}</strong>
                      <span className="font-bold">
                        {viewDetailsOrder.paymentMethod === 'CARD' || viewDetailsOrder.paymentMethod === 'STRIPE'
                          ? (isAr ? '💳 بطاقة بنكية (Stripe)' : '💳 Credit Card (Stripe)')
                          : (isAr ? '💵 الدفع عند الاستلام' : '💵 Cash on Delivery')}
                      </span>
                    </div>
                    <div>
                      <strong className="block font-semibold">{isAr ? 'إجمالي المبلغ المطلوب:' : 'Total Amount:'}</strong>
                      <span className="font-black text-emerald-700 dark:text-emerald-400">
                        {viewDetailsOrder.totalAmount || (viewDetailsOrder.quantityRequested * 5)} EGP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fulfillment Address */}
                <div className="bg-slate-50 dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block">
                    {isAr ? 'عنوان الاستلام / التوصيل:' : 'Fulfillment Address:'}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 block">
                    {viewDetailsOrder.deliveryAddress?.street
                      ? `${viewDetailsOrder.deliveryAddress.street}, ${viewDetailsOrder.deliveryAddress.city || ''}`
                      : viewDetailsOrder.patientId?.address?.[0]?.street
                      ? `${viewDetailsOrder.patientId.address[0].street}, ${viewDetailsOrder.patientId.address[0].city || ''}`
                      : isAr
                      ? 'العنوان المسجل بحساب المريض'
                      : 'Default Patient Profile Address'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setViewDetailsOrder(null)}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
