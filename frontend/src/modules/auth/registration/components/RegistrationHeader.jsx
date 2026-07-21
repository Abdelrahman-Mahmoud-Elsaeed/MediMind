import React from "react";
import AuthHeader from "../../components/AuthHeader";
import { useRTL } from "../hooks/useRTL";

export function RegistrationHeader({ currentStep, role }) {
  const { t } = useRTL();

  const getStepTitle = () => {
    if (currentStep === 1) return t("auth.register.step1Title");
    if (currentStep === 2) {
      return role === "caregiver"
        ? t("auth.register.caregiverDetailsTitle")
        : t("auth.register.step2Title");
    }
    if (currentStep === 3) {
      return role === "caregiver"
        ? t("auth.register.caregiverSettingsTitle")
        : t("auth.register.healthDetailsTitle");
    }
    return "";
  };

  return (
    <>
      <AuthHeader />
      <div className="mb-8 md:mb-10 text-center">
        <h1 className="font-['Manrope'] font-extrabold text-[32px] md:text-[40px] leading-[40px] md:leading-[48px] tracking-[-0.02em] text-on-surface mb-2">
          {getStepTitle()}
        </h1>
        <p className="font-['Inter'] text-base md:text-lg text-on-surface-variant font-medium">
          {t("auth.register.stepLabel")?.replace("{{current}}", String(currentStep))}
        </p>
      </div>
    </>
  );
}
