import React from "react";
import Link from "next/link";
import { useRTL } from "../hooks/useRTL";

export function StepNavigation({ currentStep, onBack, isFormValid, loading }) {
  const { isRtl, t } = useRTL();

  return (
    <>
      <div className="flex gap-3 pt-4">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="w-1/3 h-[58px] bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-semibold text-base rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px] rtl:rotate-180">arrow_back</span>
            <span>{t("auth.register.back")}</span>
          </button>
        )}

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className="flex-1 h-[58px] bg-primary text-on-primary rounded-full font-semibold text-base md:text-lg hover:bg-primary/90 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md group focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>
            {loading
              ? t("auth.register.completingButton") || "..."
              : currentStep === 3
                ? t("auth.register.completeButton")
                : t("auth.register.continueButton")}
          </span>
          <span
            className={`material-symbols-outlined text-[20px] transition-transform ${
              isRtl ? "-rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"
            }`}
          >
            arrow_forward
          </span>
        </button>
      </div>

      {currentStep === 1 && (
        <p className="text-center font-['Inter'] text-base text-on-surface-variant pt-2">
          {t("auth.register.hasAccount")}{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            {t("auth.register.signInLink")}
          </Link>
        </p>
      )}
    </>
  );
}
