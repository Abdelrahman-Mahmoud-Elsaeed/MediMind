import React from 'react';
import { MedicationFilters } from './MedicationFilters';
import { AddMedicationButton } from './AddMedicationButton';

export const MedicationHeader = ({ activeFilter, onFilterChange, lowStockCount = 0, onAddClick }) => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <MedicationFilters activeFilter={activeFilter} onFilterChange={onFilterChange} lowStockCount={lowStockCount} />
        <AddMedicationButton onClick={onAddClick} />
      </div>
    );
};
