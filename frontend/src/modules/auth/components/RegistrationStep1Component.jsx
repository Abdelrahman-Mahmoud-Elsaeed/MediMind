'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import Image from 'next/image';
import { useTranslation } from '@/shared/lib/i18nContext';
import { LanguageToggler } from '@/shared/components';
import { registerSchema } from '../validation/authValidation';

import Logo from "../../../assets/logo.png";

export default function RegistrationStep1Component() {
  const router = useRouter();
  const { setRegistrationData, registrationData } = useAuth();
  const { locale, t } = useTranslation();

  const [email, setEmail] = useState(registrationData?.email || '');
  const [password, setPassword] = useState(registrationData?.password || '');
  const [role, setRole] = useState(registrationData?.role || 'patient');
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
        />
      </header>

      <main className="flex-grow flex items-center justify-center p-margin-mobile md:p-margin-desktop w-full relative z-10">
        <div className="w-full max-w-[480px] bg-surface-container-low border border-outline-variant/30 rounded-xl shadow-2xl p-6 md:p-10 backdrop-blur-md relative overflow-hidden">

          <div className="absolute -top-24 -end-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="mb-8 text-center">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">
                  {t("auth.register.stepLabel").replace("{{current}}", "1")}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {t("auth.register.accountSetup")}
                </span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-primary rounded-full"></div>
              </div>
            </div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary-fixed-dim tracking-tight mb-2">
              {t("auth.register.step1Title")}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {t("auth.register.step1Subtitle")}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleContinue}>
            {/* Account Details Section */}
            <div className="space-y-4">

              {/* Email Input */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="email">
                  {t("auth.register.emailLabel")}
                </label>
                <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]">
                  <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-opacity-70 text-[20px]">mail</span>
                  </div>
                  <input
                    className="block w-full ps-10 pe-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg text-start"
                    id="email"
                    type="email"
                    placeholder={t("auth.register.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-error font-body-sm text-[12px] mt-1.5 px-1 text-start">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="password">
                  {t("auth.register.passwordLabel")}
                </label>
                <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]">
                  <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-opacity-70 text-[20px]">lock</span>
                  </div>
                  <input
                    className="block w-full ps-10 pe-10 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg text-start"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t("auth.register.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password")}
                  />
                  <div
                    className="absolute inset-y-0 end-0 pe-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-on-surface-variant text-opacity-70 text-[20px] hover:text-on-surface transition-colors">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </div>
                </div>
                {errors.password && (
                  <p className="text-error font-body-sm text-[12px] mt-1.5 px-1 text-start">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Role Selection Section */}
            <div className="pt-2">
              <h2 className="font-label-md text-label-md text-on-surface mb-3 flex items-center gap-2">
                {t("auth.register.roleTitle")}
                <span className="material-symbols-outlined text-primary text-[16px] cursor-help" title={t("auth.register.roleInfo")}>info</span>
              </h2>
              <div className="grid grid-cols-2 gap-4">

                {/* Patient Role Card */}
                <label className="relative cursor-pointer">
                  <input
                    className="peer sr-only"
                    name="role"
                    type="radio"
                    value="patient"
                    checked={role === 'patient'}
                    onChange={() => setRole('patient')}
                  />
                  <div className={`h-full border rounded-lg p-4 flex flex-col items-center justify-center gap-3 bg-surface hover:bg-surface-variant/50 transition-all ${role === 'patient' ? 'border-[#95ccff] bg-[#5c9bd1]/10' : 'border-outline-variant/40'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${role === 'patient' ? 'bg-primary/20' : 'bg-surface-container-high'}`}>
                      <span className={`material-symbols-outlined text-[28px] transition-colors ${role === 'patient' ? 'text-[#95ccff]' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>personal_injury</span>
                    </div>
                    <span className="font-label-md text-label-md text-center text-on-surface">
                      {t("auth.register.patientRole")}
                    </span>
                  </div>
                </label>

                {/* Caregiver Role Card */}
                <label className="relative cursor-pointer">
                  <input
                    className="peer sr-only"
                    name="role"
                    type="radio"
                    value="caregiver"
                    checked={role === 'caregiver'}
                    onChange={() => setRole('caregiver')}
                  />
                  <div className={`h-full border rounded-lg p-4 flex flex-col items-center justify-center gap-3 bg-surface hover:bg-surface-variant/50 transition-all ${role === 'caregiver' ? 'border-[#95ccff] bg-[#5c9bd1]/10' : 'border-outline-variant/40'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${role === 'caregiver' ? 'bg-primary/20' : 'bg-surface-container-high'}`}>
                      <span className={`material-symbols-outlined text-[28px] transition-colors ${role === 'caregiver' ? 'text-[#95ccff]' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>supervisor_account</span>
                    </div>
                    <span className="font-label-md text-label-md text-center text-on-surface">
                      {t("auth.register.caregiverRole")}
                    </span>
                  </div>
                </label>

              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4">
              <button
                disabled={!isValid}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md bg-primary text-on-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
              >
                {t("auth.register.continueButton")}
                <span className="material-symbols-outlined ms-2 text-[20px] rtl:rotate-180">arrow_forward</span>
              </button>
              <p className="mt-4 text-center font-body-md text-label-sm text-on-surface-variant">
                {t("auth.register.hasAccount")}
                <Link className="font-label-md text-primary hover:text-primary-fixed transition-colors ms-1" href="/login">
                  {t("auth.register.signInLink")}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* Optional: Subtle ambient background element */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute bottom-0 start-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] transform translate-x-[-20%] translate-y-[20%]"></div>
      </div>
    </div>
  );
}
