'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useTheme } from 'next-themes';
import { loginSchema } from "../validation/authValidation";
import { parseApiMessage } from "@/shared/lib/parseApiMessage";

export default function LoginComponent() {
  const router = useRouter();
  const { login, loading, error, resetError, isAuthenticated, user } = useAuth();
  const { locale, dir, t, toggleLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const role = user?.role ? String(user.role).toUpperCase() : "PATIENT";
      router.replace(role === "PATIENT" ? "/home" : "/dashboard");
    }
  }, [isAuthenticated, loading, user, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const isValid = loginSchema.safeParse({ email, password }).success;
  const isRtl = locale === 'ar';

  const handleBlur = (field) => {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === field);
      if (issue) {
        let msg = "";
        if (field === "email") {
          msg = email ? t("auth.validation.invalidEmail") : t("auth.validation.emailRequired");
        } else if (field === "password") {
          msg = t("auth.validation.passwordRequired");
        }
        setErrors((prev) => ({ ...prev, [field]: msg }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    resetError();
    setErrors({ email: "", password: "" });
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const newErrors = { email: "", password: "" };
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        let msg = "";
        if (field === "email") {
          msg = email ? t("auth.validation.invalidEmail") : t("auth.validation.emailRequired");
        } else if (field === "password") {
          msg = t("auth.validation.passwordRequired");
        }
        newErrors[field] = msg;
      });
      setErrors(newErrors);
      return;
    }

    try {
      const resultAction = await login({ email, password });
      const userRole = resultAction.payload?.user?.role || resultAction.payload?.role;
      if (userRole === "PATIENT") {
        router.push("/home");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {}
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
              {t("auth.login.title")}
            </h1>
            <p className="text-sm text-on-surface-variant">
              {t("auth.login.subtitle")}
            </p>
          </div>

          {displayError && (
            <div className="w-full bg-error-container text-on-error-container p-3 rounded-lg mb-4 text-center font-body-md">
              {displayError}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="email">
                {t("auth.login.emailLabel")}
              </label>
              <div className="relative">
                <span className={`material-symbols-outlined absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none`}>
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  className={`butterfly-input w-full font-body-md text-body-md text-on-surface placeholder:text-outline-variant transition-all py-4 ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                  placeholder={t("auth.login.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  dir="ltr"
                />
              </div>
              {errors.email && (
                <p className="text-error text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="password">
                  {t("auth.login.passwordLabel")}
                </label>
                <a href="/forgot-password" className="text-xs text-primary font-semibold hover:underline">
                  {t("auth.login.forgotPassword")}
                </a>
              </div>
              <div className="relative">
                <span className={`material-symbols-outlined absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none`}>
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`butterfly-input w-full font-body-md text-body-md text-on-surface placeholder:text-outline-variant transition-all py-4 ${isRtl ? 'pr-12 pl-12' : 'pl-12 pr-12'}`}
                  placeholder={t("auth.login.passwordPlaceholder")}
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
                <p className="text-error text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              disabled={!isValid || loading}
              type="submit"
              className="w-full bg-primary text-on-primary rounded-full py-4 font-semibold text-sm hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 group"
            >
              <span>{loading ? t("auth.login.signingInButton") : t("auth.login.signInButton")}</span>
              {!loading && (
                <span className={`material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform ${isRtl ? 'rotate-180' : ''}`}>
                  arrow_forward
                </span>
              )}
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-on-surface-variant pt-2">
              {t("auth.login.noAccount")}{' '}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                {t("auth.login.signUpLink")}
              </Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <footer className="w-full flex justify-center items-center gap-1.5 text-xs text-on-surface-variant select-none">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          <span>{t("auth.login.secureLabel") || "Secure 256-bit SSL Encryption"}</span>
        </footer>
      </div>

      {/* Right Side (Visual Panel) — shown on lg+ */}
      <div className="hidden lg:flex w-full relative bg-butterfly-gradient overflow-hidden flex-col justify-center items-center px-12 py-12 select-none">
        <div className="absolute inset-0 dot-grid opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        <svg className="absolute top-1/4 left-1/4 animate-float opacity-50 w-12 h-12" fill="white" viewBox="0 0 24 24">
          <path d="M12,15.5C10.5,16 9,15 8.5,13.5C8,12 8,10.5 9,9.5C10,8.5 11.5,8.5 12,9.5C12.5,8.5 14,8.5 15,9.5C16,10.5 16,12 15.5,13.5C15,15 13.5,16 12,15.5M12,13.5C12.5,14 13.5,14 14,13C14.5,12 14,11 13.5,10.5C13,10 12.5,10 12,11C11.5,10 11,10 10.5,10.5C10,11 9.5,12 10,13C10.5,14 11.5,14 12,13.5M12,2C17.5,2 22,6.5 22,12C22,17.5 17.5,22 12,22C6.5,22 2,17.5 2,12C2,6.5 6.5,2 12,2Z" />
        </svg>
        <svg className="absolute top-1/3 right-1/4 animate-float-delayed opacity-30 w-8 h-8" fill="white" style={{ transform: "rotate(45deg)" }} viewBox="0 0 24 24">
          <path d="M12,15.5C10.5,16 9,15 8.5,13.5C8,12 8,10.5 9,9.5C10,8.5 11.5,8.5 12,9.5C12.5,8.5 14,8.5 15,9.5C16,10.5 16,12 15.5,13.5C15,15 13.5,16 12,15.5M12,13.5C12.5,14 13.5,14 14,13C14.5,12 14,11 13.5,10.5C13,10 12.5,10 12,11C11.5,10 11,10 10.5,10.5C10,11 9.5,12 10,13C10.5,14 11.5,14 12,13.5M12,2C17.5,2 22,6.5 22,12C22,17.5 17.5,22 12,22C6.5,22 2,17.5 2,12C2,6.5 6.5,2 12,2Z" />
        </svg>
        <svg className="absolute bottom-1/4 left-1/3 animate-float opacity-40 w-10 h-10" fill="white" style={{ transform: "rotate(-15deg)" }} viewBox="0 0 24 24">
          <path d="M12,15.5C10.5,16 9,15 8.5,13.5C8,12 8,10.5 9,9.5C10,8.5 11.5,8.5 12,9.5C12.5,8.5 14,8.5 15,9.5C16,10.5 16,12 15.5,13.5C15,15 13.5,16 12,15.5M12,13.5C12.5,14 13.5,14 14,13C14.5,12 14,11 13.5,10.5C13,10 12.5,10 12,11C11.5,10 11,10 10.5,10.5C10,11 9.5,12 10,13C10.5,14 11.5,14 12,13.5M12,2C17.5,2 22,6.5 22,12C22,17.5 17.5,22 12,22C6.5,22 2,17.5 2,12C2,6.5 6.5,2 12,2Z" />
        </svg>

        <div className="relative z-10 max-w-lg text-center flex flex-col items-center" dir="ltr">
          <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-lg border border-white/30 animate-pulse-slow">
            <span className="material-symbols-outlined text-[64px] text-white">diversity_1</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-white mb-2 drop-shadow-md">
            Your Health Journey Begins Here.
          </h2>
          <p className="font-body-lg text-body-lg text-white/90 mb-8 drop-shadow-sm leading-relaxed">
            Join 2 million+ users transforming their lives through better health management and connection.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { icon: "medication", label: "Medication Tracking" },
              { icon: "group", label: "Caregiver Connection" },
              { icon: "insights", label: "Health Insights" },
              { icon: "shield", label: "Secure & Private" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px] mr-1">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
