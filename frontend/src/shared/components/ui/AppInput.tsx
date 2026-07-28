'use client';

import React from 'react';
import { Input, InputProps } from './input';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from '@/shared/lib/i18nContext';

export interface AppInputProps extends InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className,
      style,
      id,
      ...props
    },
    ref
  ) => {
    const { dir } = useTranslation();
    const isRtl = dir === 'rtl';
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const computedStyle: React.CSSProperties = {
      paddingLeft: isRtl
        ? rightIcon
          ? '48px'
          : '16px'
        : leftIcon
        ? '48px'
        : '16px',
      paddingRight: isRtl
        ? leftIcon
          ? '48px'
          : '16px'
        : rightIcon
        ? '48px'
        : '16px',
      ...style,
    };

    return (
      <div className="w-full space-y-1.5 text-start">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold text-on-surface-variant"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute inset-y-0 start-3.5 flex items-center justify-center text-on-surface-variant pointer-events-none z-10">
              {leftIcon}
            </div>
          )}

          <Input
            id={inputId}
            ref={ref}
            style={computedStyle}
            className={cn(
              error && 'border-error focus-visible:ring-error/20',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 end-3.5 flex items-center justify-center text-on-surface-variant z-10">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-[11px] font-bold text-error mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] font-medium text-on-surface-variant/70 mt-1">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

AppInput.displayName = 'AppInput';
export default AppInput;
