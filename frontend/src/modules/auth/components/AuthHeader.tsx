"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useTheme } from "next-themes";
import { LanguageToggler } from "@/shared/components/LanguageToggler";
import { AppButton } from "@/shared/components/ui/AppButton";

export default function AuthHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="flex items-center justify-between mb-8 md:mb-10">
      {/* Brand / Logo */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-2xs">
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
        <LanguageToggler />

        {/* Dark Mode Toggle */}
        <AppButton
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined !text-[22px]">
            {mounted && resolvedTheme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </AppButton>
      </div>
    </header>
  );
}