'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import Image from 'next/image';
import Logo from "../../../assets/logo.png";
import { useTranslation } from "@/shared/lib/i18nContext";
import { LanguageToggler } from "@/shared/components";

export default function RegistrationCaregiverComponent() {
  const router = useRouter();
  const { registrationData, register, loading, error, clearRegistrationData } = useAuth();
  const { locale, t } = useTranslation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [touched, setTouched] = useState({});

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    // If no data from step 1, redirect back
    if (!registrationData || !registrationData.email) {
      router.push('/register');
    }
  }, [registrationData, router]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleBlur = (field) => {
    if (field === 'firstName') {
      setErrors((prev) => ({
        ...prev,
        firstName: formData.firstName ? '' : t('auth.validation.firstNameRequired'),
      }));
    } else if (field === 'lastName') {
      setErrors((prev) => ({
        ...prev,
        lastName: formData.lastName ? '' : t('auth.validation.lastNameRequired'),
      }));
    } else if (field === 'phone') {
      setErrors((prev) => ({
        ...prev,
        phone: formData.phone ? '' : t('auth.validation.phoneRequired'),
      }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const newErrors = {
      firstName: formData.firstName ? '' : t('auth.validation.firstNameRequired'),
      lastName: formData.lastName ? '' : t('auth.validation.lastNameRequired'),
      phone: formData.phone ? '' : t('auth.validation.phoneRequired'),
    };

    setErrors(newErrors);

    if (newErrors.firstName || newErrors.lastName || newErrors.phone) {
      return;
    }

    try {
      const payload = {
        ...registrationData,
        ...formData,
        role: 'CAREGIVER'
      };

      const resultAction = await register(payload);
      if (resultAction.type === 'auth/register/fulfilled') {
        clearRegistrationData();
        router.push('/dashboard');
      }
    } catch (err) {
      // Handled by Redux
    }
  };

  const handleBack = () => {
    router.push('/register');
  };

  let backendErrorText = error;
  if (error) {
    try {
      const parsed = JSON.parse(error);
      backendErrorText = parsed[locale] || parsed["en"] || error;
    } catch (e) {
      // Keep as is
    }
  }

  const displayError = backendErrorText;

  if (!registrationData) return null;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container">
      <LanguageToggler />
      <header className="w-full flex justify-center py-6 md:py-8 z-10 relative">
        <Image
          alt="MediMind Logo"
          className="h-12 w-auto"
          width={48}
          height={48}
          src={Logo}
          priority
        />
      </header>

      <main className="flex-grow flex items-center justify-center p-margin-mobile md:p-margin-desktop w-full relative z-10">
        <div className="w-full max-w-[480px] bg-surface-container-low border border-outline-variant/30 rounded-xl shadow-2xl p-6 md:p-10 backdrop-blur-md relative overflow-hidden">

          <div className="absolute -top-24 -end-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="mb-8 text-center">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">
                  {t("auth.register.stepLabel").replace("{{current}}", "2")}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {t("auth.register.profileDetails")}
                </span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full w-full bg-primary rounded-full"></div>
              </div>
            </div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary-fixed-dim tracking-tight mb-2">
              {t("auth.register.step2Title")}
            </h1>

            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-surface-variant/50 rounded-full border border-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>medical_information</span>
              <span className="font-label-sm text-label-sm text-on-surface">
                {t("auth.register.caregiverRole")}
              </span>
            </div>
          </div>

          {displayError && (
            <div className="w-full bg-error-container text-on-error-container p-3 rounded-lg mb-4 text-center font-body-md">
              {displayError}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="firstName">
                  {t("auth.register.firstNameLabel")}
                </label>
                <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]">
                  <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-opacity-70 text-[20px]">person</span>
                  </div>
                  <input className="block w-full ps-10 pe-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg text-start" id="firstName" placeholder={t("auth.register.firstNamePlaceholder")} required type="text" value={formData.firstName} onChange={handleChange} onBlur={() => handleBlur("firstName")} />
                </div>
                {errors.firstName && (
                  <p className="text-error font-body-sm text-[12px] mt-1.5 px-1 text-start">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="lastName">
                  {t("auth.register.lastNameLabel")}
                </label>
                <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]">
                  <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-opacity-70 text-[20px]">person</span>
                  </div>
                  <input className="block w-full ps-10 pe-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg text-start" id="lastName" placeholder={t("auth.register.lastNamePlaceholder")} required type="text" value={formData.lastName} onChange={handleChange} onBlur={() => handleBlur("lastName")} />
                </div>
                {errors.lastName && (
                  <p className="text-error font-body-sm text-[12px] mt-1.5 px-1 text-start">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="phone">
                  {t("auth.register.phoneLabel")}
                </label>
                <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]">
                  <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-opacity-70 text-[20px]">call</span>
                  </div>
                  <input className="block w-full ps-10 pe-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg text-start" id="phone" placeholder={t("auth.register.phonePlaceholder")} required type="tel" value={formData.phone} onChange={handleChange} onBlur={() => handleBlur("phone")} />
                </div>
                {errors.phone && (
                  <p className="text-error font-body-sm text-[12px] mt-1.5 px-1 text-start">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button disabled={loading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md bg-primary text-on-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-all disabled:opacity-50" type="submit">
                {loading ? t("auth.register.completingButton") : t("auth.register.completeButton")}
                {!loading && <span className="material-symbols-outlined ms-2 text-[20px] rtl:rotate-180">arrow_forward</span>}
              </button>
              <div className="text-center mt-4">
                <button onClick={handleBack} className="font-label-sm text-label-sm text-outline hover:text-primary transition-colors" type="button">
                  Back to Step 1
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute bottom-0 start-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] transform translate-x-[-20%] translate-y-[20%]"></div>
      </div>
    </div>
  );
}
