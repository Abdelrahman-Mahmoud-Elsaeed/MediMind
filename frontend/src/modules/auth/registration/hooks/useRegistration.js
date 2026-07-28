import { useState, useCallback, useMemo, useEffect, useRef } from "react";
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
  const { error, loading, registrationData, setRegistrationData, resetError, clearRegistrationData, register } = useAuth();
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

  // touchedFields: tracks fields the user has explicitly interacted with OR that were autofilled
  const [touchedFields, setTouchedFields] = useState({});
  // validationErrors: full set of errors from last validateStep run (used to check form validity)
  const [validationErrors, setValidationErrors] = useState({});
  // asyncErrors: uniqueness errors from backend
  const [asyncErrors, setAsyncErrors] = useState({});

  // Reset all auth errors, registration data, and form states on mount & unmount
  useEffect(() => {
    resetError();
    if (typeof clearRegistrationData === "function") {
      clearRegistrationData();
    }
    setTouchedFields({});
    setValidationErrors({});
    setAsyncErrors({});
    return () => {
      resetError();
      if (typeof clearRegistrationData === "function") {
        clearRegistrationData();
      }
    };
  }, [resetError, clearRegistrationData]);

  const isPhoneInput = useMemo(
    () => detectPhoneInput(formData.loginInput),
    [formData.loginInput]
  );

  const countrySelectorProps = useCountrySelector(
    isPhoneInput ? formData.loginInput : formData.phone
  );

  const callingCode = countrySelectorProps?.callingCode || "20";

  // Keep a ref to formData for use inside interval/event handlers without stale closures
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  // ─── Autofill Sync ──────────────────────────────────────────────────────────
  // Detect browser autofill by polling the DOM and via webkit animationstart events.
  // Only update fields that were silently populated (i.e. value differs from React state).
  // Mark those fields as touched so their errors become visible.
  useEffect(() => {
    let isMounted = true;

    const syncAutofill = () => {
      if (typeof document === "undefined" || !isMounted) return;
      const formEl = document.querySelector("form");
      if (!formEl) return;

      const inputs = formEl.querySelectorAll("input, select");
      const updates = {};
      const newTouched = {};

      inputs.forEach((el) => {
        const input = el;
        if (!input.id) return;
        const domVal = input.value;
        const stateVal = formDataRef.current[input.id];
        // Only treat as autofill if DOM has a value but React state is empty/different
        if (domVal && domVal !== stateVal) {
          updates[input.id] = domVal;
          newTouched[input.id] = true;
        }
      });

      if (Object.keys(updates).length > 0) {
        setFormData((prev) => ({ ...prev, ...updates }));
        setTouchedFields((prev) => ({ ...prev, ...newTouched }));
      }
    };

    const timer = setInterval(syncAutofill, 400);

    const handleAnimationStart = (e) => {
      if (e.animationName?.includes("autofill") || e.animationName?.includes("AutoFill")) {
        syncAutofill();
      }
    };
    document.addEventListener("animationstart", handleAnimationStart, true);

    return () => {
      isMounted = false;
      clearInterval(timer);
      document.removeEventListener("animationstart", handleAnimationStart, true);
    };
  }, []); // run once per mount — formDataRef keeps it current

  // ─── Validation ─────────────────────────────────────────────────────────────
  // Always run full validation to keep validationErrors up to date (used for isFormValid).
  // This does NOT drive visible error display — that is gated by touchedFields.
  useEffect(() => {
    const { errors: errs } = validateStep(
      currentStep,
      formData,
      isPhoneInput,
      t,
      countrySelectorProps.country
    );
    setValidationErrors(errs);
  }, [formData, currentStep, isPhoneInput, t, countrySelectorProps.country]);

  // ─── Async Uniqueness Check ──────────────────────────────────────────────────
  // Runs whenever loginInput / email / phone change. Debounced 500ms.
  // Only fires when the field is non-empty AND locally valid.
  useEffect(() => {
    const fieldsToCheck = [
      { id: "loginInput", val: formData.loginInput },
      { id: "email", val: formData.email },
      { id: "phone", val: formData.phone },
    ];

    const timer = setTimeout(() => {
      fieldsToCheck.forEach(async ({ id, val }) => {
        const trimmed = val ? val.trim() : "";

        if (!trimmed) {
          setAsyncErrors((prev) => ({ ...prev, [id]: "" }));
          return;
        }

        // Skip backend check if local format is already invalid
        const { errors: localErrs } = validateStep(
          currentStep,
          formData,
          isPhoneInput,
          t,
          countrySelectorProps.country
        );
        if (localErrs[id]) {
          setAsyncErrors((prev) => ({ ...prev, [id]: "" }));
          return;
        }

        try {
          let queryParam = "";
          if (id === "loginInput") {
            const isPhone = /^[0-9+\s()-]+$/.test(trimmed);
            if (isPhone) {
              const nationalNum = extractNationalNumber(trimmed, callingCode);
              const formatted = nationalNum ? `${nationalNum.code}${nationalNum.number}` : trimmed;
              queryParam = `phone=${encodeURIComponent(formatted)}`;
            } else {
              queryParam = `email=${encodeURIComponent(trimmed)}`;
            }
          } else if (id === "email") {
            queryParam = `email=${encodeURIComponent(trimmed)}`;
          } else if (id === "phone") {
            const nationalNum = extractNationalNumber(trimmed, callingCode);
            const formatted = nationalNum ? `${nationalNum.code}${nationalNum.number}` : trimmed;
            queryParam = `phone=${encodeURIComponent(formatted)}`;
          }

          if (!queryParam) return;

          const response = await apiClient.get(`/auth/validate-uniqueness?${queryParam}`);
          if (response.data?.success && response.data?.data) {
            const { isUnique } = response.data.data;
            if (!isUnique) {
              const isEmailErr = id === "email" || (!isPhoneInput && id === "loginInput");
              const msg = isEmailErr
                ? t("auth.error.EMAIL_EXISTS") || "This email address is already registered."
                : t("auth.error.PHONE_EXISTS") || "This phone number is already registered.";
              setAsyncErrors((prev) => ({ ...prev, [id]: msg }));
              // Mark field as touched so the error is displayed immediately
              setTouchedFields((prev) => ({ ...prev, [id]: true }));
            } else {
              setAsyncErrors((prev) => ({ ...prev, [id]: "" }));
            }
          }
        } catch (err) {
          console.error("Uniqueness check error:", err);
        }
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.loginInput, formData.email, formData.phone, currentStep, isPhoneInput, t, countrySelectorProps.country, callingCode]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleChange = useCallback((e) => {
    const { id, value, type, checked } = e.target;

    // Clear async uniqueness error while editing
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
    // Do NOT mark as touched here — that happens on blur only
  }, []);

  const handleBlur = useCallback((e) => {
    const { id } = e.target;
    setTouchedFields((prev) => ({ ...prev, [id]: true }));
  }, []);

  const handleRoleSelect = useCallback((selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  }, []);

  const handleFinalSubmit = useCallback(async (code) => {
    const payload = formatRegistrationPayload(formData, registrationData, isPhoneInput, locale, code);
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
    (e, code) => {
      e?.preventDefault();
      resetError();

      const { valid, errors: errs } = validateStep(
        currentStep,
        formData,
        isPhoneInput,
        t,
        countrySelectorProps.country
      );

      if (!valid) {
        // On submit attempt, reveal all errors by marking all errored fields as touched
        const allTouched = {};
        Object.keys(errs).forEach((key) => { allTouched[key] = true; });
        setTouchedFields((prev) => ({ ...prev, ...allTouched }));
        setValidationErrors(errs);
        return;
      }

      setValidationErrors({});
      setTouchedFields({});

      if (currentStep < 3) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleFinalSubmit(code);
      }
    },
    [currentStep, formData, isPhoneInput, resetError, t, countrySelectorProps.country, handleFinalSubmit]
  );

  const handleBack = useCallback(() => {
    resetError();
    setValidationErrors({});
    setTouchedFields({});
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep, resetError]);

  // ─── Derived State ───────────────────────────────────────────────────────────

  // Form is valid for submit button purposes (not gated by touched)
  const isFormValid = useMemo(() => {
    const { valid } = validateStep(currentStep, formData, isPhoneInput, t, countrySelectorProps.country);
    const hasAsyncErrors = Object.values(asyncErrors).some(Boolean);
    return valid && !hasAsyncErrors;
  }, [currentStep, formData, isPhoneInput, t, asyncErrors, countrySelectorProps.country]);

  const displayError = useMemo(
    () => parseApiMessage(error, locale, t),
    [error, locale, t]
  );

  // visibleErrors: errors that should actually be shown in the UI.
  // A field's error is visible only if it has been touched (blurred / autofilled / submit attempted).
  const visibleErrors = useMemo(() => {
    const merged = {};

    // Merge local validation errors
    Object.keys(validationErrors).forEach((key) => {
      if (touchedFields[key] && validationErrors[key]) {
        merged[key] = validationErrors[key];
      }
    });

    // Async uniqueness errors always show once set (they already set touched)
    Object.keys(asyncErrors).forEach((key) => {
      if (asyncErrors[key]) {
        merged[key] = asyncErrors[key];
      }
    });

    return merged;
  }, [validationErrors, asyncErrors, touchedFields]);

  return {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    errors: visibleErrors,
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
