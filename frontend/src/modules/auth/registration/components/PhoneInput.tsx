import React from "react";
import { useRTL } from "../hooks/useRTL";
import { CountrySelector } from "./CountrySelector";

interface PhoneInputProps {
  id?: string;
  value?: any;
  onChange?: (e: any) => void;
  onBlur?: (e: any) => void;
  error?: string;
  touched?: boolean;
  isPhoneInput?: boolean;
  countrySelectorProps?: any;
  placeholder?: string;
  label?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  showAsterisk?: boolean;
}

export function PhoneInput({
  id = "loginInput",
  value,
  onChange,
  onBlur,
  error,
  touched,
  isPhoneInput,
  countrySelectorProps,
  placeholder,
  label,
  required = true,
  disabled = false,
  showAsterisk = false,
}: PhoneInputProps) {
  const { isRtl, t } = useRTL();
  const isPhone = isPhoneInput !== undefined ? isPhoneInput : (id === "phone" || id === "emergencyContactPhone");

  const fieldLabel = label || t("auth.register.emailOrPhoneLabel");
  const defaultPhonePlaceholder = countrySelectorProps?.placeholder || "100 000 0000";
  const fieldPlaceholder =
    placeholder ||
    (isPhone
      ? defaultPhonePlaceholder
      : t("auth.register.emailOrPhonePlaceholder"));

  // errors are pre-filtered by the hook (only shown when field is touched/autofilled/submit-attempted)
  const hasError = !!error;
  const isValid = !error && value !== "" && value !== undefined;

  const stateBorderClass = hasError
    ? "border-error focus:border-error focus:ring-error/20"
    : isValid
      ? "border-emerald-500/80 focus:border-emerald-500 focus:ring-emerald-500/20"
      : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="w-full">
      <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor={id}>
        {fieldLabel}
        {showAsterisk && <span className="text-error ms-1"> *</span>}
      </label>
      <div className="relative flex items-center">
        <span
          className={`material-symbols-outlined absolute ${isRtl ? "end-4" : "start-4"
            } top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none z-10 !text-[22px]`}
        >
          {isPhoneInput ? "call" : "mail"}
        </span>

        <input
          id={id}
          type="text"
          required={required}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={fieldPlaceholder}
          dir={isRtl ? "rtl" : "ltr"}
          className={`w-full h-[58px] font-['Inter'] text-base md:text-lg text-on-surface bg-surface-container-lowest border ${stateBorderClass} focus:outline-none placeholder:text-on-surface-variant/60 dark:placeholder:text-on-surface-variant/70 transition-all rounded-[16px] shadow-sm disabled:opacity-50 disabled:bg-surface-container-low ${isPhoneInput ? "ps-[48px] pe-[145px]" : "ps-[48px] pe-[48px]"
            }`}
        />

        {isPhoneInput && <CountrySelector {...countrySelectorProps} />}
      </div>
      {hasError && (
        <p className="text-error text-xs md:text-sm font-medium mt-1.5 text-start">{error}</p>
      )}
    </div>
  );
}
