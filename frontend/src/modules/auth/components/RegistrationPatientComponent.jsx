'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import Image from 'next/image';
import Logo from "../../../assets/logo.png";
import { useTranslation } from "@/shared/lib/i18nContext";
import { LanguageToggler } from "@/shared/components";

export default function RegistrationPatientComponent() {
  const router = useRouter();
  const { registrationData, register, loading, error, clearRegistrationData } = useAuth();
  const { locale, t } = useTranslation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dob: '',
    bloodType: '',
    emName: '',
    emPhone: '',
  });
  const [touched, setTouched] = useState({});

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

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

  const handleSubmit = async (e) => {
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
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dob: formData.dob || undefined,
        bloodType: formData.bloodType || undefined,
        emergencyContact: {
          name: formData.emName || undefined,
          phone: formData.emPhone || undefined
        },
        role: 'PATIENT'
      };

      const resultAction = await register(payload);
      if (resultAction.type === 'auth/register/fulfilled') {
        clearRegistrationData();
        router.push('/dashboard');
      }
    } catch (err) {
      // Handled by redux
    }
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 bg-surface-variant border border-outline-variant/50 text-on-surface-variant font-label-sm text-label-sm rounded-full shadow-inner">
              <span className="material-symbols-outlined text-[16px]">person</span>
              <span>{t("auth.register.patientRole")}</span>
            </div>
          </div>

          {displayError && (
            <div className="w-full bg-error-container text-on-error-container p-3 rounded-lg mb-4 text-center font-body-md">
              {displayError}
            </div>
          )}

          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <fieldset className="flex flex-col gap-5">
              <legend className="font-body-lg text-body-lg text-primary-fixed-dim border-b border-outline-variant/30 pb-2 w-full mb-2">
                {t("auth.register.profileDetails")}
              </legend>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="firstName">
                    {t("auth.register.firstNameLabel")} <span className="text-error">*</span>
                  </label>
                  <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]">
                    <input className="block w-full px-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg text-start" id="firstName" placeholder={t("auth.register.firstNamePlaceholder")} required type="text" value={formData.firstName} onChange={handleChange} onBlur={() => handleBlur("firstName")} />
                  </div>
                  {errors.firstName && (
                    <p className="text-error font-body-sm text-[12px] mt-1.5 px-1 text-start">{errors.firstName}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="lastName">
                    {t("auth.register.lastNameLabel")} <span className="text-error">*</span>
                  </label>
                  <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]">
                    <input className="block w-full px-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg text-start" id="lastName" placeholder={t("auth.register.lastNamePlaceholder")} required type="text" value={formData.lastName} onChange={handleChange} onBlur={() => handleBlur("lastName")} />
                  </div>
                  {errors.lastName && (
                    <p className="text-error font-body-sm text-[12px] mt-1.5 px-1 text-start">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="phone">
                    {t("auth.register.phoneLabel")} <span className="text-error">*</span>
                  </label>
                  <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]">
                    <input className="block w-full px-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg text-start" id="phone" placeholder={t("auth.register.phonePlaceholder")} required type="tel" value={formData.phone} onChange={handleChange} onBlur={() => handleBlur("phone")} />
                  </div>
                  {errors.phone && (
                    <p className="text-error font-body-sm text-[12px] mt-1.5 px-1 text-start">{errors.phone}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="dob">
                    {t("auth.register.dobLabel")}
                  </label>
                  <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]">
                    <input className="block w-full px-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none shadow-inner appearance-none relative z-10 rounded-lg text-start" id="dob" type="date" value={formData.dob} onChange={handleChange} />
                  </div>
                  {errors.lastName && (
                    <p className="text-error font-body-sm text-[12px] mt-1.5 px-1 text-start">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 md:w-[calc(50%-10px)]">
                <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="bloodType">
                  {t("auth.register.bloodTypeLabel")}
                </label>
                <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]">
                  <select className="block w-full px-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none shadow-inner appearance-none cursor-pointer rounded-lg text-start" id="bloodType" value={formData.bloodType} onChange={handleChange}>
                    <option className="text-outline" disabled value="">
                      {t("auth.register.bloodTypeSelect")}
                    </option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  <span className="material-symbols-outlined absolute end-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-opacity-70 pointer-events-none">expand_more</span>
                </div>
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-4 bg-surface/50 p-5 rounded-xl border border-surface-bright shadow-inner">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-error-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-error">emergency</span>
                </div>
                <h3 className="font-label-md text-label-md text-on-surface">
                  {t("auth.register.emNameLabel")}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="block font-label-sm text-label-sm text-on-surface mb-1.5" htmlFor="emName">
                    {t("auth.register.emNameLabel")}
                  </label>
                  <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:border-[#95ccff] focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)]">
                    <input className="block w-full px-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg text-start" id="emName" placeholder={t("auth.register.emNamePlaceholder")} type="text" value={formData.emName} onChange={handleChange} />
                  </div>
                  {touched.emName && errors.emName && (
                    <p className="text-error font-body-sm text-xs mt-1">{errors.emName}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="block font-label-sm text-label-sm text-on-surface mb-1.5" htmlFor="emPhone">
                    {t("auth.register.emPhoneLabel")}
                  </label>
                  <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:border-[#95ccff] focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)]">
                    <input className="block w-full px-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg text-start" id="emPhone" placeholder={t("auth.register.emPhonePlaceholder")} type="tel" value={formData.emPhone} onChange={handleChange} />
                  </div>
                  {touched.emPhone && errors.emPhone && (
                    <p className="text-error font-body-sm text-xs mt-1">{errors.emPhone}</p>
                  )}
                </div>
              </div>
            </fieldset>

            <div className="pt-2 flex flex-col gap-4">
              <button disabled={loading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md bg-primary text-on-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-all group disabled:opacity-50" type="submit">
                {loading ? t("auth.register.completingButton") : t("auth.register.completeButton")}
                {!loading && <span className="material-symbols-outlined text-[20px] ms-2 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">check_circle</span>}
              </button>
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
