"use client";
import React, { useState, useEffect } from "react";
import { useTranslation } from "@/shared/lib/i18nContext";

export const LanguageToggler = ({ className, variant = "pill", }) => {
    const { locale, toggleLanguage } = useTranslation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isEn = (mounted ? locale : 'en') === 'en';
    const defaultClasses = "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-xs font-bold transition-all cursor-pointer select-none";

    return (
      <button
        type="button"
        onClick={toggleLanguage}
        aria-label={isEn ? "Switch to Arabic" : "التغيير إلى الإنجليزية"}
        title={isEn ? "Switch to Arabic" : "التغيير إلى الإنجليزية"}
        className={className || defaultClasses}
        suppressHydrationWarning
      >
        <span className="material-symbols-outlined text-[18px] text-primary">language</span>
        <span suppressHydrationWarning>{isEn ? "العربية" : "English"}</span>
      </button>
    );
};
export default LanguageToggler;
