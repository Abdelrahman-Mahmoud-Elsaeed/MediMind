'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { useTranslation } from '@/shared/lib/i18nContext';

export const AppSelect = ({
  label,
  value,
  onValueChange,
  placeholder,
  options = [],
  disabled = false,
  className,
}) => {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const defaultPlaceholder = placeholder || (isAr ? 'اختر خياراً' : 'Select an option');

  return (
    <div className="w-full space-y-1.5 text-start">
      {label && (
        <label className="block text-xs font-bold text-on-surface-variant">
          {label}
        </label>
      )}

      <Select value={value || ''} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={defaultPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AppSelect;
