'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { loginSchema } from "../validation/authValidation";
import Logo from "../../../assets/logo.png";
import Image from "next/image";
import { useTranslation } from "@/shared/lib/i18nContext";
import { LanguageToggler } from "@/shared/components";

export default function LoginComponent() {
  const router = useRouter();
  const { login, loading, error, resetError } = useAuth();
  const { locale, t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const isValid = loginSchema.safeParse({ email, password }).success;

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
    } catch (err) {
    }
  };

  let backendErrorText = error;
  if (error) {
    try {
      const parsed = JSON.parse(error);
      backendErrorText = parsed[locale] || parsed["en"] || error;
    } catch (e) {
      const transKey = `auth.error.${error}`;
      const translated = t(transKey);
      backendErrorText = translated !== transKey ? translated : error;
    }
  }

  const displayError = backendErrorText;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <LanguageToggler />

      {/* Ambient Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] start-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] end-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Login Container */}
      <main className="relative z-10 w-full max-w-md px-margin-mobile md:px-0">
        <div className="bg-surface-container/50 backdrop-blur-2xl border border-outline-variant/30 rounded-xl p-8 shadow-2xl flex flex-col items-center">
          {/* Logo area */}
          <div className="mb-8 w-32 h-32 flex items-center justify-center">
            <Image
              alt="MediMind Logo"
              className="w-full h-full object-contain"
              width={128}
              height={128}
              src={Logo}
              priority
            />
          </div>

          <div className="text-center mb-8 w-full">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              {t("auth.login.title")}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {t("auth.login.subtitle")}
            </p>
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="w-full bg-error-container text-on-error-container p-3 rounded-lg mb-4 text-center font-body-md">
              {displayError}
            </div>
          )}

          {/* Login Form */}
          <form className="w-full space-y-5" onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="space-y-2">
              <label
                className="font-label-md text-label-md text-on-surface-variant block"
                htmlFor="email"
              >
                {t("auth.login.emailLabel")}
              </label>
              <div className="relative rounded-lg transition-all duration-200 bg-surface-container-high border border-outline-variant/50 focus-within:shadow-[0_0_0_1px_var(--color-primary),0_0_12px_0_var(--color-primary)] focus-within:border-primary">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-on-surface-variant">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    mail
                  </span>
                </div>
                <input
                  className="block w-full ps-10 pe-3 py-3 bg-transparent border-none rounded-lg text-on-surface focus:ring-0 focus:outline-none font-body-md placeholder-outline-variant text-start"
                  id="email"
                  placeholder={t("auth.login.emailPlaceholder")}
                  type="email"
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
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  className="font-label-md text-label-md text-on-surface-variant block"
                  htmlFor="password"
                >
                  {t("auth.login.passwordLabel")}
                </label>
                <a
                  className="font-label-md text-label-md text-primary hover:text-primary-fixed transition-colors"
                  href="#"
                >
                  {t("auth.login.forgotPassword")}
                </a>
              </div>
              <div className="relative rounded-lg transition-all duration-200 bg-surface-container-high border border-outline-variant/50 focus-within:shadow-[0_0_0_1px_var(--color-primary),0_0_12px_0_var(--color-primary)] focus-within:border-primary">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-on-surface-variant">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    lock
                  </span>
                </div>
                <input
                  className="block w-full ps-10 pe-10 py-3 bg-transparent border-none rounded-lg text-on-surface focus:ring-0 focus:outline-none font-body-md placeholder-outline-variant text-start"
                  id="password"
                  placeholder={t("auth.login.passwordPlaceholder")}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur("password")}
                />
                <button
                  className="absolute inset-y-0 end-0 pe-3 flex items-center text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-error font-body-sm text-[12px] mt-1.5 px-1 text-start">{errors.password}</p>
              )}
            </div>

            {/* Sign In Button */}
            <button
              className="w-full py-3 px-4 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-fixed hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={!isValid || loading}
            >
              {loading ? t("auth.login.signingInButton") : t("auth.login.signInButton")}
              {!loading && (
                <span
                  className="material-symbols-outlined text-[20px] rtl:rotate-180"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  arrow_forward
                </span>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
            {t("auth.login.noAccount")}
            <Link
              className="text-primary hover:text-primary-fixed font-label-md font-semibold ms-1 transition-colors"
              href="/register"
            >
              {t("auth.login.signUpLink")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
