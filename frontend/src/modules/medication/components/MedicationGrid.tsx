import React from 'react';
import { Medication } from '../types/medication.types';
import { MedicationCard } from './MedicationCard';

interface MedicationGridProps {
  medications: Medication[];
  onEdit?: (id: string) => void;
  onSchedule?: (id: string) => void;
  onRefill?: (id: string) => void;
}

export const MedicationGrid: React.FC<MedicationGridProps> = ({
  medications,
  onEdit,
  onSchedule,
  onRefill,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {medications.map((med) => (
        <MedicationCard
          key={med.id}
          medication={med}
          onEdit={onEdit}
          onSchedule={onSchedule}
          onRefill={onRefill}
        />
      ))}
    </div>
  );
};
