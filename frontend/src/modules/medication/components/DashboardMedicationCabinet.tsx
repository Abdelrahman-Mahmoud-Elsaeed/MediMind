'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/shared/components/ui/Card';
import { MedicationCard } from './MedicationCard';
import { Medication } from '../types/medication.types';
import { useMedications } from '@/modules/medication/hooks/useMedicationHooks';
import { useTranslation } from '@/shared/lib/i18nContext';
import { Loader2 } from 'lucide-react';

const fallbackMedications: Medication[] = [
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

export const DashboardMedicationCabinet: React.FC = () => {
  const { locale } = useTranslation();
  const { data: apiMeds, isLoading } = useMedications();

  const isAr = locale === 'ar';

  const handleRefill = (id: string) => {
    alert(isAr ? `طلب إعادة تعبئة للدواء ${id}` : `Refill requested for medication ID: ${id}`);
  };

  const medications: Medication[] =
    apiMeds && apiMeds.length > 0 ? apiMeds.slice(0, 3) : fallbackMedications;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {isAr ? 'خزانة الأدوية' : 'Medications Cabinet'}
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            {isAr ? 'مزامنة مباشرة مع وصفات المريض الطبية' : 'Live sync with patient prescriptions'}
          </p>
        </div>
        <Link
          href="/medications"
          className="text-xs font-bold text-[#006C4E] dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          {isAr ? 'عرض الخزانة الكاملة ←' : 'View Full Cabinet →'}
        </Link>
      </div>

      {/* Medication List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mr-2" />
          <span className="text-xs font-semibold">
            {isAr ? 'جاري تحميل الأدوية...' : 'Loading medications...'}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medications.map((med) => (
            <MedicationCard key={med.id} medication={med} onRefill={handleRefill} />
          ))}
        </div>
      )}
    </Card>
  );
};
