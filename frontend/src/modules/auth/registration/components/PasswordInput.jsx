import React from "react";
import { useRTL } from "../hooks/useRTL";
import { AppInput } from "@/shared/components/ui/AppInput";
import { cn } from "@/shared/lib/utils";
export function PasswordInput({ id = "password", value, onChange, onBlur, error, touched, showPassword, onTogglePassword, placeholder, label, required = true, disabled = false, showAsterisk = false, }) {
    const { isRtl, t } = useRTL();
    const fieldLabel = label || t("auth.register.passwordLabel");
    const fieldPlaceholder = placeholder || t("auth.register.passwordPlaceholder");
    const hasError = !!error;
    const isValid = !error && value !== "";
    const stateBorderClass = hasError
        ? "border-error focus-visible:border-error focus-visible:ring-error/20"
        : isValid
            ? "border-emerald-500/80 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
            : "border-outline-variant focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";
    return (<div className="w-full text-start">
      {label ? (<div className="mb-2">
          {typeof label === 'string' ? (<label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface" htmlFor={id}>
              {fieldLabel}
              {showAsterisk && <span className="text-error ms-1"> *</span>}
            </label>) : (fieldLabel)}
        </div>) : null}

      <AppInput id={id} type={showPassword ? "text" : "password"} required={required} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} placeholder={fieldPlaceholder} dir={isRtl ? "rtl" : "ltr"} error={hasError ? error : undefined} leftIcon={<span className="material-symbols-outlined text-[22px]">
            lock
          </span>} rightIcon={<button type="button" onClick={onTogglePassword} disabled={disabled} aria-label={showPassword ? "Hide password" : "Show password"} className="text-on-surface-variant hover:text-on-surface cursor-pointer focus:outline-hidden rounded-full p-1 transition-colors disabled:opacity-50">
            <span className="material-symbols-outlined text-[22px]">
              {showPassword ? "visibility" : "visibility_off"}
            </span>
          </button>} className={cn("h-[58px] rounded-[16px] text-base md:text-lg bg-surface-container-lowest shadow-2xs", stateBorderClass)}/>
    </div>);
}
