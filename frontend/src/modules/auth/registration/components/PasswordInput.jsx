import React from "react";
import { useRTL } from "../hooks/useRTL";

export function PasswordInput({
  id = "password",
  value,
  onChange,
  onBlur,
  error,
  touched,
  showPassword,
  onTogglePassword,
  placeholder,
  label,
  required = true,
  disabled = false,
}) {
  const { isRtl, t } = useRTL();

  const fieldLabel = label || t("auth.register.passwordLabel");
  const fieldPlaceholder = placeholder || t("auth.register.passwordPlaceholder");

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
      <div className="relative">
        {/* Lock Icon */}
        <span
          className={`material-symbols-outlined absolute ${
            isRtl ? "right-4" : "left-4"
          } top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[22px] z-10`}
        >
          lock
        </span>

        {/* Password Input: set direction and alignment dynamically matching active layout context */}
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          required={required}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={fieldPlaceholder}
          dir={isRtl ? "rtl" : "ltr"}
          className={`w-full h-[58px] ${
            isRtl ? "pr-[48px] pl-[48px]" : "pl-[48px] pr-[48px]"
          } ${
            isRtl ? "text-right" : "text-left"
          } font-['Inter'] text-base md:text-lg text-on-surface bg-surface-container-lowest border ${stateBorderClass} focus:outline-none placeholder:text-on-surface-variant/60 dark:placeholder:text-on-surface-variant/70 transition-all rounded-[16px] shadow-sm disabled:opacity-50 disabled:bg-surface-container-low`}
        />

        {/* Eye Visibility Toggle */}
        <button
          type="button"
          onClick={onTogglePassword}
          disabled={disabled}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className={`absolute ${
            isRtl ? "left-4" : "right-4"
          } top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-full p-1 z-10 disabled:opacity-50`}
        >
          <span className="material-symbols-outlined text-[22px]">
            {showPassword ? "visibility" : "visibility_off"}
          </span>
        </button>
      </div>
      {hasError && (
        <p className="text-error text-xs md:text-sm font-medium mt-1.5 text-start">{error}</p>
      )}
    </div>
  );
}
