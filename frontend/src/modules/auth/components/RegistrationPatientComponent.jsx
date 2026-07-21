'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useTheme } from 'next-themes';
import { registerPatientSchema } from "../validation/authValidation";
import { parseApiMessage } from "@/shared/lib/parseApiMessage";

export default function RegistrationPatientComponent() {
  const router = useRouter();
  const { register, loading, error, registrationData, setRegistrationData, resetError } = useAuth();
  const { locale, dir, t, toggleLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isRtl = locale === 'ar';

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    firstName: registrationData.firstName || "",
    lastName: registrationData.lastName || "",
    phone: registrationData.phone || "",
    dob: registrationData.dob || "",
    bloodType: registrationData.bloodType || "UNKNOWN",
    gender: registrationData.gender || "",
    height: registrationData.height || "",
    weight: registrationData.weight || "",
    whatsappOptIn: registrationData.whatsappOptIn !== undefined ? registrationData.whatsappOptIn : true,
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dob: "",
  });

  const isValid = registerPatientSchema.safeParse(formData).success;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleBlur = (field) => {
    const result = registerPatientSchema.safeParse(formData);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === field);
      if (issue) {
        let msg = "";
        if (field === "firstName") {
          msg = t("auth.validation.firstNameRequired");
        } else if (field === "lastName") {
          msg = t("auth.validation.lastNameRequired");
        } else if (field === "phone") {
          msg = t("auth.validation.phoneRequired");
        }
        setErrors((prev) => ({ ...prev, [field]: msg }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    resetError();
    setErrors({ firstName: "", lastName: "", phone: "", dob: "" });

    const result = registerPatientSchema.safeParse(formData);
    if (!result.success) {
      const newErrors = { firstName: "", lastName: "", phone: "", dob: "" };
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        let msg = "";
        if (field === "firstName") {
          msg = t("auth.validation.firstNameRequired");
        } else if (field === "lastName") {
          msg = t("auth.validation.lastNameRequired");
        } else if (field === "phone") {
          msg = t("auth.validation.phoneRequired");
        }
        newErrors[field] = msg;
      });
      setErrors(newErrors);
      return;
    }

    try {
      const cleanData = {
        email: registrationData.email,
        password: registrationData.password,
        role: "PATIENT",
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        whatsappOptIn: formData.whatsappOptIn,
        preferredLanguage: locale,
      };

      if (formData.dob) {
        cleanData.dateOfBirth = new Date(formData.dob).toISOString();
      }

      if (formData.gender) {
        cleanData.gender = formData.gender;
      }

      if (formData.bloodType && formData.bloodType !== "UNKNOWN") {
        const bloodMapping = {
          A_POSITIVE: "A+",
          A_NEGATIVE: "A-",
          B_POSITIVE: "B+",
          B_NEGATIVE: "B-",
          AB_POSITIVE: "AB+",
          AB_NEGATIVE: "AB-",
          O_POSITIVE: "O+",
          O_NEGATIVE: "O-",
        };
        cleanData.bloodType = bloodMapping[formData.bloodType] || formData.bloodType;
      }

      if (formData.height) {
        cleanData.height = Number(formData.height);
      }

      if (formData.weight) {
        cleanData.weight = Number(formData.weight);
      }

      setRegistrationData(cleanData);

      const resultAction = await register(cleanData);
      if (resultAction.meta.requestStatus === "fulfilled") {
        router.push("/verify-email");
      }
    } catch (err) {
    }
  };

  const displayError = parseApiMessage(error, locale, t);

  return (
    <div
      dir={dir}
      className="bg-background text-on-surface min-h-screen grid grid-cols-1 lg:grid-cols-2 antialiased overflow-hidden selection:bg-primary-container selection:text-on-primary-container"
    >
      {/* Left Side (Form) */}
      <div className="flex flex-col min-h-screen px-6 py-6 md:px-12 md:py-8 justify-between overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center w-full mb-6">
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-on-surface">MedTech Pro</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Language Toggle Pill */}
            <div className="flex items-center gap-1 bg-surface-container border border-outline-variant/30 rounded-full p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => locale !== 'en' && toggleLanguage()}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${locale === 'en' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => locale !== 'ar' && toggleLanguage()}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${locale === 'ar' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                AR
              </button>
            </div>
            
            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">
                {mounted && theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
        </header>

        {/* Form Wrapper */}
        <div className="w-full max-w-[480px] mx-auto my-auto">
          <div className="mb-6 text-center">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1">
              {t("auth.register.step2Title")}
            </h1>
            <p className="text-sm text-on-surface-variant">
              {t("auth.register.stepLabel").replace("{{current}}", "2").replace("2", "3")}: {t("auth.register.profileDetails")} ({t("auth.register.patientRole")})
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute top-4 left-[10%] right-[10%] h-[2px] bg-surface-variant -z-10"></div>
            <div className="flex flex-col items-center flex-1 relative">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm mb-xs ring-4 ring-surface-container-lowest z-10">
                <span className="material-symbols-outlined text-[16px] font-bold">check</span>
              </div>
              <span className="text-xs font-semibold text-primary">{t("auth.register.accountSetup")}</span>
            </div>
            <div className="flex flex-col items-center flex-1 relative">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm mb-xs ring-4 ring-surface-container-lowest z-10">2</div>
              <span className="text-xs font-semibold text-primary">{t("auth.register.profileDetails")}</span>
            </div>
            <div className="flex flex-col items-center flex-1 relative">
              <div className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-bold text-sm mb-xs ring-4 ring-surface-container-lowest z-10">3</div>
              <span className="text-xs font-medium text-on-surface-variant">Medical</span>
            </div>
          </div>

          {displayError && (
            <div className="w-full bg-error-container text-on-error-container p-3 rounded-lg mb-4 text-center font-body-md">
              {displayError}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="firstName">
                  {t("auth.register.firstNameLabel")} <span className="text-error">*</span>
                </label>
                <input
                  className="butterfly-input w-full font-body-md text-body-md text-on-surface placeholder:text-outline-variant transition-all py-3.5 px-4 text-start"
                  id="firstName"
                  placeholder={t("auth.register.firstNamePlaceholder")}
                  required
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={() => handleBlur("firstName")}
                />
                {errors.firstName && (
                  <p className="text-error text-xs mt-1 text-start">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="lastName">
                  {t("auth.register.lastNameLabel")} <span className="text-error">*</span>
                </label>
                <input
                  className="butterfly-input w-full font-body-md text-body-md text-on-surface placeholder:text-outline-variant transition-all py-3.5 px-4 text-start"
                  id="lastName"
                  placeholder={t("auth.register.lastNamePlaceholder")}
                  required
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={() => handleBlur("lastName")}
                />
                {errors.lastName && (
                  <p className="text-error text-xs mt-1 text-start">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Phone & Date of Birth */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="phone">
                  {t("auth.register.phoneLabel")} <span className="text-error">*</span>
                </label>
                <input
                  className="butterfly-input w-full font-body-md text-body-md text-on-surface placeholder:text-outline-variant transition-all py-3.5 px-4 text-start"
                  id="phone"
                  placeholder={t("auth.register.phonePlaceholder")}
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur("phone")}
                />
                {errors.phone && (
                  <p className="text-error text-xs mt-1 text-start">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="dob">
                  {t("auth.register.dobLabel")}
                </label>
                <input
                  className="butterfly-input w-full font-body-md text-body-md text-on-surface placeholder:text-outline-variant transition-all py-3 px-4 text-start"
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Blood Type & Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="bloodType">
                  {t("auth.register.bloodTypeLabel")}
                </label>
                <select
                  className="butterfly-input w-full font-body-md text-body-md text-on-surface py-3.5 px-4 appearance-none cursor-pointer text-start"
                  id="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                >
                  <option value="UNKNOWN">{t("auth.register.bloodTypeSelect")}</option>
                  <option value="A_POSITIVE">A+</option>
                  <option value="A_NEGATIVE">A-</option>
                  <option value="B_POSITIVE">B+</option>
                  <option value="B_NEGATIVE">B-</option>
                  <option value="AB_POSITIVE">AB+</option>
                  <option value="AB_NEGATIVE">AB-</option>
                  <option value="O_POSITIVE">O+</option>
                  <option value="O_NEGATIVE">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="gender">
                  {t("auth.register.genderLabel")}
                </label>
                <select
                  className="butterfly-input w-full font-body-md text-body-md text-on-surface py-3.5 px-4 appearance-none cursor-pointer text-start"
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">{t("auth.register.genderSelect")}</option>
                  <option value="male">{t("auth.register.male")}</option>
                  <option value="female">{t("auth.register.female")}</option>
                </select>
              </div>
            </div>

            {/* Height & Weight */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="height">
                  {t("auth.register.heightLabel")}
                </label>
                <input
                  className="butterfly-input w-full font-body-md text-body-md text-on-surface placeholder:text-outline-variant transition-all py-3.5 px-4 text-start"
                  id="height"
                  type="number"
                  placeholder={t("auth.register.heightPlaceholder")}
                  value={formData.height}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="weight">
                  {t("auth.register.weightLabel")}
                </label>
                <input
                  className="butterfly-input w-full font-body-md text-body-md text-on-surface placeholder:text-outline-variant transition-all py-3.5 px-4 text-start"
                  id="weight"
                  type="number"
                  placeholder={t("auth.register.weightPlaceholder")}
                  value={formData.weight}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* WhatsApp Opt-In */}
            <div className="flex items-center gap-3 pt-2 text-start">
              <input
                id="whatsappOptIn"
                type="checkbox"
                checked={formData.whatsappOptIn}
                onChange={(e) => setFormData((prev) => ({ ...prev, whatsappOptIn: e.target.checked }))}
                className="w-5 h-5 rounded border-outline-variant/60 text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="whatsappOptIn" className="text-xs font-semibold text-on-surface-variant cursor-pointer select-none">
                {t("auth.register.whatsappLabel")}
              </label>
            </div>

            {/* Submit & Back Button Group */}
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                onClick={() => {
                  setRegistrationData({ ...registrationData, ...formData });
                  router.push('/register');
                }}
                className="w-1/3 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-semibold text-sm rounded-full py-4 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px] rtl:rotate-180">arrow_back</span>
                <span>{t("auth.register.back")}</span>
              </button>

              <button
                disabled={!isValid || loading}
                type="submit"
                className="flex-1 bg-primary text-on-primary rounded-full py-4 font-semibold text-sm hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
              >
                <span>{loading ? t("auth.register.completingButton") : t("auth.register.completeButton")}</span>
                {!loading && <span className="material-symbols-outlined ml-xs text-[20px] group-hover:translate-x-1 transition-transform">check_circle</span>}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="w-full flex justify-center items-center gap-1.5 text-xs text-on-surface-variant select-none">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          <span>Secure 256-bit SSL Encryption</span>
        </footer>
      </div>

      {/* Right Side (Visual Panel) */}
      <div className="hidden lg:flex w-full relative bg-butterfly-gradient overflow-hidden flex-col justify-center items-center px-12 py-12 select-none">
        {/* Grid Overlay */}
        <div className="absolute inset-0 dot-grid opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        {/* Butterfly SVG Particles */}
        <svg className="absolute top-1/4 left-1/4 animate-float opacity-50 w-12 h-12" fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12,15.5C10.5,16 9,15 8.5,13.5C8,12 8,10.5 9,9.5C10,8.5 11.5,8.5 12,9.5C12.5,8.5 14,8.5 15,9.5C16,10.5 16,12 15.5,13.5C15,15 13.5,16 12,15.5M12,13.5C12.5,14 13.5,14 14,13C14.5,12 14,11 13.5,10.5C13,10 12.5,10 12,11C11.5,10 11,10 10.5,10.5C10,11 9.5,12 10,13C10.5,14 11.5,14 12,13.5M12,2C17.5,2 22,6.5 22,12C22,17.5 17.5,22 12,22C6.5,22 2,17.5 2,12C2,6.5 6.5,2 12,2Z"></path>
        </svg>
        <svg className="absolute top-1/3 right-1/4 animate-float-delayed opacity-30 w-8 h-8" fill="white" style={{ transform: "rotate(45deg)" }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12,15.5C10.5,16 9,15 8.5,13.5C8,12 8,10.5 9,9.5C10,8.5 11.5,8.5 12,9.5C12.5,8.5 14,8.5 15,9.5C16,10.5 16,12 15.5,13.5C15,15 13.5,16 12,15.5M12,13.5C12.5,14 13.5,14 14,13C14.5,12 14,11 13.5,10.5C13,10 12.5,10 12,11C11.5,10 11,10 10.5,10.5C10,11 9.5,12 10,13C10.5,14 11.5,14 12,13.5M12,2C17.5,2 22,6.5 22,12C22,17.5 17.5,22 12,22C6.5,22 2,17.5 2,12C2,6.5 6.5,2 12,2Z"></path>
        </svg>
        <svg className="absolute bottom-1/4 left-1/3 animate-float opacity-40 w-10 h-10" fill="white" style={{ transform: "rotate(-15deg)" }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12,15.5C10.5,16 9,15 8.5,13.5C8,12 8,10.5 9,9.5C10,8.5 11.5,8.5 12,9.5C12.5,8.5 14,8.5 15,9.5C16,10.5 16,12 15.5,13.5C15,15 13.5,16 12,15.5M12,13.5C12.5,14 13.5,14 14,13C14.5,12 14,11 13.5,10.5C13,10 12.5,10 12,11C11.5,10 11,10 10.5,10.5C10,11 9.5,12 10,13C10.5,14 11.5,14 12,13.5M12,2C17.5,2 22,6.5 22,12C22,17.5 17.5,22 12,22C6.5,22 2,17.5 2,12C2,6.5 6.5,2 12,2Z"></path>
        </svg>

        {/* Content Container */}
        <div className="relative z-10 max-w-lg text-center flex flex-col items-center">
          {/* Main Icon */}
          <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-lg border border-white/30 animate-pulse-slow">
            <span className="material-symbols-outlined text-[64px] text-white">diversity_1</span>
          </div>

          <h2 className="font-headline-lg text-headline-lg text-white mb-2 drop-shadow-md">
            Your Health Journey Begins Here.
          </h2>
          <p className="font-body-lg text-body-lg text-white/90 mb-8 drop-shadow-sm leading-relaxed">
            Join 2 million+ users transforming their lives through better health management and connection.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-2">
            <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] mr-1">medication</span>
              <span>Medication Tracking</span>
            </div>
            <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] mr-1">group</span>
              <span>Caregiver Connection</span>
            </div>
            <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] mr-1">insights</span>
              <span>Health Insights</span>
            </div>
            <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] mr-1">shield</span>
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
