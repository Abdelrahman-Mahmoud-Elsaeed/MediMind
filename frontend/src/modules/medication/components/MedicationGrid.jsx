import React from 'react';
import { MedicationCard } from './MedicationCard';
export const MedicationGrid = ({ medications, onEdit, onSchedule, onRefill, }) => {
    return (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {medications.map((med) => (<MedicationCard key={med.id} medication={med} onEdit={onEdit} onSchedule={onSchedule} onRefill={onRefill}/>))}
    </div>);
};
