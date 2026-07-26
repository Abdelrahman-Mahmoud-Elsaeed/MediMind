import React from 'react';
import { MedicationFilters } from './MedicationFilters';
import { AddMedicationButton } from './AddMedicationButton';

interface MedicationHeaderProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onAddClick?: () => void;
}

export const MedicationHeader: React.FC<MedicationHeaderProps> = ({
  activeFilter,
  onFilterChange,
  onAddClick,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <MedicationFilters
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
      />
      <AddMedicationButton onClick={onAddClick} />
    </div>
  );
};
