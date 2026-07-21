'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { apiClient } from "@/shared/lib";
import { parseApiMessage } from "@/shared/lib/parseApiMessage";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  
  const [mounted, setMounted] = useState(false);
  const [localUser, setLocalUser] = useState(null);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(59);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch the latest full account details directly from backend to avoid any stale Redux state
  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        const res = await apiClient.get("/auth/verify-token");
        const userData = res.data?.data?.user;
        if (userData) {
          setLocalUser(userData);
        }
      } catch (err) {
        console.error("Failed to fetch fresh verify-token account details:", err);
      }
    };

    if (mounted && isAuthenticated) {
      fetchLatestUser();
    }
  }, [mounted, isAuthenticated]);

  // Auto trigger first OTP send when user details are fully ready
  const activeUser = localUser || user;
  
  useEffect(() => {
    if (mounted && isAuthenticated && activeUser && (activeUser.email || activeUser.phone)) {
      sendOtpCode();
    }
  }, [mounted, isAuthenticated, activeUser?.email, activeUser?.phone]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) {
      setIsResendDisabled(false);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const sendOtpCode = async () => {
    if (!activeUser) return;
    setError(null);
    setSuccessMessage(null);
    try {
      const type = activeUser.email ? "EMAIL" : (activeUser.phone ? "PHONE" : "EMAIL");
      const target = activeUser.email || activeUser.phone;
      if (!target) {
        throw new Error("No contact destination (email or phone) found for this account.");
      }
      await apiClient.post("/auth/otp/send", { target, type });
      setSuccessMessage(type === "EMAIL"
        ? "We've sent a 6-digit verification code to your email."
        : "We've sent a 6-digit verification code to your phone number."
      );
      setTimer(59);
      setIsResendDisabled(true);
    } catch (err) {
      const msg = parseApiMessage(err.response?.data?.error?.message || err.message);
      setError(msg || "Failed to send verification code.");
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next element
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (pasteData.length === 6 && /^\d+$/.test(pasteData)) {
      const pasteArray = pasteData.split("");
      setOtp(pasteArray);
      inputRefs.current[5].focus();
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    setError(null);
    setSuccessMessage(null);
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const type = activeUser.email ? "EMAIL" : (activeUser.phone ? "PHONE" : "EMAIL");
      await apiClient.post("/auth/otp/verify", { type, code });
      
      // Update session and redirect
      window.location.href = activeUser.role === "PATIENT" ? "/home" : "/dashboard";
    } catch (err) {
      const msg = parseApiMessage(err.response?.data?.messages || err.response?.data?.error?.message || err.message);
      setError(msg || "Invalid code. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-on-surface font-semibold text-lg">Loading...</div>
      </div>
    );
  }

  const targetLabel = activeUser?.email || activeUser?.phone || "your address";

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-['Inter'] overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/40 rounded-[24px] p-8 md:p-10 shadow-lg relative overflow-hidden">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-container/10 text-primary-container rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-container/20">
              <span className="material-symbols-outlined text-[32px]">lock</span>
            </div>
            <h1 className="font-['Manrope'] text-3xl font-extrabold text-on-surface mb-2">Verify Your Account</h1>
            <p className="text-base text-on-surface-variant leading-relaxed">
              We've sent a 6-digit verification code to <span className="font-semibold text-on-surface block mt-1">{targetLabel}</span>
            </p>
          </div>

          {error && (
            <div className="w-full bg-error-container text-on-error-container p-4 rounded-[16px] mb-6 text-center font-medium text-sm shadow-xs border border-error/10">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="w-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-[16px] mb-6 text-center font-medium text-sm border border-emerald-500/20">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-between gap-2.5 md:gap-3" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold rounded-2xl border border-outline-variant focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/30"
                  aria-label={`Digit ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary text-on-primary font-bold rounded-2xl text-base md:text-lg hover:bg-primary/95 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Verifying..." : "Verify & Continue"}
            </button>

            <div className="text-center pt-2">
              <p className="text-sm text-on-surface-variant font-medium">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={sendOtpCode}
                  disabled={isResendDisabled}
                  className="text-primary font-semibold hover:underline transition-all disabled:opacity-50 disabled:hover:no-underline cursor-pointer"
                >
                  Resend {isResendDisabled && `(${Math.floor(timer / 60)}:${timer % 60 < 10 ? "0" : ""}${timer % 60})`}
                </button>
              </p>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-outline-variant/30 flex items-center justify-between">
            <button
              type="button"
              onClick={logout}
              className="text-sm font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Logout</span>
            </button>
            
            <div className="flex items-center gap-1 grayscale opacity-50 text-[11px] font-medium text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>Secure Health Data Protocol</span>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
