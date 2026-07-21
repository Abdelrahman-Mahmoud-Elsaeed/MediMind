"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useTheme } from "next-themes";

export default function AuthHeader() {
  const { locale, toggleLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);


  return (
    <header className="flex items-center justify-between mb-8 md:mb-10">
      {/* Brand / Logo */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
          <span
            className="material-symbols-outlined text-on-primary !text-[24px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            medical_services
          </span>
        </div>
        <span className="font-['Manrope'] font-bold text-[22px] md:text-[26px] leading-[32px] text-on-surface tracking-tight">
          MedTech Pro
        </span>
      </div>

      {/* Actions (Language & Theme Controls) */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Language Toggle Pill */}
        <div className="flex items-center bg-surface-container rounded-full p-1 transition-all hover:bg-surface-variant">
          <button
            type="button"
            onClick={() => locale !== "en" && toggleLanguage()}
            className={`flex items-center justify-center px-3.5 py-1.5 rounded-full font-['JetBrains_Mono'] text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              locale === "en"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => locale !== "ar" && toggleLanguage()}
            className={`flex items-center justify-center px-3.5 py-1.5 rounded-full font-['JetBrains_Mono'] text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              locale === "ar"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            AR
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined !text-[22px]">
            {mounted && theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>
      </div>
    </header>
  );
}