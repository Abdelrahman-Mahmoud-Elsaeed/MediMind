'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { loginSchema } from "../validation/authValidation";

export default function LoginComponent() {
  const router = useRouter();
  const { login, loading, error, resetError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});

  const validationResult = loginSchema.safeParse({ email, password });
  const errors = {};
  if (!validationResult.success) {
    validationResult.error.issues.forEach((issue) => {
      const path = issue.path[0];
      if (!errors[path]) {
        errors[path] = issue.message;
      }
    });
  }
  const isValid = validationResult.success;

  const handleLogin = async (e) => {
    e.preventDefault();
    resetError();
    if (!isValid) return;

    try {
      const resultAction = await login({ email, password });
      if (resultAction.type === "auth/login/fulfilled") {
        router.push("/dashboard");
      }
    } catch (err) {
    }
  };

  const displayError = error;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const emailHasError = touched.email && errors.email;
  const passwordHasError = touched.password && errors.password;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Login Container */}
      <main className="relative z-10 w-full max-w-md px-margin-mobile md:px-0">
        <div className="bg-surface-container/50 backdrop-blur-2xl border border-outline-variant/30 rounded-xl p-8 shadow-2xl flex flex-col items-center">
          {/* Logo area */}
          <div className="mb-8 w-32 h-32 flex items-center justify-center">
            <img
              alt="MediMind Logo"
              className="w-full h-full object-contain"
              width={128}
              height={128}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-OugZQPn5PYc6lK1g2NgI6-0NcCxKaNLvBpSeA0B0oc6uFyAmJJuQo6Bnzyu2nKJhAk0UWSeHYkE2bGlsnCt3Jx92b0fCfN_4wtCu3oGHGJ_g4bdZUjLsRMcyAxNDk7W2mdxKjW8STG_-SEwQ8vqVfg04cXdgJ-53v8rBxBrwi_I8x68F2qbWoMw_F5s2bFq0RZ1iYrIpHsH1erlyWqi83HcFY1ZYpkz09WGIX-1jFrTz4wfNpO3fgQ"
            />
          </div>

          <div className="text-center mb-8 w-full">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              Welcome Back
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Sign in to continue to your care portal
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
                Email Address
              </label>
              <div className={`relative rounded-lg transition-all duration-200 bg-surface-container-high border ${emailHasError
                  ? "border-error focus-within:shadow-[0_0_0_1px_var(--error),0_0_12px_0_var(--error)] focus-within:border-error"
                  : "border-outline-variant/50 focus-within:shadow-[0_0_0_1px_var(--color-primary),0_0_12px_0_var(--color-primary)] focus-within:border-primary"
                }`}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    mail
                  </span>
                </div>
                <input
                  className="block w-full pl-10 py-3 bg-transparent border-none rounded-lg text-on-surface focus:ring-0 focus:outline-none font-body-md placeholder-outline-variant"
                  id="email"
                  placeholder="provider@medimind.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                />
              </div>
              {emailHasError && (
                <p className="text-error font-body-sm text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  className="font-label-md text-label-md text-on-surface-variant block"
                  htmlFor="password"
                >
                  Password
                </label>
                <a
                  className="font-label-md text-label-md text-primary hover:text-primary-fixed transition-colors"
                  href="#"
                >
                  Forgot Password?
                </a>
              </div>
              <div className={`relative rounded-lg transition-all duration-200 bg-surface-container-high border ${passwordHasError
                  ? "border-error focus-within:shadow-[0_0_0_1px_var(--error),0_0_12px_0_var(--error)] focus-within:border-error"
                  : "border-outline-variant/50 focus-within:shadow-[0_0_0_1px_var(--color-primary),0_0_12px_0_var(--color-primary)] focus-within:border-primary"
                }`}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    lock
                  </span>
                </div>
                <input
                  className="block w-full pl-10 py-3 bg-transparent border-none rounded-lg text-on-surface focus:ring-0 focus:outline-none font-body-md placeholder-outline-variant"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur("password")}
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
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
              {passwordHasError && (
                <p className="text-error font-body-sm text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Sign In Button */}
            <button
              className="w-full py-3 px-4 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-fixed hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={!isValid || loading}
            >
              {loading ? "Signing In..." : "Sign In"}
              {!loading && (
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  arrow_forward
                </span>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
            Don&apos;t have an account?
            <Link
              className="text-primary hover:text-primary-fixed font-label-md font-semibold ml-1 transition-colors"
              href="/auth/register"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
