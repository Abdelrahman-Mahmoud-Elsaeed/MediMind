import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { useRTL } from "./useRTL";
import { validateStep } from "../utils/validation";
import { detectPhoneInput, formatRegistrationPayload, extractNationalNumber } from "../utils/helpers";
import { parseApiMessage } from "@/shared/lib/parseApiMessage";
import apiClient from "@/shared/lib/apiClient";
import { useCountrySelector } from "./useCountrySelector";

export function useRegistration() {
  const router = useRouter();
  const { error, loading, registrationData, setRegistrationData, resetError, register } = useAuth();
  const { locale, isRtl, dir, t } = useRTL();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    loginInput: "",
    password: "",
    role: "patient",

    // Step 2
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    relation: "other",
    patientCode: "",
    dateOfBirth: "",
    gender: "male",
    bloodType: "A+",

    // Step 3
    height: "",
    weight: "",
    allergies: "",
    medicalHistory: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    whatsappOptIn: false,
    alertSettings: {
      instantMissed: true,
      weeklyReport: true,
      monthlyReport: false,
    },
  });

  const [touchedFields, setTouchedFields] = useState({});
  const [errors, setErrors] = useState({});
  const [asyncErrors, setAsyncErrors] = useState({});

  const isPhoneInput = useMemo(
    () => detectPhoneInput(formData.loginInput),
    [formData.loginInput]
  );

  const countrySelectorProps = useCountrySelector(
    isPhoneInput ? formData.loginInput : formData.phone
  );

  // Run validation dynamically on data changes
  const runValidation = useCallback(() => {
    const { errors: validationErrors } = validateStep(
      currentStep,
      formData,
      isPhoneInput,
      t,
      countrySelectorProps.country
    );
    setErrors(validationErrors);
  }, [currentStep, formData, isPhoneInput, t, countrySelectorProps.country]);

  useEffect(() => {
    runValidation();
  }, [formData, runValidation]);

  const handleChange = useCallback((e) => {
    const { id, value, type, checked } = e.target;

    // Clear async errors as soon as user types/modifies the field
    setAsyncErrors((prev) => ({ ...prev, [id]: "" }));

    if (id.startsWith("alertSettings.")) {
      const settingKey = id.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        alertSettings: { ...prev.alertSettings, [settingKey]: checked },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: type === "checkbox" ? checked : value,
      }));
    }
  }, []);

  const handleBlur = useCallback(async (e, callingCode = "20") => {
    const { id, value } = e.target;
    setTouchedFields((prev) => ({ ...prev, [id]: true }));

    const trimmedVal = value ? value.trim() : "";
    if (!trimmedVal) return;

    if (id === "loginInput" || id === "email" || id === "phone") {
      // First check if the field has local validation errors
      const { errors: localErrors } = validateStep(currentStep, { ...formData, [id]: value }, isPhoneInput, t);
      if (localErrors[id]) {
        return; // Don't check backend if local format validation fails
      }

      try {
        let queryParam = "";
        if (id === "loginInput") {
          const isPhone = /^[0-9+\s()-]+$/.test(trimmedVal);
          if (isPhone) {
            const nationalNum = extractNationalNumber(trimmedVal, callingCode);
            const formattedPhone = nationalNum ? `${nationalNum.code}${nationalNum.number}` : trimmedVal;
            queryParam = `phone=${encodeURIComponent(formattedPhone)}`;
          } else {
            queryParam = `email=${encodeURIComponent(trimmedVal)}`;
          }
        } else if (id === "email") {
          queryParam = `email=${encodeURIComponent(trimmedVal)}`;
        } else if (id === "phone") {
          const nationalNum = extractNationalNumber(trimmedVal, callingCode);
          const formattedPhone = nationalNum ? `${nationalNum.code}${nationalNum.number}` : trimmedVal;
          queryParam = `phone=${encodeURIComponent(formattedPhone)}`;
        }

        const response = await apiClient.get(`/auth/validate-uniqueness?${queryParam}`);
        if (response.data && response.data.success && response.data.data) {
          const { isUnique } = response.data.data;
          if (!isUnique) {
            setAsyncErrors((prev) => ({
              ...prev,
              [id]: id === "email" || (!isPhoneInput && id === "loginInput")
                ? t("auth.error.EMAIL_EXISTS") || "Email is already registered"
                : t("auth.error.PHONE_EXISTS") || "Phone number is already registered"
            }));
          } else {
            setAsyncErrors((prev) => ({ ...prev, [id]: "" }));
          }
        }
      } catch (err) {
        console.error("Error validating uniqueness:", err);
      }
    }
  }, [currentStep, formData, isPhoneInput, t]);

  const handleRoleSelect = useCallback((selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  }, []);

  const handleFinalSubmit = useCallback(async (callingCode) => {
    const payload = formatRegistrationPayload(formData, registrationData, isPhoneInput, locale, callingCode);
    setRegistrationData(payload);
    try {
      const resultAction = await register(payload);
      if (resultAction.payload && !resultAction.error) {
        router.push("/verify");
      }
    } catch (err) {
      console.error("API registration error:", err);
    }
  }, [formData, registrationData, isPhoneInput, locale, setRegistrationData, register, router]);

  const handleNext = useCallback(
    (e, callingCode) => {
      e?.preventDefault();
      resetError();

      const { valid, errors: validationErrors } = validateStep(
        currentStep,
        formData,
        isPhoneInput,
        t
      );

      if (!valid) {
        const allTouched = {};
        Object.keys(validationErrors).forEach((key) => {
          allTouched[key] = true;
        });
        setTouchedFields(allTouched);
        setErrors(validationErrors);
        return;
      }

      setErrors({});
      setTouchedFields({});

      if (currentStep < 3) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleFinalSubmit(callingCode);
      }
    },
    [currentStep, formData, isPhoneInput, resetError, t, handleFinalSubmit]
  );

  const handleBack = useCallback(() => {
    resetError();
    setErrors({});
    setTouchedFields({});
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep, resetError]);

  const isFormValid = useMemo(() => {
    const { valid } = validateStep(currentStep, formData, isPhoneInput, t, countrySelectorProps.country);
    const hasAsyncErrors = Object.values(asyncErrors).some((err) => !!err);
    return valid && !hasAsyncErrors;
  }, [currentStep, formData, isPhoneInput, t, asyncErrors, countrySelectorProps.country]);

  const displayError = useMemo(
    () => parseApiMessage(error, locale, t),
    [error, locale, t]
  );

  const allErrors = useMemo(() => {
    const merged = { ...errors };
    Object.keys(asyncErrors).forEach((key) => {
      if (asyncErrors[key]) {
        merged[key] = asyncErrors[key];
      }
    });
    return merged;
  }, [errors, asyncErrors]);

  return {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    errors: allErrors,
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
    isRtl,
    dir,
    t,
    countrySelectorProps,
  };
}
