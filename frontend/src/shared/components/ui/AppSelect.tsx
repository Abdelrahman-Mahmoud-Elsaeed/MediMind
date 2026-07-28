'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

export interface SelectOption {
  value: string;
  label: string;
}

export interface AppSelectProps {
  label?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
}

export const AppSelect: React.FC<AppSelectProps> = ({
  label,
  value,
  onValueChange,
  placeholder = 'Select an option',
  options,
  disabled = false,
  className,
}) => {
  return (
    <div className="w-full space-y-1.5 text-start">
      {label && (
        <label className="block text-xs font-bold text-on-surface-variant">
          {label}
        </label>
      )}

      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
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
