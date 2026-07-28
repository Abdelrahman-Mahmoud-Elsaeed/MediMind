'use client';

import React from 'react';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/shared/lib/utils';

export interface AppProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  isCritical?: boolean;
  className?: string;
  indicatorClassName?: string;
  showText?: boolean;
}

export const AppProgressBar: React.FC<AppProgressBarProps> = ({
  value,
  max = 100,
  label,
  isCritical = false,
  className,
  indicatorClassName,
  showText = false,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className="w-full space-y-1">
      {(label || showText) && (
        <div className="flex justify-between items-center text-xs font-semibold">
          {label && <span className="text-on-surface-variant">{label}</span>}
          {showText && (
            <span
              className={cn(
                'font-mono',
                isCritical ? 'text-error font-bold' : 'text-on-surface-variant'
              )}
            >
              {percentage}%
            </span>
          )}
        </div>
      )}

      <ProgressBar
        value={percentage}
        className={className}
        indicatorClassName={cn(
          isCritical ? 'bg-error' : 'bg-primary',
          indicatorClassName
        )}
      />
    </div>
  );
};

export default AppProgressBar;
