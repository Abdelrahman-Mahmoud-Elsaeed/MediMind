import React, { useRef } from "react";
import { useRTL } from "../hooks/useRTL";
import { AppInput } from "@/shared/components/ui/AppInput";
import { cn } from "@/shared/lib/utils";

interface FormFieldProps {
  id: string;
  label: React.ReactNode;
  type?: string;
  value?: any;
  onChange?: (e: any) => void;
  onBlur?: (e: any) => void;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  icon?: string;
  required?: boolean;
  dir?: 'ltr' | 'rtl' | string;
  disabled?: boolean;
  showAsterisk?: boolean;
  children?: React.ReactNode;
}

export function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  icon,
  required = false,
  dir,
  disabled = false,
  showAsterisk = false,
  children,
}: FormFieldProps) {
  const { isRtl } = useRTL();

  // errors are pre-filtered by the hook (only shown when field is touched/autofilled/submit-attempted)
  const hasError = !!error;
  const isValid = !error && value !== "" && value !== undefined;

  const stateBorderClass = hasError
    ? "border-error focus-visible:border-error focus-visible:ring-error/20"
    : isValid
      ? "border-emerald-500/80 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
      : "border-outline-variant focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

  const resolvedDir = dir || (isRtl ? "rtl" : "ltr");

  const labelContent = (
    <span>
      {label}
      {showAsterisk && <span className="text-error ms-1"> *</span>}
    </span>
  );

  const leftIconNode = icon ? (
    <span className="material-symbols-outlined text-[22px]">
      {icon}
    </span>
  ) : undefined;

  if (type === "select") {
    return (
      <div className="w-full text-start">
        <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor={id}>
          {labelContent}
        </label>
        <div className="relative flex items-center w-full">
          {icon && (
            <span
              className={`material-symbols-outlined absolute ${isRtl ? "end-4" : "start-4"
                } inset-y-0 my-auto !flex !items-center !justify-center text-on-surface-variant pointer-events-none !text-[22px] z-10`}
            >
              {icon}
            </span>
          )}
          <select
            id={id}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            dir={resolvedDir}
            style={{
              paddingLeft: isRtl ? '40px' : icon ? '48px' : '16px',
              paddingRight: isRtl ? (icon ? '48px' : '16px') : '40px',
            }}
            className={cn(
              "w-full h-[58px] font-['Inter'] text-base md:text-lg text-on-surface bg-surface-container-lowest border transition-all rounded-[16px] shadow-2xs appearance-none cursor-pointer disabled:opacity-50 disabled:bg-surface-container-low",
              stateBorderClass
            )}
          >
            {children}
          </select>
          <span
            className={`material-symbols-outlined absolute ${isRtl ? "start-3" : "end-3"
              } inset-y-0 my-auto !flex !items-center !justify-center text-on-surface-variant pointer-events-none !text-[20px] z-10`}
          >
            unfold_more
          </span>
        </div>
        {hasError && (
          <p className="text-error text-xs md:text-sm font-medium mt-1.5 text-start">{error}</p>
        )}
      </div>
    );
  }

  const todayMax = type === "date" ? new Date().toISOString().split('T')[0] : undefined;

  return (
    <div className="w-full text-start">
      <AppInput
        id={id}
        type={type}
        required={required}
        max={todayMax}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        dir={resolvedDir}
        error={hasError ? error : undefined}
        label={typeof label === 'string' ? label : undefined}
        leftIcon={leftIconNode}
        className={cn(
          "h-[58px] rounded-[16px] text-base md:text-lg bg-surface-container-lowest shadow-2xs",
          stateBorderClass
        )}
      />
    </div>
  );
}
