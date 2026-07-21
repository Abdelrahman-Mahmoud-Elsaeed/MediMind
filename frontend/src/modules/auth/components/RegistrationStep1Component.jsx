'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '@/shared/lib/i18nContext';
import { useTheme } from 'next-themes';
import { registerSchema } from '../validation/authValidation';

export default function RegistrationStep1Component() {
  const router = useRouter();
  const { setRegistrationData, registrationData } = useAuth();
  const { locale, dir, t, toggleLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isRtl = locale === 'ar';

  useEffect(() => {
    setMounted(true);
  }, []);

  const [email, setEmail] = useState(registrationData?.email || '');
  const [password, setPassword] = useState(registrationData?.password || '');
  const [role, setRole] = useState(registrationData?.role?.toLowerCase() || 'patient');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const step1Schema = registerSchema.pick({ email: true, password: true });
  const isValid = step1Schema.safeParse({ email, password }).success;

  const handleBlur = (field) => {
    const result = step1Schema.safeParse({ email, password });
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === field);
      if (issue) {
        let msg = "";
        if (field === "email") {
          msg = email ? t("auth.validation.invalidEmail") : t("auth.validation.emailRequired");
        } else if (field === "password") {
          if (!password) {
            msg = t("auth.validation.passwordRequired");
          } else if (password.length < 8) {
            msg = t("auth.validation.passwordMin");
          } else {
            msg = t("auth.validation.passwordRequirements");
          }
        }
        setErrors((prev) => ({ ...prev, [field]: msg }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setErrors({ email: "", password: "" });

    const result = step1Schema.safeParse({ email, password });
    if (!result.success) {
      const newErrors = { email: "", password: "" };
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        let msg = "";
        if (field === "email") {
          msg = email ? t("auth.validation.invalidEmail") : t("auth.validation.emailRequired");
        } else if (field === "password") {
          if (!password) {
            msg = t("auth.validation.passwordRequired");
          } else if (password.length < 8) {
            msg = t("auth.validation.passwordMin");
          } else {
            msg = t("auth.validation.passwordRequirements");
          }
        }
        newErrors[field] = msg;
      });
      setErrors(newErrors);
      return;
    }

    setRegistrationData({ ...registrationData, email, password, role: role.toUpperCase() });

    if (role === 'patient') {
      router.push('/register/patient');
    } else if (role === 'caregiver') {
      router.push('/register/caregiver');
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);

    // Validate email and password first
    const result = step1Schema.safeParse({ email, password });
    if (result.success) {
      setRegistrationData({ ...registrationData, email, password, role: selectedRole.toUpperCase() });
      router.push(`/register/${selectedRole}`);
    } else {
      // Trigger validation errors so they know what is missing
      const newErrors = { email: "", password: "" };
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        let msg = "";
        if (field === "email") {
          msg = email ? t("auth.validation.invalidEmail") : t("auth.validation.emailRequired");
        } else if (field === "password") {
          if (!password) {
            msg = t("auth.validation.passwordRequired");
          } else if (password.length < 8) {
            msg = t("auth.validation.passwordMin");
          } else {
            msg = t("auth.validation.passwordRequirements");
          }
        }
        newErrors[field] = msg;
      });
      setErrors(newErrors);
    }
  };

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
              {t("auth.register.step1Title")}
            </h1>
            <p className="text-sm text-on-surface-variant">
              {t("auth.register.stepLabel").replace("{{current}}", "1").replace("2", "3")}: {t("auth.register.accountSetup")}
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute top-4 left-[10%] right-[10%] h-[2px] bg-surface-variant -z-10"></div>
            <div className="flex flex-col items-center flex-1 relative">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm mb-xs ring-4 ring-surface-container-lowest z-10">1</div>
              <span className="text-xs font-semibold text-primary">{t("auth.register.accountSetup")}</span>
            </div>
            <div className="flex flex-col items-center flex-1 relative">
              <div className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-bold text-sm mb-xs ring-4 ring-surface-container-lowest z-10">2</div>
              <span className="text-xs font-medium text-on-surface-variant">{t("auth.register.profileDetails")}</span>
            </div>
            <div className="flex flex-col items-center flex-1 relative">
              <div className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-bold text-sm mb-xs ring-4 ring-surface-container-lowest z-10">3</div>
              <span className="text-xs font-medium text-on-surface-variant">Medical</span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleContinue}>
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="email">
                {t("auth.register.emailLabel")}
              </label>
              <div className="relative">
                <span className={`material-symbols-outlined absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none`}>
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  className={`butterfly-input w-full font-body-md text-body-md text-on-surface placeholder:text-outline-variant transition-all py-4 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                  placeholder={t("auth.register.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  dir="ltr"
                />
              </div>
              {errors.email && (
                <p className="text-error text-xs mt-1 text-start">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="password">
                {t("auth.register.passwordLabel")}
              </label>
              <div className="relative">
                <span className={`material-symbols-outlined absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none`}>
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`butterfly-input w-full font-body-md text-body-md text-on-surface placeholder:text-outline-variant transition-all py-4 ${isRtl ? 'pr-12 pl-12' : 'pl-12 pr-12'}`}
                  placeholder={t("auth.register.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur("password")}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-error text-xs mt-1 text-start">{errors.password}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <span className="block text-xs font-semibold text-on-surface-variant mb-2">
                {t("auth.register.roleTitle")}
              </span>
              <div className="grid grid-cols-2 gap-4">
                {/* Patient Card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('patient')}
                  className={`relative rounded-[16px] p-4 flex flex-col items-center gap-1 border text-center transition-all cursor-pointer ${
                    role === 'patient'
                      ? 'border-primary-container bg-[#eaf8f4] text-primary shadow-sm'
                      : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container/30 text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined mb-xs text-[24px]">person</span>
                  <span className="text-sm font-semibold">{t("auth.register.patientRole")}</span>
                  {role === 'patient' && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                    </div>
                  )}
                </button>

                {/* Caregiver Card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('caregiver')}
                  className={`relative rounded-[16px] p-4 flex flex-col items-center gap-1 border text-center transition-all cursor-pointer ${
                    role === 'caregiver'
                      ? 'border-primary-container bg-[#eaf8f4] text-primary shadow-sm'
                      : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container/30 text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined mb-xs text-[24px]">favorite</span>
                  <span className="text-sm font-semibold">{t("auth.register.caregiverRole")}</span>
                  {role === 'caregiver' && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              disabled={!isValid}
              type="submit"
              className="w-full bg-primary text-on-primary rounded-full py-4 font-semibold text-sm hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 group"
            >
              <span>{t("auth.register.continueButton")}</span>
              <span className={`material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform ${isRtl ? 'rotate-180' : ''}`}>arrow_forward</span>
            </button>

            {/* Sign In Link */}
            <p className="text-center text-sm text-on-surface-variant pt-2">
              {t("auth.register.hasAccount")}{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                {t("auth.login.signInButton")}
              </Link>
            </p>
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
            <span className="material-symbols-outlined text-[64px] text-white">
              {role === 'caregiver' ? 'volunteer_activism' : 'diversity_1'}
            </span>
          </div>

          <h2 className="font-headline-lg text-headline-lg text-white mb-2 drop-shadow-md">
            {role === 'caregiver' ? 'Empowering Trusted Caregivers.' : 'Your Health Journey Begins Here.'}
          </h2>
          <p className="font-body-lg text-body-lg text-white/90 mb-8 drop-shadow-sm leading-relaxed">
            {role === 'caregiver' 
              ? 'Coordinate medications, track adherence, and stay connected with your loved ones every step of the way.' 
              : 'Join 2 million+ users transforming their lives through better health management and connection.'}
          </p>

          {/* Feature Pills */}
          {role === 'caregiver' ? (
            <div className="flex flex-wrap justify-center gap-2">
              <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px] mr-1">monitor_heart</span>
                <span>Patient Monitoring</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px] mr-1">notifications_active</span>
                <span>Quick Alerts</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px] mr-1">group_add</span>
                <span>Care Circles</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px] mr-1">vpn_key</span>
                <span>Secure Access</span>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
