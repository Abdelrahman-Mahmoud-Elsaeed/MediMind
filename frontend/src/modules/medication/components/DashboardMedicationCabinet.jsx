'use client';
import React from 'react';
import Link from 'next/link';
import { Card } from '@/shared/components/ui/Card';
import { useMedications } from '@/modules/medication/hooks/useMedicationHooks';
import { useTranslation } from '@/shared/lib/i18nContext';
import { Loader2 } from 'lucide-react';
import { AppProgressBar } from '@/shared/components/ui/AppProgressBar';
import { AppButton } from '@/shared/components/ui/AppButton';
const fallbackMedications = [
    {
        id: 'm1',
        name: 'Metformin 500mg',
        dosage: '500mg',
        frequency: 'Twice daily (Morning & Evening)',
        currentStock: 45,
        totalStock: 60,
        unit: 'UNITS',
        status: 'optimal',
        category: 'active',
        iconType: 'pill',
    },
    {
        id: 'm2',
        name: 'Lisinopril 10mg',
        dosage: '10mg',
        frequency: 'Once daily (Morning)',
        currentStock: 52,
        totalStock: 60,
        unit: 'UNITS',
        status: 'healthy',
        category: 'active',
        iconType: 'bottle',
    },
    {
        id: 'm3',
        name: 'Atorvastatin 10mg',
        dosage: '10mg',
        frequency: 'Once daily (Lunch)',
        currentStock: 12,
        totalStock: 30,
        unit: 'UNITS',
        status: 'low',
        category: 'low_stock',
        iconType: 'kit',
    },
];
export const DashboardMedicationCabinet = () => {
    const { t, locale } = useTranslation();
    const isAr = locale === 'ar';
    const { data: apiMeds = [], isLoading, error } = useMedications();
    const handleRefill = (name) => {
        alert(t('patient.home.refillRequested', { name }));
    };
    const medications = apiMeds.slice(0, 4);
    return (<Card className="hover:shadow-lg transition-shadow p-6 sm:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-on-surface tracking-tight">
            {t('patient.home.cabinetQuickView')}
          </h2>
          <p className="text-xs text-on-surface-variant font-medium">
            {t('patient.home.liveSync')}
          </p>
        </div>
        <Link href="/medications" className="text-xs font-bold text-primary hover:underline transition-colors">
          {t('patient.home.viewAll')} →
        </Link>
      </div>

      {/* Clean List View Layout (Matching Image 2) */}
      {isLoading ? (<div className="flex items-center justify-center py-8 text-on-surface-variant">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2"/>
          <span className="text-xs font-semibold">
            {t('patient.home.loadingMeds')}
          </span>
        </div>) : medications.length === 0 ? (
          <div className="py-8 text-center text-xs text-on-surface-variant">
            {isAr ? 'لا توجد أدوية مضافة في الخزانة حتى الآن' : 'No medications added in your cabinet yet'}
          </div>
        ) : (<div className="space-y-3.5">
          {medications.map((med) => {
                const current = Number(med.currentStock ?? 20);
                const total = Number(med.totalStock ?? 30);
                const percentage = Math.min(100, Math.max(0, Math.round((current / total) * 100)));
                const isCritical = current <= 6 || percentage <= 20;
                return (<div key={med.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl transition-all duration-200 hover:shadow-md hover:border-primary/40 cursor-pointer">
                {/* Icon & Title */}
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${isCritical
                        ? 'bg-error-container/30 text-error'
                        : 'bg-primary-container/20 text-primary'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                    </svg>
                  </div>

                  <h4 className="font-bold text-on-surface text-base sm:text-lg min-w-[140px]">
                    {med.name}
                  </h4>
                </div>

                {/* Progress Bar Track Stretching Across */}
                <div className="flex-1 flex items-center gap-4 w-full">
                  <div className="flex-1">
                    <AppProgressBar value={current} max={total} isCritical={isCritical}/>
                  </div>

                  {/* Stock Counter & Action */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs sm:text-sm font-semibold font-mono ${isCritical ? 'text-error font-bold' : 'text-on-surface-variant'}`}>
                      {current}/{total} {t('patient.home.left')}
                    </span>

                    <AppButton type="button" variant={isCritical ? 'errorContainer' : 'primaryContainer'} size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleRefill(med.name);
                    }} rightIcon={<svg className="w-3.5 h-3.5 rtl:rotate-180 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                        </svg>}/>
                  </div>
                </div>
              </div>);
            })}
        </div>)}
    </Card>);
};
