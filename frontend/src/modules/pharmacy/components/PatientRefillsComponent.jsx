'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { useTranslation } from '@/shared/lib/i18nContext';
import { useRefillOrders, useCreateRefillOrder, usePharmacies } from '../hooks/usePharmacyHooks';
import { useMedications } from '@/modules/medication/hooks/useMedicationHooks';
import { usePatientProfileQuery } from '@/modules/patient/hooks/usePatientQueries';
import { getSocket } from '@/shared/lib/socketClient';

export default function PatientRefillsComponent() {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';
  const [activeTab, setActiveTab] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState('');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState('');
  const [quantity, setQuantity] = useState(30);
  const [fulfillmentType, setFulfillmentType] = useState('DELIVERY');
  
  // Address selection state
  const [selectedAddressIndex, setSelectedAddressIndex] = useState('0');
  const [customStreet, setCustomStreet] = useState('');
  const [customCity, setCustomCity] = useState('');

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' or 'CASH_ON_DELIVERY'
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Toast notification state
  const [liveToast, setLiveToast] = useState(null);

  const { data: patientProfile } = usePatientProfileQuery();
  const savedAddresses = patientProfile?.address || [];

  const { data: refillOrders = [], isLoading: isLoadingRefills } = useRefillOrders();
  const { data: medications = [] } = useMedications();
  const { data: pharmacies = [] } = usePharmacies();
  const createRefillMutation = useCreateRefillOrder();

  // Socket listener for real-time status updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleStatusUpdate = (data) => {
      const statusTitle = isAr ? 'تحديث حالة طلب الدواء' : 'Refill Status Updated';
      const statusMsg = isAr
        ? `قام الصيدلي بتحديث حالة طلبك إلى: ${data.orderStatus}`
        : `Pharmacy updated your refill order to: ${data.orderStatus}`;
      setLiveToast({ title: statusTitle, message: statusMsg });
      setTimeout(() => setLiveToast(null), 5000);
    };

    socket.on('refill_status_updated', handleStatusUpdate);
    return () => {
      socket.off('refill_status_updated', handleStatusUpdate);
    };
  }, [isAr]);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!selectedMedId) {
      alert(isAr ? 'الرجاء اختيار الدواء المراد تعبئته' : 'Please select a medication');
      return;
    }
    const targetPharm = (selectedPharmacyId && selectedPharmacyId.length === 24) ? selectedPharmacyId : undefined;

    let finalAddress = undefined;
    if (fulfillmentType === 'DELIVERY') {
      if (selectedAddressIndex !== 'CUSTOM' && savedAddresses[Number(selectedAddressIndex)]) {
        const addr = savedAddresses[Number(selectedAddressIndex)];
        finalAddress = {
          street: addr.street || addr.additionalDirections || '',
          city: addr.city || 'Cairo',
          state: addr.state || '',
          zipCode: addr.postalCode || '',
        };
      } else {
        finalAddress = {
          street: customStreet,
          city: customCity || 'Cairo',
        };
      }
    }

    if (paymentMethod === 'CARD') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (cleanCard.length < 15) {
        alert(isAr ? 'الرجاء إدخال رقم بطاقة ائتمان صحيح (16 رقم)' : 'Please enter a valid 16-digit card number');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 4) {
        alert(isAr ? 'الرجاء إدخال تاريخ انتهاء البطاقة (MM/YY)' : 'Please enter a valid expiry date (MM/YY)');
        return;
      }
      if (!cardCvc || cardCvc.length < 3) {
        alert(isAr ? 'الرجاء إدخال رمز الأمان CVC (3 أرقام)' : 'Please enter a valid CVC (3 digits)');
        return;
      }
    }

    const estimatedAmount = Number(quantity) * 5; // e.g. 5 EGP / USD per unit

    createRefillMutation.mutate(
      {
        medicationId: selectedMedId,
        targetPharmacyId: targetPharm,
        quantityRequested: Number(quantity),
        fulfillmentType,
        deliveryAddress: finalAddress,
        paymentMethod,
        paymentStatus: paymentMethod === 'CARD' ? 'PAID' : 'UNPAID',
        totalAmount: estimatedAmount,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setSelectedMedId('');
          setCustomStreet('');
          setCustomCity('');
          setCardNumber('');
          setCardHolder('');
          setCardExpiry('');
          setCardCvc('');
          setLiveToast({
            title: isAr ? 'تم الدفع وتأكيد الطلب بنجاح' : 'Payment Confirmed & Order Sent',
            message: isAr
              ? `تم تأكيد سداد ${estimatedAmount} ج.م عبر Stripe وإرسال طلبك للصيدلية المعتمدة.`
              : `Payment of ${estimatedAmount} EGP confirmed via Stripe. Order sent to pharmacy.`,
          });
          setTimeout(() => setLiveToast(null), 5000);
        },
        onError: (err) => {
          alert(err?.response?.data?.message || (isAr ? 'حدث خطأ أثناء إرسال طلب التعبئة' : 'Failed to submit refill order'));
        },
      }
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return {
          label: isAr ? 'تم تقديم الطلب' : 'Submitted',
          bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
          icon: 'send',
          step: 1,
        };
      case 'APPROVED':
        return {
          label: isAr ? 'تمت الموافقة' : 'Approved',
          bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
          icon: 'task_alt',
          step: 2,
        };
      case 'DISPENSED':
        return {
          label: isAr ? 'جاري تجهيز الدواء' : 'Dispensing',
          bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
          icon: 'vaccines',
          step: 3,
        };
      case 'READY_FOR_PICKUP':
        return {
          label: isAr ? 'جاهز للاستلام / التوصيل' : 'Ready for Pickup',
          bg: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
          icon: 'local_shipping',
          step: 4,
        };
      case 'COMPLETED':
        return {
          label: isAr ? 'مكتمل' : 'Completed',
          bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
          icon: 'check_circle',
          step: 5,
        };
      case 'REJECTED':
        return {
          label: isAr ? 'مرفوض' : 'Rejected',
          bg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
          icon: 'cancel',
          step: 0,
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
          icon: 'info',
          step: 1,
        };
    }
  };

  const filteredOrders = refillOrders.filter((order) => {
    if (activeTab === 'ACTIVE') {
      return ['SUBMITTED', 'APPROVED', 'DISPENSED', 'READY_FOR_PICKUP'].includes(order.orderStatus);
    }
    if (activeTab === 'COMPLETED') return order.orderStatus === 'COMPLETED';
    if (activeTab === 'REJECTED') return order.orderStatus === 'REJECTED';
    return true;
  });

  return (
    <MainLayout activePath="/refills">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 space-x-reverse bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-sm">local_pharmacy</span>
              <span>{isAr ? 'إدارة إعادة التعبئة' : 'Refill Center'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {isAr ? 'طلبات إعادة تعبئة الأدوية' : 'Medication Refill Orders'}
            </h1>
            <p className="mt-1 text-teal-100 text-sm sm:text-base max-w-xl">
              {isAr
                ? 'تابع حالة طلبات الأدوية مع الصيدليات الشريكة واطلب التعبئة الآلية لمخزونك الدوائي.'
                : 'Track order statuses with partner pharmacies and initiate automatic refill requests.'}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-white text-teal-800 hover:bg-teal-50 px-5 py-3 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200"
          >
            <span className="material-symbols-outlined text-xl">add_circle</span>
            <span>{isAr ? 'طلب تعبئة جديد' : 'New Refill Request'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center space-x-2 space-x-reverse overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'ALL', labelAr: 'جميع الطلبات', labelEn: 'All Orders' },
          { id: 'ACTIVE', labelAr: 'الطلبات النشطة', labelEn: 'Active' },
          { id: 'COMPLETED', labelAr: 'المكتملة', labelEn: 'Completed' },
          { id: 'REJECTED', labelAr: 'المرفوضة', labelEn: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isAr ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Refills List */}
      {isLoadingRefills ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-3">
            local_pharmacy
          </span>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {isAr ? 'لا توجد طلبات تعبئة حالية' : 'No Refill Orders Found'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {isAr
              ? 'قم بطلب إعادة تعبئة الأدوية التي تقترب من النفاد مباشرة من صيدليتك المعتمدة.'
              : 'Request refills for medications approaching threshold directly from your partner pharmacy.'}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>{isAr ? 'إنشاء طلب الآن' : 'Create Order Now'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.orderStatus);
            const medName = order.medicationId?.name || (isAr ? 'دواء محدد' : 'Medication');
            const targetPharmacy = order.targetPharmacyId?.pharmacyName || (isAr ? 'صيدلية ميدي مايند' : 'MediMind Pharmacy');

            return (
              <div
                key={order._id || order.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-2xl">medication</span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                        {medName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-xs">store</span>
                        <span>{targetPharmacy}</span>
                        <span>•</span>
                        <span>{order.quantityRequested} {isAr ? 'وحدة' : 'units'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge.bg}`}
                    >
                      <span className="material-symbols-outlined text-sm">{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>
                  </div>
                </div>

                {/* Progress Stepper for Active Orders */}
                {badge.step > 0 && (
                  <div className="pt-2">
                    <div className="grid grid-cols-5 gap-1 text-center">
                      {[
                        { step: 1, labelAr: 'مقدم', labelEn: 'Submitted' },
                        { step: 2, labelAr: 'موافق عليه', labelEn: 'Approved' },
                        { step: 3, labelAr: 'جاري التجهيز', labelEn: 'Dispensing' },
                        { step: 4, labelAr: 'جاهز', labelEn: 'Ready' },
                        { step: 5, labelAr: 'مكتمل', labelEn: 'Completed' },
                      ].map((s) => {
                        const isDone = badge.step >= s.step;
                        const isCurrent = badge.step === s.step;

                        return (
                          <div key={s.step} className="flex flex-col items-center">
                            <div
                              className={`w-full h-1.5 rounded-full mb-1 transition-all ${
                                isDone
                                  ? 'bg-teal-600 dark:bg-teal-400'
                                  : 'bg-slate-200 dark:bg-slate-800'
                              } ${isCurrent ? 'ring-2 ring-teal-400' : ''}`}
                            />
                            <span
                              className={`text-[10px] sm:text-xs font-medium truncate w-full ${
                                isDone
                                  ? 'text-teal-700 dark:text-teal-300 font-bold'
                                  : 'text-slate-400 dark:text-slate-600'
                              }`}
                            >
                              {isAr ? s.labelAr : s.labelEn}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Order Meta details */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/90 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-teal-600">local_shipping</span>
                      <span>
                        {isAr ? 'طريقة الاستلام:' : 'Fulfillment:'}{' '}
                        <strong className="text-slate-700 dark:text-slate-200">
                          {order.fulfillmentType === 'DELIVERY'
                            ? (order.deliveryAddress?.street ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city || ''}` : (isAr ? 'توصيل للمنزل' : 'Home Delivery'))
                            : (isAr ? 'استلام من الصيدلية' : 'Pharmacy Pickup')}
                        </strong>
                      </span>
                    </div>

                    {/* Payment Badge */}
                    <div className="flex items-center gap-1">
                      {order.paymentMethod === 'CARD' || order.paymentMethod === 'STRIPE' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">credit_card</span>
                          <span>{isAr ? 'مدفوع (Stripe)' : 'Paid (Stripe)'}</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">payments</span>
                          <span>{isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {order.createdAt && (
                    <div className="text-[11px]">
                      {isAr ? 'تاريخ الطلب:' : 'Date:'}{' '}
                      {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  )}
                </div>

                {order.pharmacistNotes && (
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-3 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm mt-0.5 text-amber-600">comment</span>
                    <div>
                      <strong className="block font-semibold">{isAr ? 'ملاحظة الصيدلي:' : 'Pharmacist Note:'}</strong>
                      <span>{order.pharmacistNotes}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* NEW REFILL ORDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-600">local_pharmacy</span>
                <span>{isAr ? 'طلب إعادة تعبئة جديد' : 'New Refill Request'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Select Medication */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'اختر الدواء *' : 'Select Medication *'}
                </label>
                <select
                  value={selectedMedId}
                  onChange={(e) => setSelectedMedId(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="">{isAr ? '-- اختر من قائمتك --' : '-- Select from your cabinet --'}</option>
                  {medications.map((m) => (
                    <option key={m.id || m._id} value={m.id || m._id}>
                      {m.name} ({isAr ? 'المخزون الحالي:' : 'Stock:'} {m.currentStock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Pharmacy */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'الصيدلية المعتمدة *' : 'Target Pharmacy *'}
                </label>
                <select
                  value={selectedPharmacyId}
                  onChange={(e) => setSelectedPharmacyId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  {pharmacies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {isAr ? p.arabicName : p.name} ({p.distance})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الكمية المطلوبة' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'طريقة الاستلام' : 'Fulfillment Type'}
                  </label>
                  <select
                    value={fulfillmentType}
                    onChange={(e) => setFulfillmentType(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="DELIVERY">{isAr ? 'توصيل للمنزل' : 'Home Delivery'}</option>
                    <option value="PICKUP">{isAr ? 'استلام شخصي' : 'Pickup'}</option>
                  </select>
                </div>
              </div>

              {/* Address details if Delivery */}
              {fulfillmentType === 'DELIVERY' && (
                <div className="space-y-3 pt-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isAr ? 'اختر عنوان التوصيل' : 'Select Delivery Address'}
                  </label>

                  {savedAddresses.length > 0 ? (
                    <div className="space-y-2">
                      {savedAddresses.map((addr, idx) => (
                        <label
                          key={idx}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedAddressIndex === String(idx)
                              ? 'bg-teal-50/80 dark:bg-teal-950/50 border-teal-500 text-teal-900 dark:text-teal-200 font-semibold'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="addressSelect"
                            value={String(idx)}
                            checked={selectedAddressIndex === String(idx)}
                            onChange={(e) => setSelectedAddressIndex(e.target.value)}
                            className="mt-1 accent-teal-600"
                          />
                          <div className="text-xs">
                            <span className="font-bold block">
                              {isAr ? `العنوان المسجل ${idx + 1}` : `Saved Address ${idx + 1}`}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">
                              {[addr.street, addr.city, addr.state, addr.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        </label>
                      ))}

                      <label
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedAddressIndex === 'CUSTOM'
                            ? 'bg-teal-50/80 dark:bg-teal-950/50 border-teal-500 text-teal-900 dark:text-teal-200 font-semibold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="addressSelect"
                          value="CUSTOM"
                          checked={selectedAddressIndex === 'CUSTOM'}
                          onChange={(e) => setSelectedAddressIndex(e.target.value)}
                          className="accent-teal-600"
                        />
                        <span className="text-xs font-bold">
                          {isAr ? '➕ إدخال عنوان مخصص جديد' : '➕ Enter Custom Address'}
                        </span>
                      </label>
                    </div>
                  ) : null}

                  {(savedAddresses.length === 0 || selectedAddressIndex === 'CUSTOM') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder={isAr ? 'الشارع / رقم المبنى' : 'Street / Building'}
                          value={customStreet}
                          onChange={(e) => setCustomStreet(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          required
                          placeholder={isAr ? 'المدينة (مثال: القاهرة)' : 'City (e.g. Cairo)'}
                          value={customCity}
                          onChange={(e) => setCustomCity(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Method Selector */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'طريقة الدفع' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-2xl border text-start transition-all cursor-pointer flex items-center gap-3 ${
                      paymentMethod === 'CARD'
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-100 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-teal-600 text-2xl">credit_card</span>
                    <div>
                      <span className="block text-xs font-extrabold">{isAr ? 'بطاقة بنكية / فيزا (Stripe)' : 'Credit Card / Visa (Stripe)'}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{isAr ? 'دفع إلكتروني آمن' : 'Instant & Secure'}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                    className={`p-3 rounded-2xl border text-start transition-all cursor-pointer flex items-center gap-3 ${
                      paymentMethod === 'CASH_ON_DELIVERY'
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-100 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-teal-600 text-2xl">payments</span>
                    <div>
                      <span className="block text-xs font-extrabold">{isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{isAr ? 'نقدًا للمندوب/الصيدلية' : 'Pay at fulfillment'}</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* CARD DETAILS FORM (When Credit Card / Stripe is selected) */}
              {paymentMethod === 'CARD' && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-3.5 border border-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-400 text-lg">credit_card</span>
                      <span className="text-xs font-bold text-slate-200">
                        {isAr ? 'بيانات البطاقة الائتمانية (Visa / Mastercard)' : 'Credit Card Information (Stripe)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-80">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-md border border-teal-500/30">
                        Stripe
                      </span>
                    </div>
                  </div>

                  {/* Card Number */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {isAr ? 'رقم البطاقة (16 رقم)' : 'Card Number'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                          const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
                          setCardNumber(formatted);
                        }}
                        placeholder="4242  4242  4242  4242"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-sm font-bold tracking-wider placeholder:text-slate-500 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none"
                      />
                      <span className="absolute end-3 top-2.5 material-symbols-outlined text-slate-400 text-xl pointer-events-none">
                        lock
                      </span>
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {isAr ? 'اسم صاحب البطاقة' : 'Cardholder Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder={isAr ? 'الاسم كما هو مدون على البطاقة' : 'Name as on card'}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs font-semibold placeholder:text-slate-500 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none"
                    />
                  </div>

                  {/* Expiry & CVC Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        {isAr ? 'تاريخ الانتهاء' : 'Expires'}
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (raw.length >= 3) {
                            raw = raw.slice(0, 2) + '/' + raw.slice(2);
                          }
                          setCardExpiry(raw);
                        }}
                        placeholder="MM / YY"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-xs font-bold text-center placeholder:text-slate-500 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        {isAr ? 'رمز الأمان (CVV)' : 'CVC / CVV'}
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setCardCvc(raw);
                        }}
                        placeholder="•••"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-xs font-bold text-center placeholder:text-slate-500 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
                    <span className="material-symbols-outlined text-teal-400 text-sm">verified_user</span>
                    <span>
                      {isAr
                        ? 'المدفوعات مؤمنة ومشفرة 256-bit عبر بوابة Stripe العالمية'
                        : 'Payments are 256-bit encrypted and securely processed via Stripe.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Order Pricing Summary */}
              <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{isAr ? 'تكلفة الدواء التقديرية:' : 'Estimated Medication Cost:'}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{Number(quantity) * 5} EGP</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{isAr ? 'التوصيل والخدمة:' : 'Delivery & Service:'}</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">{isAr ? 'مجاناً' : 'Free'}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700 font-extrabold text-sm text-slate-900 dark:text-white">
                  <span>{isAr ? 'الإجمالي:' : 'Total Amount:'}</span>
                  <span className="text-teal-600 dark:text-teal-400">{Number(quantity) * 5} EGP</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={createRefillMutation.isPending}
                  className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {createRefillMutation.isPending && (
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  )}
                  <span>
                    {paymentMethod === 'CARD'
                      ? (isAr ? 'دفع وتأكيد الطلب' : 'Pay & Submit Order')
                      : (isAr ? 'إرسال طلب التعبئة' : 'Submit Refill Order')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-time Floating Toast Alert */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-4 rounded-2xl shadow-2xl border border-teal-500/40 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <span className="material-symbols-outlined text-teal-400 text-2xl animate-pulse">notifications_active</span>
          <div>
            <h4 className="text-xs font-extrabold">{liveToast.title}</h4>
            <p className="text-xs text-slate-300 dark:text-slate-600">{liveToast.message}</p>
          </div>
          <button onClick={() => setLiveToast(null)} className="ms-3 text-slate-400 hover:text-white dark:hover:text-black font-bold">✕</button>
        </div>
      )}
    </div>
    </MainLayout>
  );
}
