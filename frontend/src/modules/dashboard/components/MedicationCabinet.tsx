'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/shared/components/ui/Card';
import { MedicationCard, MedicationData } from './MedicationCard';
import { useMedications } from '@/modules/medication/hooks/useMedicationHooks';
import { Loader2 } from 'lucide-react';

const fallbackMedications: MedicationData[] = [
  {
    id: 'm1',
    name: 'Metformin 500mg',
    dosage: '500mg',
    frequency: 'Twice daily (Morning & Evening)',
    remainingPills: 45,
    totalPills: 60,
    status: 'active',
    iconType: 'pill',
  },
  {
    id: 'm2',
    name: 'Lisinopril 10mg',
    dosage: '10mg',
    frequency: 'Once daily (Morning)',
    remainingPills: 52,
    totalPills: 60,
    status: 'active',
    iconType: 'heart',
  },
  {
    id: 'm3',
    name: 'Atorvastatin 10mg',
    dosage: '10mg',
    frequency: 'Once daily (Lunch)',
    remainingPills: 12,
    totalPills: 30,
    status: 'low_stock',
    iconType: 'capsule',
  },
];

export const MedicationCabinet: React.FC = () => {
  const { data: apiMeds, isLoading } = useMedications();

  const handleRefill = (id: string) => {
    alert(`Refill requested for medication ID: ${id}`);
  };

  const medications: MedicationData[] =
    apiMeds && apiMeds.length > 0
      ? apiMeds.slice(0, 3).map((item) => ({
          id: item.id,
          name: item.name,
          dosage: item.dosage,
          frequency: item.frequency,
          remainingPills: item.currentStock,
          totalPills: item.totalStock,
          status: item.status === 'low' || item.status === 'urgent' ? 'low_stock' : 'active',
          iconType: item.iconType === 'bottle' ? 'capsule' : item.iconType === 'kit' ? 'heart' : 'pill',
        }))
      : fallbackMedications;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Medications Cabinet
          </h2>
          <p className="text-xs text-slate-400 font-medium">Live sync with patient prescriptions</p>
        </div>
        <Link
          href="/medications"
          className="text-xs font-bold text-[#006C4E] dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          View Full Cabinet →
        </Link>
      </div>

      {/* Medication List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mr-2" />
          <span className="text-xs font-semibold">Loading medications...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {medications.map((med) => (
            <MedicationCard key={med.id} medication={med} onRefill={handleRefill} />
          ))}
        </div>
      )}
    </Card>
  );
};
