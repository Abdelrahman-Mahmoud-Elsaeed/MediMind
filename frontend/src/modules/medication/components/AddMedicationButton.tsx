'use client';

import React from 'react';
import { PlusCircle } from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18nContext';

interface AddMedicationButtonProps {
  onClick?: () => void;
}

export const AddMedicationButton: React.FC<AddMedicationButtonProps> = ({ onClick }) => {
  const { locale } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-[#006C4E] hover:bg-[#00523B] text-white px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-900/10 transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
    >
      <PlusCircle className="w-4 h-4" />
      <span>{locale === 'ar' ? 'إضافة دواء جديد' : 'Add New Medication'}</span>
    </button>
  );
};
