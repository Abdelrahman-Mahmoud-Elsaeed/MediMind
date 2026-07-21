import React from "react";
import { useRTL } from "../hooks/useRTL";
import { CountrySelector } from "./CountrySelector";

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
}) {
  const { isRtl, t } = useRTL();

  const fieldLabel = label || t("auth.register.emailOrPhoneLabel");
  const fieldPlaceholder = placeholder || t("auth.register.emailOrPhonePlaceholder");

  const hasError = touched && !!error;
  const isValid = touched && !error && value !== "";

  const stateBorderClass = hasError
    ? "border-error focus:border-error focus:ring-error/20"
    : isValid
      ? "border-emerald-500/80 focus:border-emerald-500 focus:ring-emerald-500/20"
      : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="w-full">
      <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor={id}>
        {fieldLabel}
      </label>
      <div className="relative flex items-center">
        <span
          className={`material-symbols-outlined absolute ${
            isRtl ? "right-4" : "left-4"
          } top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none z-10 text-[22px]`}
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
          dir={isPhoneInput ? "ltr" : isRtl ? "rtl" : "ltr"}
          className={`w-full h-[58px] font-['Inter'] text-base md:text-lg text-on-surface bg-surface-container-lowest border ${stateBorderClass} focus:outline-none placeholder:text-on-surface-variant/60 dark:placeholder:text-on-surface-variant/70 transition-all rounded-[16px] shadow-sm disabled:opacity-50 disabled:bg-surface-container-low ${
            isPhoneInput
              ? isRtl
                ? "pr-[48px] pl-[145px]"
                : "pl-[48px] pr-[145px]"
              : isRtl
                ? "pr-[48px] pl-4"
                : "pl-[48px] pr-4"
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
