"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/i18nContext";

export default function BrandingSidebar() {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:flex relative min-h-screen bg-[linear-gradient(160deg,#4f9dff_0%,#f7a8c4_55%,#37b7a5_100%)] dark:bg-[linear-gradient(160deg,#090d16_0%,#0f172a_50%,#062e24_100%)] overflow-hidden flex-col justify-center items-center px-8 lg:px-12 py-12 transition-colors duration-300">
      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20 bg-[radial-gradient(rgba(255,255,255,0.4)_2px,transparent_2px)] dark:bg-[radial-gradient(rgba(255,255,255,0.2)_2px,transparent_2px)] [background-size:28px_28px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent dark:from-black/70 dark:via-black/20 dark:to-black/30" />

      {/* Butterfly SVG Particle 1 - Emerald */}
      <svg
        className="absolute top-1/4 left-1/4 opacity-50 dark:opacity-40 w-12 h-12 animate-[float_6s_ease-in-out_infinite]"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="text-white dark:text-[#4adea9]"
          d="M12,15.5C10.5,16 9,15 8.5,13.5C8,12 8,10.5 9,9.5C10,8.5 11.5,8.5 12,9.5C12.5,8.5 14,8.5 15,9.5C16,10.5 16,12 15.5,13.5C15,15 13.5,16 12,15.5M12,13.5C12.5,14 13.5,14 14,13C14.5,12 14,11 13.5,10.5C13,10 12.5,10 12,11C11.5,10 11,10 10.5,10.5C10,11 9.5,12 10,13C10.5,14 11.5,14 12,13.5M12,2C17.5,2 22,6.5 22,12C22,17.5 17.5,22 12,22C6.5,22 2,17.5 2,12C2,6.5 6.5,2 12,2Z"
        />
      </svg>

      {/* Butterfly SVG Particle 2 - Violet */}
      <svg
        className="absolute top-1/3 right-1/4 opacity-30 dark:opacity-25 w-8 h-8 rotate-[45deg] animate-[float_7s_ease-in-out_2s_infinite]"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="text-white dark:text-[#bc7aff]"
          d="M12,15.5C10.5,16 9,15 8.5,13.5C8,12 8,10.5 9,9.5C10,8.5 11.5,8.5 12,9.5C12.5,8.5 14,8.5 15,9.5C16,10.5 16,12 15.5,13.5C15,15 13.5,16 12,15.5M12,13.5C12.5,14 13.5,14 14,13C14.5,12 14,11 13.5,10.5C13,10 12.5,10 12,11C11.5,10 11,10 10.5,10.5C10,11 9.5,12 10,13C10.5,14 11.5,14 12,13.5M12,2C17.5,2 22,6.5 22,12C22,17.5 17.5,22 12,22C6.5,22 2,17.5 2,12C2,6.5 6.5,2 12,2Z"
        />
      </svg>

      {/* Butterfly SVG Particle 3 - Emerald Rotated */}
      <svg
        className="absolute bottom-1/4 left-1/3 opacity-40 dark:opacity-30 w-10 h-10 -rotate-[15deg] animate-[float_8s_ease-in-out_1s_infinite]"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="text-white dark:text-[#4adea9]"
          d="M12,15.5C10.5,16 9,15 8.5,13.5C8,12 8,10.5 9,9.5C10,8.5 11.5,8.5 12,9.5C12.5,8.5 14,8.5 15,9.5C16,10.5 16,12 15.5,13.5C15,15 13.5,16 12,15.5M12,13.5C12.5,14 13.5,14 14,13C14.5,12 14,11 13.5,10.5C13,10 12.5,10 12,11C11.5,10 11,10 10.5,10.5C10,11 9.5,12 10,13C10.5,14 11.5,14 12,13.5M12,2C17.5,2 22,6.5 22,12C22,17.5 17.5,22 12,22C6.5,22 2,17.5 2,12C2,6.5 6.5,2 12,2Z"
        />
      </svg>

      {/* Content Container */}
      <div className="relative z-10 max-w-lg text-center flex flex-col items-center">
        {/* Main Hero Icon */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-2xl border border-white/30 dark:border-white/20 animate-[pulse-slow_4s_ease-in-out_infinite]">
          <span className="material-symbols-outlined !text-[60px] sm:!text-[72px] text-white dark:text-primary">
            diversity_1
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight drop-shadow-md">
          {t("auth.register.step1Subtitle")}
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-white/95 dark:text-white/80 mb-8 drop-shadow-sm leading-relaxed max-w-md font-medium">
          {t("auth.register.roleInfo")}
        </p>

        {/* Feature Pills List */}
        <div className="flex flex-wrap justify-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/15 dark:bg-black/40 backdrop-blur-sm rounded-full border border-white/25 dark:border-white/10 text-white dark:text-primary text-sm font-semibold tracking-wide shadow-sm">
            <span className="material-symbols-outlined text-[18px]">
              medication
            </span>
            <span>{t("patient.nav.meds")}</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white/15 dark:bg-black/40 backdrop-blur-sm rounded-full border border-white/25 dark:border-white/10 text-white dark:text-primary text-sm font-semibold tracking-wide shadow-sm">
            <span className="material-symbols-outlined text-[18px]">
              group
            </span>
            <span>{t("patient.nav.care")}</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white/15 dark:bg-black/40 backdrop-blur-sm rounded-full border border-white/25 dark:border-white/10 text-white dark:text-primary text-sm font-semibold tracking-wide shadow-sm">
            <span className="material-symbols-outlined text-[18px]">
              insights
            </span>
            <span>{t("patient.nav.adherence")}</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white/15 dark:bg-black/40 backdrop-blur-sm rounded-full border border-white/25 dark:border-white/10 text-white dark:text-primary text-sm font-semibold tracking-wide shadow-sm">
            <span className="material-symbols-outlined text-[18px]">
              shield
            </span>
            <span>{t("patient.records.secureVault")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}