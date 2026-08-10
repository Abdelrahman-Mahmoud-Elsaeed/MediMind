'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useTranslation } from '@/shared/lib/i18nContext';
import { useRefillOrders } from '@/modules/pharmacy/hooks/usePharmacyHooks';

export default function PharmacistProfile() {
  const { user } = useAuth();
  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const { data: refillOrders = [] } = useRefillOrders();

  // Local editable state initialized with live user data
  const [pharmacyName, setPharmacyName] = useState(
    user?.pharmacyName || user?.profile?.pharmacyName || 'MediMind Central Pharmacy'
  );
  const [ownerName, setOwnerName] = useState(
    user?.ownerName || user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Dr. Karim Al-Saeed'
  );
  const [licenseNumber, setLicenseNumber] = useState(
    user?.licenseNumber || user?.profile?.licenseNumber || 'PH-99201'
  );
  const [phone, setPhone] = useState(
    user?.phone || user?.pharmacyPhone || '+20 100 123 4567'
  );
  const [city, setCity] = useState(
    user?.address?.city || 'New Cairo'
  );
  const [street, setStreet] = useState(
    user?.address?.street || '90th Street'
  );
  const [offersDelivery, setOffersDelivery] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const completedCount = refillOrders.filter((o) => o.orderStatus === 'COMPLETED').length;

  return (
    <MainLayout activePath="/profile">
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* Profile Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 p-6 sm:p-8 text-white shadow-xl border border-teal-500/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-teal-500/20 border-2 border-teal-400/40 text-teal-300 font-black text-3xl flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-4xl">local_pharmacy</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-teal-500/20 border border-teal-400/30 text-teal-300">
                    {isAr ? 'صيدلية معتمدة' : 'Verified Partner Pharmacy'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300">
                    #{licenseNumber}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{pharmacyName}</h1>
                <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-teal-400">person</span>
                  <span>{isAr ? 'الصيدلي المسؤول:' : 'Managing Pharmacist:'} {ownerName}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">
                {isEditing ? 'close' : 'edit'}
              </span>
              <span>
                {isEditing
                  ? isAr
                    ? 'إلغاء التعديل'
                    : 'Cancel Edit'
                  : isAr
                  ? 'تعديل بيانات الصيدلية'
                  : 'Edit Pharmacy Details'}
              </span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <span>
              {isAr
                ? 'تم حفظ وتحديث بيانات الصيدلية بنجاح!'
                : 'Pharmacy profile details updated successfully!'}
            </span>
          </div>
        )}

        {/* Profile Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
              {isAr ? 'الطلبات المنفذة والمكتملة' : 'Fulfilled Orders'}
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{completedCount}</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {isAr ? 'مكتمل' : 'Completed'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
              {isAr ? 'حالة التوصيل المنزلي' : 'Delivery Service'}
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {offersDelivery ? (isAr ? 'متاح ومفعل 🛵' : 'Active 🛵') : (isAr ? 'غير متاح 🛑' : 'Disabled')}
              </span>
              <button
                onClick={() => setOffersDelivery(!offersDelivery)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  offersDelivery
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {offersDelivery ? (isAr ? 'تعطيل' : 'Disable') : (isAr ? 'تفعيل' : 'Enable')}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
              {isAr ? 'مستوى الاعتماد' : 'Verification Status'}
            </span>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600 text-xl">verified</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {isAr ? 'ترخيص رسمي معتمد' : 'Officially Verified'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Information & Edit Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-600">store</span>
            <span>{isAr ? 'تفاصيل ترخيص وبيانات الصيدلية' : 'Pharmacy Profile & License Data'}</span>
          </h2>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {isAr ? 'اسم الصيدلية التجاري' : 'Pharmacy Name'}
                  </label>
                  <input
                    type="text"
                    value={pharmacyName}
                    onChange={(e) => setPharmacyName(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {isAr ? 'اسم الصيدلي المسؤول' : 'Owner / Managing Pharmacist'}
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {isAr ? 'رقم الترخيص المهني' : 'License Number'}
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {isAr ? 'رقم هاتف التواصل' : 'Contact Phone'}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {isAr ? 'المدينة / المنطقة' : 'City'}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {isAr ? 'اسم الشارع' : 'Street'}
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md"
                >
                  {isAr ? 'حفظ التغييرات' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold block uppercase tracking-wider">
                  {isAr ? 'اسم الصيدلية:' : 'Pharmacy Name:'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                  {pharmacyName}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold block uppercase tracking-wider">
                  {isAr ? 'الصيدلي المسؤول:' : 'Owner:'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                  {ownerName}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold block uppercase tracking-wider">
                  {isAr ? 'البريد الإلكتروني الحساب:' : 'Account Email:'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                  {user?.email || 'pharmacy@medimind.io'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold block uppercase tracking-wider">
                  {isAr ? 'هاتف التواصل الرئيسي:' : 'Pharmacy Phone:'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                  {phone}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold block uppercase tracking-wider">
                  {isAr ? 'العنوان المسجل:' : 'Registered Address:'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                  {street}, {city}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold block uppercase tracking-wider">
                  {isAr ? 'رقم ترخيص وزارة الصحة:' : 'MOH License Number:'}
                </span>
                <span className="text-sm font-extrabold font-mono text-teal-600 dark:text-teal-400 block">
                  {licenseNumber}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
