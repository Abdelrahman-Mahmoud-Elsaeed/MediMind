'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/shared/lib/i18nContext';
import { usePharmacies } from '../hooks/usePharmacyHooks';
import Link from 'next/link';

export default function PharmacySearchComponent() {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const { data: pharmacies = [], isLoading } = usePharmacies(searchQuery);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Search Header Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            <span className="material-symbols-outlined text-base">travel_explore</span>
            <span>{isAr ? 'شبكة الصيدليات المعتمدة' : 'Partner Pharmacy Network'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            {isAr ? 'ابحث عن أقرب صيدلية معتمدة' : 'Find Partner Pharmacies Near You'}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {isAr
              ? 'استكشف الصيدليات المتاحة، تحقق من ساعات العمل، واطلب توصيل الأدوية أو الاستلام المباشر بكل سهولة.'
              : 'Search nearby verified pharmacies, check operating hours, and request fast home delivery or direct pickup.'}
          </p>

          {/* Search Input Box */}
          <div className="relative pt-2">
            <span className="material-symbols-outlined absolute right-4 top-6 text-slate-400 text-2xl rtl:right-4 rtl:left-auto ltr:left-4 ltr:right-auto">
              search
            </span>
            <input
              type="text"
              placeholder={
                isAr
                  ? 'ابحث باسم الصيدلية، الشارع، أو المنطقة...'
                  : 'Search pharmacy name, street, or area...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-4 px-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm sm:text-base font-medium focus:ring-2 focus:ring-teal-400 outline-none transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-600">verified</span>
            <span>{isAr ? 'الصيدليات المتاحة' : 'Verified Pharmacies'}</span>
          </h2>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {pharmacies.length} {isAr ? 'صيدلية' : 'pharmacies found'}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : pharmacies.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-2">
              search_off
            </span>
            <p className="text-slate-600 dark:text-slate-400 font-semibold">
              {isAr ? 'لم نجد صيدليات تطابق بحثك' : 'No pharmacies match your query'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pharmacies.map((pharmacy) => (
              <div
                key={pharmacy.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black">
                        <span className="material-symbols-outlined text-2xl">local_pharmacy</span>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                          {isAr ? pharmacy.arabicName : pharmacy.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mt-0.5">
                          <span className="material-symbols-outlined text-sm">star</span>
                          <span>{pharmacy.rating}</span>
                          <span className="text-slate-400 font-normal">({pharmacy.reviewsCount})</span>
                        </div>
                      </div>
                    </div>
                    {pharmacy.isVerified && (
                      <span className="text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 p-1.5 rounded-full" title={isAr ? 'صيدلية موثوقة' : 'Verified Pharmacy'}>
                        <span className="material-symbols-outlined text-lg">verified</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-base text-slate-400 mt-0.5">location_on</span>
                      <span>{isAr ? pharmacy.arabicAddress : pharmacy.address}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-slate-400">schedule</span>
                      <span>{isAr ? pharmacy.arabicHours : pharmacy.hours}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-slate-400">phone</span>
                      <span>{pharmacy.phone}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {pharmacy.fulfillmentOptions.map((opt) => (
                      <span
                        key={opt}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">
                          {opt === 'DELIVERY' ? 'two_wheeler' : 'storefront'}
                        </span>
                        <span>
                          {opt === 'DELIVERY'
                            ? isAr
                              ? 'خدمة التوصيل'
                              : 'Home Delivery'
                            : isAr
                            ? 'الاستلام المباشر'
                            : 'Direct Pickup'}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/refills"
                    className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs py-3 rounded-2xl transition-all shadow-md"
                  >
                    <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                    <span>{isAr ? 'طلب إعادة تعبئة الآن' : 'Request Medication Refill'}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
