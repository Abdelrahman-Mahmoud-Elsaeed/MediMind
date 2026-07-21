'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useTheme } from 'next-themes';
import { registerCaregiverSchema } from "../validation/authValidation";
import { parseApiMessage } from "@/shared/lib/parseApiMessage";
import BrandingSidebar from "./BrandingSidebar";

export default function RegistrationCaregiverComponent() {
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
    relation: registrationData.relation || "",
    whatsappOptIn: registrationData.whatsappOptIn !== undefined ? registrationData.whatsappOptIn : true,
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    relation: "",
  });

  const isValid = registerCaregiverSchema.safeParse(formData).success;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleBlur = (field) => {
    const result = registerCaregiverSchema.safeParse(formData);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === field);
      if (issue) {
        let msg = "";
        if (field === "firstName") {
          msg = t("auth.validation.firstNameRequired");
        } else if (field === "lastName") {
          msg = t("auth.validation.lastNameRequired");
        } else if (field === "phone" && formData.phone) {
          msg = t("auth.validation.phoneRequired");
        } else if (field === "relation") {
          msg = "Relation is required";
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
    setErrors({ firstName: "", lastName: "", phone: "", relation: "" });

    const result = registerCaregiverSchema.safeParse(formData);
    if (!result.success) {
      const newErrors = { firstName: "", lastName: "", phone: "", relation: "" };
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        let msg = "";
        if (field === "firstName") {
          msg = t("auth.validation.firstNameRequired");
        } else if (field === "lastName") {
          msg = t("auth.validation.lastNameRequired");
        } else if (field === "phone" && formData.phone) {
          msg = t("auth.validation.phoneRequired");
        } else if (field === "relation") {
          msg = "Relation is required";
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
        role: "FAMILY_CAREGIVER", // Map to the backend expected role
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        relation: formData.relation,
        whatsappOptIn: formData.whatsappOptIn,
        preferredLanguage: locale,
      };

      if (formData.phone && formData.phone.trim() !== "") {
        cleanData.phone = formData.phone.trim();
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
              {t("auth.register.stepLabel").replace("{{current}}", "2").replace("2", "3")}: {t("auth.register.profileDetails")} ({t("auth.register.caregiverRole")})
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
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                    person
                  </span>
                  <input
                    className="butterfly-input w-full font-body-md text-body-md text-on-surface placeholder:text-outline-variant transition-all py-3.5 pl-12 pr-4 text-start"
                    id="firstName"
                    placeholder={t("auth.register.firstNamePlaceholder")}
                    required
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={() => handleBlur("firstName")}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-error text-xs mt-1 text-start">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="lastName">
                  {t("auth.register.lastNameLabel")} <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                    person
                  </span>
                  <input
                    className="butterfly-input w-full font-body-md text-body-md text-on-surface placeholder:text-outline-variant transition-all py-3.5 pl-12 pr-4 text-start"
                    id="lastName"
                    placeholder={t("auth.register.lastNamePlaceholder")}
                    required
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={() => handleBlur("lastName")}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-error text-xs mt-1 text-start">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Phone Number & Relation */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="phone">
                  {t("auth.register.phoneLabel")}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                    call
                  </span>
                  <input
                    className="butterfly-input w-full font-body-md text-body-md text-on-surface placeholder:text-outline-variant transition-all py-3.5 pl-12 pr-4 text-start"
                    id="phone"
                    placeholder={t("auth.register.phonePlaceholder")}
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => handleBlur("phone")}
                  />
                </div>
                {errors.phone && (
                  <p className="text-error text-xs mt-1 text-start">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="relation">
                  {t("auth.register.relationLabel")} <span className="text-error">*</span>
                </label>
                <select
                  className="butterfly-input w-full font-body-md text-body-md text-on-surface py-3.5 px-4 appearance-none cursor-pointer text-start"
                  id="relation"
                  value={formData.relation}
                  onChange={handleChange}
                  onBlur={() => handleBlur("relation")}
                >
                  <option value="">{t("auth.register.relationSelect")}</option>
                  <option value="son">{t("auth.register.relation_son")}</option>
                  <option value="daughter">{t("auth.register.relation_daughter")}</option>
                  <option value="spouse">{t("auth.register.relation_spouse")}</option>
                  <option value="parent">{t("auth.register.relation_parent")}</option>
                  <option value="sibling">{t("auth.register.relation_sibling")}</option>
                  <option value="friend">{t("auth.register.relation_friend")}</option>
                  <option value="other">{t("auth.register.relation_other")}</option>
                </select>
                {errors.relation && (
                  <p className="text-error text-xs mt-1 text-start">{errors.relation}</p>
                )}
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
      <BrandingSidebar/>
    </div>
  );
}
