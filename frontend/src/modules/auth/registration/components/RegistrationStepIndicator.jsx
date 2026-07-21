import React from "react";
import { useRTL } from "../hooks/useRTL";

export function RegistrationStepIndicator({ currentStep }) {
  const { isRtl, t } = useRTL();

  const getStepLabel = (stepNum) => {
    if (stepNum === 1) return t("auth.register.step1Label") || "Account";
    if (stepNum === 2) return t("auth.register.step2Label") || "Profile";
    if (stepNum === 3) return t("auth.register.step3Label") || "Medical";
    return "";
  };

  const progressWidth = currentStep === 1 ? "0%" : currentStep === 2 ? "33.33%" : "66.66%";

  return (
    <div className="flex items-center justify-between mb-8 md:mb-10 relative" aria-label="Registration Progress">
      {/* Background connector line connecting circle centers (16.66% to 83.33%) */}
      <div className="absolute top-4 left-[16.66%] right-[16.66%] h-[2px] bg-surface-variant -translate-y-1/2" />

      {/* Active progress connector line with explicit left-auto/right-auto to avoid CSS conflicts */}
      <div
        className={`absolute top-4 ${
          isRtl ? "right-[16.66%] left-auto" : "left-[16.66%] right-auto"
        } h-[2px] bg-primary -translate-y-1/2 transition-all duration-300`}
        style={{ width: progressWidth }}
      />

      {[1, 2, 3].map((stepNum) => {
        const isCompleted = currentStep > stepNum;
        const isActive = currentStep === stepNum;

        return (
          <div key={stepNum} className="flex flex-col items-center flex-1 relative z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 ring-4 ring-surface-container-lowest transition-all ${
                isCompleted || isActive
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container text-on-surface-variant border border-outline-variant/30"
              }`}
            >
              {isCompleted ? (
                <span className="material-symbols-outlined text-[18px]">check</span>
              ) : (
                stepNum
              )}
            </div>
            <span
              className={`font-['JetBrains_Mono'] text-xs ${
                isActive ? "font-bold text-primary" : "font-semibold text-on-surface-variant"
              }`}
            >
              {getStepLabel(stepNum)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
