import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { useRTL } from "./useRTL";
import { validateStep } from "../utils/validation";
import { detectPhoneInput, formatRegistrationPayload } from "../utils/helpers";
import { parseApiMessage } from "@/shared/lib/parseApiMessage";

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

  const isPhoneInput = useMemo(
    () => detectPhoneInput(formData.loginInput),
    [formData.loginInput]
  );

  // Run validation dynamically on data changes
  const runValidation = useCallback(() => {
    const { errors: validationErrors } = validateStep(
      currentStep,
      formData,
      isPhoneInput,
      t
    );
    setErrors(validationErrors);
  }, [currentStep, formData, isPhoneInput, t]);

  useEffect(() => {
    runValidation();
  }, [formData, runValidation]);

  const handleChange = useCallback((e) => {
    const { id, value, type, checked } = e.target;

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

  const handleBlur = useCallback((e) => {
    const { id } = e.target;
    setTouchedFields((prev) => ({ ...prev, [id]: true }));
  }, []);

  const handleRoleSelect = useCallback((selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  }, []);

  const handleFinalSubmit = useCallback(async (callingCode) => {
    const payload = formatRegistrationPayload(formData, registrationData, isPhoneInput, locale, callingCode);
    setRegistrationData(payload);
    try {
      const resultAction = await register(payload);
      if (resultAction.payload && !resultAction.error) {
        const user = resultAction.payload.user || resultAction.payload;
        const role = user?.role || payload.role;
        if (String(role).toUpperCase() === "PATIENT") {
          router.push("/home");
        } else {
          router.push("/dashboard");
        }
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
    const { valid } = validateStep(currentStep, formData, isPhoneInput, t);
    return valid;
  }, [currentStep, formData, isPhoneInput, t]);

  const displayError = useMemo(
    () => parseApiMessage(error, locale, t),
    [error, locale, t]
  );

  return {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
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
    isRtl,
    dir,
    t,
  };
}
