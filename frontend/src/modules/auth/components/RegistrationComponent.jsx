'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getCountries, getCountryCallingCode } from "react-phone-number-input/input";

import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "@/shared/lib/i18nContext";
import { parseApiMessage } from "@/shared/lib/parseApiMessage";
import BrandingSidebar from "./BrandingSidebar";
import AuthHeader from "./AuthHeader";
import RegistrationStepFields from "./RegistrationStepFields";

export default function RegistrationComponent() {
  const { error, registrationData, setRegistrationData, resetError } = useAuth();
  const { locale, dir, isRtl, t } = useTranslation();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  // Form State matching Schema requirements
  const [formData, setFormData] = useState({
    // Step 1
    loginInput: "",
    password: "",
    role: "patient", // "patient" | "caregiver"

    // Step 2
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    relation: "other", // Caregiver only
    patientCode: "", // Caregiver linking ID
    dateOfBirth: "", // Patient only
    gender: "male", // Patient only
    bloodType: "A+", // Patient only

    // Step 3
    height: "", // Patient
    weight: "", // Patient
    allergies: "", // Patient
    medicalHistory: "", // Patient
    emergencyContactName: "", // Patient
    emergencyContactPhone: "", // Patient
    whatsappOptIn: false,
    alertSettings: {
      instantMissed: true,
      weeklyReport: true,
      monthlyReport: false,
    }, // Caregiver
  });

  const [errors, setErrors] = useState({});

  // Phone Picker State
  const [country, setCountry] = useState("EG");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const dropdownRef = useRef(null);
  const listRef = useRef(null);
  const triggerRef = useRef(null);
  const typeaheadRef = useRef("");
  const typeaheadTimeoutRef = useRef(null);

  const countries = getCountries();

  // Contact Type Detector
  const isPhoneInput = /^[0-9+\s()-]+$/.test(formData.loginInput.trim());

  // Auto Detect Country Code from typed inputs
  useEffect(() => {
    const targetPhone = isPhoneInput ? formData.loginInput : formData.phone;
    if (!targetPhone) return;

    const cleanDigits = targetPhone.replace(/\D/g, "");
    if (!cleanDigits) return;

    const sortedCountries = [...countries].sort(
      (a, b) => getCountryCallingCode(b).length - getCountryCallingCode(a).length
    );

    const matchedCountry = sortedCountries.find((c) =>
      cleanDigits.startsWith(getCountryCallingCode(c))
    );

    if (matchedCountry && matchedCountry !== country) {
      setCountry(matchedCountry);
    }
  }, [formData.loginInput, formData.phone, isPhoneInput, country, countries]);

  // Country Picker Accessibility
  const openDropdown = () => {
    const selectedIdx = countries.findIndex((c) => c === country);
    setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    setIsDropdownOpen(true);
  };

  useEffect(() => {
    if (isDropdownOpen && listRef.current) listRef.current.focus();
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isDropdownOpen && listRef.current) {
      const activeOption = listRef.current.children[highlightedIndex];
      activeOption?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownKeyDown = (e) => {
    if (!isDropdownOpen) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const keyLower = e.key.toLowerCase();
      if (typeaheadTimeoutRef.current) clearTimeout(typeaheadTimeoutRef.current);

      const isRepeatedChar =
        typeaheadRef.current.length === 1 && typeaheadRef.current === keyLower;

      if (isRepeatedChar) {
        const nextIndex = countries.findIndex(
          (c, idx) => idx > highlightedIndex && c.toLowerCase().startsWith(keyLower)
        );
        if (nextIndex !== -1) setHighlightedIndex(nextIndex);
        else {
          const firstIdx = countries.findIndex((c) => c.toLowerCase().startsWith(keyLower));
          if (firstIdx !== -1) setHighlightedIndex(firstIdx);
        }
      } else {
        typeaheadRef.current += keyLower;
        const matchIdx = countries.findIndex((c) =>
          c.toLowerCase().startsWith(typeaheadRef.current)
        );
        if (matchIdx !== -1) setHighlightedIndex(matchIdx);
      }

      typeaheadTimeoutRef.current = setTimeout(() => {
        typeaheadRef.current = "";
      }, 500);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % countries.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + countries.length) % countries.length);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        setCountry(countries[highlightedIndex]);
        setIsDropdownOpen(false);
        triggerRef.current?.focus();
        break;
      case "Escape":
      case "Tab":
        setIsDropdownOpen(false);
        triggerRef.current?.focus();
        break;
      default:
        break;
    }
  };

  // Field change handler
  const handleChange = (e) => {
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

    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  // Validations per step
  const validateStep = (step) => {
    let valid = true;
    const newErrors = {};

    if (step === 1) {
      if (!formData.loginInput.trim()) {
        newErrors.loginInput = t("auth.validation.emailOrPhoneRequired");
        valid = false;
      }
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = t("auth.validation.passwordMin");
        valid = false;
      }
    }

    if (step === 2) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = t("auth.validation.firstNameRequired");
        valid = false;
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = t("auth.validation.lastNameRequired");
        valid = false;
      }

      if (isPhoneInput && !formData.email.trim()) {
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = t("auth.validation.invalidEmail");
          valid = false;
        }
      }

      if (!isPhoneInput && (!formData.phone || formData.phone.trim().length < 6)) {
        newErrors.phone = t("auth.validation.phoneRequired");
        valid = false;
      }

      if (formData.role === "caregiver") {
        if (!formData.relation) {
          newErrors.relation = t("auth.validation.relationshipRequired");
          valid = false;
        }
        if (!formData.patientCode.trim()) {
          newErrors.patientCode = t("auth.validation.patientCodeRequired");
          valid = false;
        }
      } else {
        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = t("auth.validation.dobRequired");
          valid = false;
        }
      }
    }

    if (step === 3 && formData.role === "patient") {
      if (!formData.emergencyContactName.trim()) {
        newErrors.emergencyContactName = t("auth.validation.contactNameRequired");
        valid = false;
      }
      if (!formData.emergencyContactPhone.trim()) {
        newErrors.emergencyContactPhone = t("auth.validation.contactPhoneRequired");
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  // Actions
  const handleNext = (e) => {
    e.preventDefault();
    resetError();

    if (!validateStep(currentStep)) return;

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    resetError();
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleFinalSubmit = () => {
    const basePayload = {
      ...registrationData,
      email: isPhoneInput ? formData.email : formData.loginInput,
      phone: isPhoneInput ? formData.loginInput : formData.phone,
      password: formData.password,
      role: formData.role,
    };

    let payload = {};

    if (formData.role === "caregiver") {
      payload = {
        ...basePayload,
        firstName: formData.firstName,
        lastName: formData.lastName,
        relation: formData.relation,
        patientCode: formData.patientCode,
        whatsappOptIn: formData.whatsappOptIn,
        preferredLanguage: locale || "ar",
        alertSettings: formData.alertSettings,
      };
    } else {
      const allergiesArray = formData.allergies
        ? formData.allergies.split(",").map((item) => item.trim()).filter(Boolean)
        : [];

      payload = {
        ...basePayload,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
        gender: formData.gender,
        bloodType: formData.bloodType,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        allergies: allergiesArray,
        medicalHistory: formData.medicalHistory,
        emergencyContact: [
          {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
          },
        ],
        whatsappOptIn: formData.whatsappOptIn,
        preferredLanguage: locale || "ar",
      };
    }

    setRegistrationData(payload);
    console.log("Submitting Payload:", payload);
  };

  const displayError = parseApiMessage(error, locale, t);

  return (
    <div
      dir={dir}
      className="bg-background text-on-surface min-h-screen grid grid-cols-1 lg:grid-cols-2 antialiased overflow-hidden selection:bg-primary-container selection:text-on-primary-container"
    >
      <div className="flex flex-col h-full overflow-y-auto px-6 lg:px-12 py-8 bg-surface-container-lowest">
        <AuthHeader />

        <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
          {/* Header */}
          <div className="mb-8 md:mb-10 text-center">
            <h1 className="font-['Manrope'] font-extrabold text-[32px] md:text-[40px] leading-[40px] md:leading-[48px] tracking-[-0.02em] text-on-surface mb-2">
              {currentStep === 1 && t("auth.register.step1Title")}
              {currentStep === 2 &&
                (formData.role === "caregiver"
                  ? t("auth.register.caregiverDetailsTitle")
                  : t("auth.register.step2Title"))}
              {currentStep === 3 &&
                (formData.role === "caregiver"
                  ? t("auth.register.caregiverSettingsTitle")
                  : t("auth.register.healthDetailsTitle"))}
            </h1>
            <p className="font-['Inter'] text-base md:text-lg text-on-surface-variant font-medium">
              {t("auth.register.stepLabel")?.replace("{{current}}", String(currentStep))}
            </p>
          </div>

          {/* Stepper Progress Bar (Fixed Line Layout) */}
          <div className="flex items-center justify-between mb-8 md:mb-10 relative">
            <div className="absolute top-4 left-12 right-12 h-[2px] bg-surface-variant -translate-y-1/2" />
            <div
              className={`absolute top-4 ${isRtl ? "right-12" : "left-12"} h-[2px] bg-primary -translate-y-1/2 transition-all duration-300`}
              style={{
                width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
              }}
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
                    {stepNum === 1 && t("auth.register.step1Label")}
                    {stepNum === 2 && t("auth.register.step2Label")}
                    {stepNum === 3 && t("auth.register.step3Label")}
                  </span>
                </div>
              );
            })}
          </div>

          {displayError && (
            <div className="w-full bg-error-container text-on-error-container p-3.5 rounded-2xl mb-6 text-center font-medium text-sm shadow-xs">
              {displayError}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleNext}>
            <RegistrationStepFields
              currentStep={currentStep}
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              errors={errors}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              isPhoneInput={isPhoneInput}
              country={country}
              setCountry={setCountry}
              countries={countries}
              isDropdownOpen={isDropdownOpen}
              setIsDropdownOpen={setIsDropdownOpen}
              openDropdown={openDropdown}
              highlightedIndex={highlightedIndex}
              setHighlightedIndex={setHighlightedIndex}
              dropdownRef={dropdownRef}
              listRef={listRef}
              triggerRef={triggerRef}
              handleDropdownKeyDown={handleDropdownKeyDown}
              isRtl={isRtl}
              t={t}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-1/3 h-[58px] bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-semibold text-base rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[20px] rtl:rotate-180">arrow_back</span>
                  <span>{t("auth.register.back")}</span>
                </button>
              )}

              <button
                type="submit"
                className="flex-1 h-[58px] bg-primary text-on-primary rounded-full font-semibold text-base md:text-lg hover:bg-primary/90 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md group"
              >
                <span>
                  {currentStep === 3
                    ? t("auth.register.completeButton")
                    : t("auth.register.continueButton")}
                </span>
                <span className={`material-symbols-outlined text-[20px] transition-transform ${isRtl ? "-rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}>
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
          </form>
        </div>

        <footer className="mt-auto pt-6 flex items-center justify-center gap-2 text-xs md:text-sm font-medium text-on-surface-variant font-['JetBrains_Mono'] pb-8 select-none">
          <span className="material-symbols-outlined text-[18px]">lock</span>
          <span>{t("auth.register.secureEncryption")}</span>
        </footer>
      </div>

      <BrandingSidebar />
    </div>
  );
}