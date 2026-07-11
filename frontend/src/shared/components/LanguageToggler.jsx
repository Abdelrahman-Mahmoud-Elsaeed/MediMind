"use client";

import React from "react";
import { useTranslation } from "../lib/i18nContext";

export default function LanguageToggler() {
  const { locale, toggleLanguage } = useTranslation();

  return (
    <button
      onClick={toggleLanguage}
      aria-label={locale === "en" ? "Switch to Arabic" : "التغيير إلى الإنجليزية"}
      className="fixed top-6 end-6 md:top-8 end-8 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full bg-surface-container/60 border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all shadow-md backdrop-blur-md font-label-md text-label-md cursor-pointer select-none"
    >
      <span className="material-symbols-outlined text-[18px]">language</span>
      <span>{locale === "en" ? "العربية" : "English"}</span>
    </button>
  );
}
