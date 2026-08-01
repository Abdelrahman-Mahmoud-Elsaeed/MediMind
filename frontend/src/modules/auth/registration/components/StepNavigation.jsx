import React from "react";
import Link from "next/link";
import { useRTL } from "../hooks/useRTL";
import { AppButton } from "@/shared/components/ui/AppButton";
export function StepNavigation({ currentStep, onBack, isFormValid, loading = false }) {
    const { t } = useRTL();
    return (<>
      <div className="flex gap-3 pt-4">
        {currentStep > 1 && (<AppButton type="button" variant="outline" onClick={onBack} disabled={loading} size="lg" className="w-1/3 h-[58px] rounded-full text-base" leftIcon={<span className="material-symbols-outlined text-[20px] rtl:rotate-180">arrow_back</span>}>
            {t("auth.register.back")}
          </AppButton>)}

        <AppButton type="submit" variant="default" size="lg" disabled={!isFormValid || loading} isLoading={loading} className="flex-1 h-[58px] rounded-full text-base md:text-lg group" rightIcon={!loading && (<span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
                arrow_forward
              </span>)}>
          {loading
            ? t("auth.register.completingButton") || "..."
            : currentStep === 3
                ? t("auth.register.completeButton")
                : t("auth.register.continueButton")}
        </AppButton>
      </div>

      {currentStep === 1 && (<p className="text-center font-['Inter'] text-base text-on-surface-variant pt-2">
          {t("auth.register.hasAccount")}{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            {t("auth.register.signInLink")}
          </Link>
        </p>)}
    </>);
}
