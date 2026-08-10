'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Pill, 
  ArrowLeft, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  PackageCheck, 
  CheckCircle,
  Activity,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18nContext';
import { AppCard, AppBadge, AppProgressBar } from '@/shared/components/ui';
import { usePatientMedicationsQuery } from '../hooks/useCaregiverQueries';

export function CaregiverPatientMedicationsComponent({ patientId }) {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const [activeTab, setActiveTab] = useState('ALL');

  const { data: medications = [], isLoading, isError } = usePatientMedicationsQuery(patientId);

  const filteredMeds = medications.filter((m) => {
    if (activeTab === 'ACTIVE') return m.isActive;
    if (activeTab === 'LOW_STOCK') {
      const current = m.inventory?.currentQuantity ?? 0;
      const threshold = m.inventory?.refillThreshold ?? 5;
      return current <= threshold;
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Back Link */}
      <div>
        <Link 
          href={`/patients/${patientId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{isAr ? 'العودة لمركز المريض' : 'Back to Patient Hub'}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface flex items-center gap-3">
            <Pill className="w-8 h-8 text-primary" />
            <span>{isAr ? 'خزانة أدوية المريض' : 'Patient Medication Cabinet'}</span>
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {isAr ? 'عرض وتتبع جميع الوصفات الطبية والمخزون الحالي للمريض.' : 'View active prescriptions, dose schedules, and stock levels.'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-surface-container-lowest dark:bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/30 text-xs font-semibold self-start sm:self-auto">
          {['ALL', 'ACTIVE', 'LOW_STOCK'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === tab 
                  ? 'bg-primary text-on-primary shadow-sm' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab === 'ALL' ? (isAr ? 'الكل' : 'All') :
               tab === 'ACTIVE' ? (isAr ? 'نشطة' : 'Active') :
               (isAr ? 'مخزون منخفض' : 'Low Stock')}
            </button>
          ))}
        </div>
      </div>

      {/* Medications Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-surface-container-low animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-center text-red-500 font-semibold">
          {isAr ? 'تعذر تحميل أدوية المريض' : 'Failed to load patient medications'}
        </div>
      ) : filteredMeds.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl border border-outline-variant/30 p-8">
          <Pill className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-on-surface">
            {isAr ? 'لا توجد أدوية مطابقة' : 'No Medications Found'}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeds.map((med) => {
            const current = med.inventory?.currentQuantity ?? 0;
            const initial = med.inventory?.initialQuantity || 30;
            const threshold = med.inventory?.refillThreshold ?? 5;
            const isLowStock = current <= threshold;
            const percent = Math.min(100, Math.max(0, Math.round((current / initial) * 100)));

            return (
              <AppCard 
                key={med._id}
                className="p-6 border border-outline-variant/30 rounded-3xl flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-on-surface text-lg leading-tight">
                          {med.name}
                        </h3>
                        <p className="text-xs text-on-surface-variant font-medium">
                          {med.formType || 'Tablet'}
                        </p>
                      </div>
                    </div>

                    <AppBadge variant={isLowStock ? 'warning' : 'success'}>
                      {isLowStock ? (isAr ? 'مخزون منخفض' : 'Low Stock') : (isAr ? 'متوفر' : 'In Stock')}
                    </AppBadge>
                  </div>

                  {/* Stock Level Bar */}
                  <div className="space-y-1.5 mb-4 bg-surface-container-low/60 p-3 rounded-2xl">
                    <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                      <span>{isAr ? 'المخزون المتبقي:' : 'Stock Remaining:'}</span>
                      <span>{current} / {initial}</span>
                    </div>
                    <AppProgressBar value={percent} className="h-2" />
                  </div>

                  {/* Instructions & Dose Times */}
                  <div className="space-y-2 text-xs text-on-surface-variant">
                    {med.instructions?.relationToMeals && (
                      <div className="flex items-center justify-between">
                        <span>{isAr ? 'علاقة بالوجبات:' : 'Relation to Meals:'}</span>
                        <span className="font-semibold text-on-surface">{med.instructions.relationToMeals}</span>
                      </div>
                    )}

                    {med.schedule?.timesOfDay && (
                      <div className="flex items-center justify-between">
                        <span>{isAr ? 'أوقات الجرعات:' : 'Scheduled Times:'}</span>
                        <span className="font-semibold text-primary">{med.schedule.timesOfDay.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-[11px] font-semibold text-on-surface-variant">
                  <span>{med.isChronic ? (isAr ? 'دواء مزمن' : 'Chronic') : (isAr ? 'دواء مؤقت' : 'Acute')}</span>
                  {med.expirationDate && (
                    <span>
                      {isAr ? 'ينتهي: ' : 'Exp: '}
                      {new Date(med.expirationDate).toLocaleDateString()}
                    </span>
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
export default CaregiverPatientMedicationsComponent;
