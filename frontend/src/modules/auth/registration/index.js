'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import BrandingSidebar from "../components/BrandingSidebar";
import {
  RegistrationHeader,
  RegistrationFooter,
  RegistrationStepIndicator,
  RegistrationFieldsRenderer,
  StepNavigation,
} from "./components";
import { useRegistration } from "./hooks/useRegistration";
import { usePasswordVisibility } from "./hooks/usePasswordVisibility";
import { useCountrySelector } from "./hooks/useCountrySelector";
import { getCountryCallingCode, flags } from "./constants/countries";
import { useAuth } from "../hooks/useAuth";

export default function RegistrationContainer() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const {
    currentStep,
    formData,
    errors,
    touchedFields,
    isPhoneInput,
    displayError,
    loading,
    isFormValid,
    handleChange,
    handleBlur,
    handleRoleSelect,
    handleNext,
    handleBack,
    dir,
  } = useRegistration();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const role = user?.role ? String(user.role).toUpperCase() : "PATIENT";
      router.replace(role === "PATIENT" ? "/home" : "/dashboard");
    }
  }, [isAuthenticated, loading, user, router]);

  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();

  const countrySelectorProps = useCountrySelector(
    isPhoneInput ? formData.loginInput : formData.phone
  );

  if (!loading && isAuthenticated) {
    return null;
  }

  return (
    <div
      dir={dir}
      className="bg-background text-on-surface min-h-screen grid grid-cols-1 lg:grid-cols-2 antialiased overflow-hidden selection:bg-primary-container selection:text-on-primary-container"
    >
      <div className="flex flex-col h-full overflow-y-auto px-6 lg:px-12 py-8 bg-surface-container-lowest">
        <RegistrationHeader currentStep={currentStep} role={formData.role} />

        <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
          <RegistrationStepIndicator currentStep={currentStep} />

          {displayError && (
            <div className="w-full bg-error-container text-on-error-container p-3.5 rounded-2xl mb-6 text-center font-medium text-sm shadow-xs">
              {displayError}
            </div>
          )}

          <form className="space-y-6" onSubmit={(e) => handleNext(e, countrySelectorProps.callingCode)}>
            <RegistrationFieldsRenderer
              currentStep={currentStep}
              formData={formData}
              handleChange={handleChange}
              handleBlur={handleBlur}
              handleRoleSelect={handleRoleSelect}
              errors={errors}
              touchedFields={touchedFields}
              showPassword={showPassword}
              onTogglePassword={togglePasswordVisibility}
              isPhoneInput={isPhoneInput}
              countrySelectorProps={{
                ...countrySelectorProps,
                getCountryCallingCode,
                flags,
              }}
            />

            <StepNavigation
              currentStep={currentStep}
              onBack={handleBack}
              isFormValid={isFormValid}
              loading={loading}
            />
          </form>
        </div>

        <RegistrationFooter />
      </div>

      <BrandingSidebar />
    </div>
  );
}

export * from "./components";
export * from "./hooks";
export * from "./utils";
export * from "./constants";
