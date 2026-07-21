import React, { useRef } from "react";
import { useRTL } from "../hooks/useRTL";

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
  children,
}) {
  const { isRtl } = useRTL();
  const inputRef = useRef(null);

  // Determine border and visual states
  const hasError = touched && !!error;
  const isValid = touched && !error && value !== "";

  const stateBorderClass = hasError
    ? "border-error focus:border-error focus:ring-error/20"
    : isValid
      ? "border-emerald-500/80 focus:border-emerald-500 focus:ring-emerald-500/20"
      : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20";

  const placeholderContrastClass = "placeholder:text-on-surface-variant/60 dark:placeholder:text-on-surface-variant/70";

  const handleContainerClick = () => {
    if (disabled) return;
    if (type === "date" && inputRef.current) {
      try {
        inputRef.current.showPicker?.();
      } catch (err) {
        inputRef.current.focus();
      }
    } else {
      inputRef.current?.focus();
    }
  };

  if (type === "select") {
    return (
      <div className="w-full">
        <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor={id}>
          {label}
        </label>
        <div className="relative">
          {icon && (
            <span
              className={`material-symbols-outlined absolute ${
                isRtl ? "right-4" : "left-4"
              } top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[22px] z-10`}
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
            dir={dir || (isRtl ? "rtl" : "ltr")}
            className={`w-full h-[58px] ${
              icon
                ? isRtl
                  ? "pr-[48px] pl-[36px]"
                  : "pl-[48px] pr-[36px]"
                : isRtl
                  ? "pr-4 pl-[36px]"
                  : "pl-4 pr-[36px]"
            } font-['Inter'] text-base md:text-lg text-on-surface bg-surface-container-lowest border ${stateBorderClass} focus:outline-none transition-all rounded-[16px] shadow-sm appearance-none cursor-pointer disabled:opacity-50 disabled:bg-surface-container-low`}
          >
            {children}
          </select>
          <span
            className={`material-symbols-outlined absolute ${
              isRtl ? "left-3" : "right-3"
            } top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px] z-10`}
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

  return (
    <div className="w-full">
      <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor={id}>
        {label}
      </label>
      <div
        onClick={handleContainerClick}
        className="relative cursor-text"
      >
        {icon && (
          <span
            className={`material-symbols-outlined absolute ${
              isRtl ? "right-4" : "left-4"
            } top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[22px] z-10`}
          >
            {icon}
          </span>
        )}
        <input
          ref={inputRef}
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          dir={dir || (isRtl ? "rtl" : "ltr")}
          className={`w-full h-[58px] ${
            icon
              ? isRtl
                ? "pr-[48px] pl-4"
                : "pl-[48px] pr-4"
              : "px-4"
          } font-['Inter'] text-base md:text-lg text-on-surface bg-surface-container-lowest border ${stateBorderClass} focus:outline-none ${placeholderContrastClass} transition-all rounded-[16px] shadow-sm disabled:opacity-50 disabled:bg-surface-container-low ${
            type === "date" ? "[&::-webkit-calendar-picker-indicator]:opacity-0 cursor-pointer" : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (type === "date") {
              try {
                e.target.showPicker?.();
              } catch (err) {
                // fall back to default focus/click
              }
            }
          }}
        />
      </div>
      {hasError && (
        <p className="text-error text-xs md:text-sm font-medium mt-1.5 text-start">{error}</p>
      )}
    </div>
  );
}
