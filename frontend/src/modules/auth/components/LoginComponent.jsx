'use client';
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { loginThunk } from "../store/authActions";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useTheme } from 'next-themes';
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { parseApiMessage } from "@/shared/lib/parseApiMessage";
import Branding from "./Branding";
import { FormField } from "../registration/components/FormField";
import { PasswordInput } from "../registration/components/PasswordInput";
import { AppButton } from "@/shared/components/ui/AppButton";
import { LanguageToggler } from "@/shared/components/LanguageToggler";
import { z } from "zod";
export default function LoginComponent() {
    const router = useRouter();
    const { login, loading, isAuthLoading, error, resetError, clearRegistrationData, isAuthenticated, user } = useAuth();
    const { locale, dir, t } = useTranslation();
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    useEffect(() => {
        if (!isAuthLoading && isAuthenticated) {
            const role = user?.role ? String(user.role).toUpperCase() : "PATIENT";
            if (role === "PHARMACIST") {
                router.replace("/pharmacy");
            } else {
                router.replace(role === "PATIENT" ? "/home" : "/dashboard");
            }
        }
    }, [isAuthenticated, isAuthLoading, user, router]);
    const [loginInput, setLoginInput] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    // All possible validation errors (not filtered by touched)
    const [validationErrors, setValidationErrors] = useState({ loginInput: "", password: "" });
    // Which fields have been touched (blurred, autofilled, or submit attempted)
    const [touchedFields, setTouchedFields] = useState({});
    // Reset redux auth errors and component form states on mount & unmount
    useEffect(() => {
        resetError();
        if (typeof clearRegistrationData === "function") {
            clearRegistrationData();
        }
        setLoginInput("");
        setPassword("");
        setValidationErrors({ loginInput: "", password: "" });
        setTouchedFields({});
        return () => {
            resetError();
            if (typeof clearRegistrationData === "function") {
                clearRegistrationData();
            }
        };
    }, [resetError, clearRegistrationData]);
    // Refs to avoid stale closures in interval
    const loginInputRef = useRef(loginInput);
    const passwordRef = useRef(password);
    loginInputRef.current = loginInput;
    passwordRef.current = password;
    // Continuous DOM Autofill Scanner for Login Form
    // Marks autofilled fields as touched so errors show immediately
    useEffect(() => {
        let isMounted = true;
        const syncAutofill = () => {
            if (typeof document === "undefined" || !isMounted)
                return;
            const loginEl = document.getElementById("loginInput");
            const passEl = document.getElementById("password");
            const updates = {};
            const newTouched = {};
            if (loginEl && loginEl.value && loginEl.value !== loginInputRef.current) {
                updates.loginInput = loginEl.value;
                newTouched.loginInput = true;
            }
            if (passEl && passEl.value && passEl.value !== passwordRef.current) {
                updates.password = passEl.value;
                newTouched.password = true;
            }
            if (updates.loginInput !== undefined)
                setLoginInput(updates.loginInput);
            if (updates.password !== undefined)
                setPassword(updates.password);
            if (Object.keys(newTouched).length > 0)
                setTouchedFields((prev) => ({ ...prev, ...newTouched }));
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
    }, []); // runs once; refs keep values current
    const getValidationSchema = () => {
        return z.object({
            loginInput: z.string()
                .min(1, t("auth.validation.emailOrPhoneRequired"))
                .superRefine((val, ctx) => {
                if (!val)
                    return;
                const isPhoneInput = /^[0-9+\s()-]+$/.test(val);
                if (isPhoneInput) {
                    let normalized = val.trim();
                    if (normalized.startsWith("00")) {
                        normalized = `+${normalized.slice(2)}`;
                    }
                    const parsed = normalized.startsWith("+")
                        ? parsePhoneNumberFromString(normalized)
                        : parsePhoneNumberFromString(normalized, "EG");
                    const isValidPhone = parsed ? parsed.isPossible() : false;
                    if (!isValidPhone) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: t("auth.validation.invalidPhone"),
                        });
                    }
                }
                else {
                    const emailSchema = z.string().email(t("auth.validation.invalidEmail"));
                    const res = emailSchema.safeParse(val);
                    if (!res.success) {
                        res.error.issues.forEach((i) => ctx.addIssue({ code: z.ZodIssueCode.custom, message: i.message }));
                    }
                }
            }),
            password: z.string()
                .min(1, t("auth.validation.passwordRequired"))
                .min(8, t("auth.validation.passwordMin"))
                .regex(/[A-Z]/, t("auth.validation.passwordRequirements"))
                .regex(/[a-z]/, t("auth.validation.passwordRequirements"))
                .regex(/[0-9]/, t("auth.validation.passwordRequirements")),
        });
    };
    // Re-run validation whenever form values change (full errors, not display-filtered)
    useEffect(() => {
        const schema = getValidationSchema();
        const result = schema.safeParse({ loginInput, password });
        if (!result.success) {
            const errs = { loginInput: "", password: "" };
            result.error.issues.forEach((issue) => {
                const field = issue.path[0];
                if (!errs[field])
                    errs[field] = issue.message;
            });
            setValidationErrors(errs);
        }
        else {
            setValidationErrors({ loginInput: "", password: "" });
        }
    }, [loginInput, password]);
    const isValid = getValidationSchema().safeParse({ loginInput, password }).success;
    // visibleErrors: only show errors for touched fields
    const errors = {
        loginInput: touchedFields.loginInput ? validationErrors.loginInput : "",
        password: touchedFields.password ? validationErrors.password : "",
    };
    const handleBlur = (field) => {
        setTouchedFields((prev) => ({ ...prev, [field]: true }));
    };
    const handleLogin = async (e) => {
        e.preventDefault();
        resetError();
        const schema = getValidationSchema();
        const result = schema.safeParse({ loginInput, password });
        if (!result.success) {
            const newErrors = { loginInput: "", password: "" };
            result.error.issues.forEach((issue) => {
                const field = issue.path[0];
                if (!newErrors[field])
                    newErrors[field] = issue.message;
            });
            setValidationErrors(newErrors);
            // Reveal all errored fields
            setTouchedFields({ loginInput: true, password: true });
            return;
        }
        const isPhoneInput = /^[0-9+\s()-]+$/.test(loginInput.trim());
        let normalizedInput = loginInput.trim();
        if (isPhoneInput) {
            if (normalizedInput.startsWith("00")) {
                normalizedInput = `+${normalizedInput.slice(2)}`;
            }
            const parsed = normalizedInput.startsWith("+")
                ? parsePhoneNumberFromString(normalizedInput)
                : parsePhoneNumberFromString(normalizedInput, "EG");
            if (parsed && parsed.isValid()) {
                normalizedInput = parsed.number;
            }
        }
        const payload = isPhoneInput
            ? { phone: normalizedInput, password }
            : { email: normalizedInput.toLowerCase(), password };
        try {
            const resultAction = await login(payload);
            if (loginThunk.fulfilled.match(resultAction)) {
                const userRole = resultAction.payload?.user?.role || resultAction.payload?.role;
                const role = userRole ? String(userRole).toUpperCase() : "PATIENT";
                router.replace(role === "PATIENT" ? "/home" : "/dashboard");
            }
        }
        catch (err) { }
    };
    const displayError = parseApiMessage(error, locale, t);
    return (<div dir={dir} className="bg-background text-on-surface min-h-screen grid grid-cols-1 lg:grid-cols-2 antialiased overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Left Side (Form) */}
      <div className="flex flex-col min-h-screen px-6 py-6 md:px-12 md:py-8 justify-between overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center w-full mb-6">
          <Link href="/" className="flex items-center gap-2.5 select-none group cursor-pointer">
            <img
              src="/images/logo.png"
              alt="MediMind Logo"
              className="h-9 w-auto object-contain rounded-xl shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="font-black text-xl tracking-tight">
              <span className="text-[#0047ba] dark:text-[#3b82f6]">Medi</span>
              <span className="text-[#00a396] dark:text-[#14b8a6]">Mind</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Language Toggle Pill */}
            <LanguageToggler />

            {/* Dark Mode Toggle */}
            <AppButton type="button" variant="outline" size="icon" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
              <span className="material-symbols-outlined text-[20px]">
                {mounted && resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </AppButton>
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

          {displayError && (<div className="w-full bg-error-container text-on-error-container p-3 rounded-lg mb-4 text-center font-body-md">
              {displayError}
            </div>)}

          <form className="space-y-5" onSubmit={handleLogin}>
            <FormField id="loginInput" type="text" label={t("auth.login.emailOrPhoneLabel")} placeholder={t("auth.login.emailOrPhonePlaceholder")} value={loginInput} onChange={(e) => setLoginInput(e.target.value)} onBlur={() => handleBlur("loginInput")} error={errors.loginInput} touched={!!errors.loginInput} icon={/^[0-9+\s()-]+$/.test(loginInput.trim()) ? "phone" : "mail"} dir={dir} required/>

            <PasswordInput id="password" label={<div className="flex justify-between items-center w-full">
                  <span className="font-['Inter'] text-sm md:text-base font-semibold text-on-surface">
                    {t("auth.login.passwordLabel")}
                  </span>
                  <a href="/forgot-password" className="text-xs text-primary font-semibold hover:underline">
                    {t("auth.login.forgotPassword")}
                  </a>
                </div>} placeholder={t("auth.login.passwordPlaceholder")} value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => handleBlur("password")} error={errors.password} touched={!!errors.password} showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)}/>

            {/* Submit */}
            <AppButton disabled={!isValid || loading} isLoading={loading} type="submit" variant="default" size="lg" className="w-full h-[58px] rounded-full text-base font-semibold mt-4 group" rightIcon={!loading && (<span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform rtl:rotate-180">
                    arrow_forward
                  </span>)}>
              {loading ? t("auth.login.signingInButton") : t("auth.login.signInButton")}
            </AppButton>

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
      <div className="hidden lg:flex w-full select-none">
        <Branding title={t("auth.login.brandingTitle")} description={t("auth.login.brandingDescription")} features={[
            { icon: "medication", text: t("auth.login.brandingF1") },
            { icon: "group", text: t("auth.login.brandingF2") },
            { icon: "insights", text: t("auth.login.brandingF3") },
            { icon: "shield", text: t("auth.login.brandingF4") },
        ]} variant="login"/>
      </div>
    </div>);
}
