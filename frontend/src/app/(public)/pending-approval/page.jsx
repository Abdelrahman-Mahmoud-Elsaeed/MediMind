"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/ui/sonner";
import {
  Clock,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  LogOut,
  HelpCircle,
  Stethoscope,
  Building2,
  UserCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { Card, Button, Badge } from "@/shared/components/ui";

export default function PendingApprovalPage() {
  const router = useRouter();
  const { user, logout, isAuthLoading } = useAuth();
  const { locale } = useTranslation();
  const isAr = locale === "ar";
  const queryClient = useQueryClient();

  const [isChecking, setIsChecking] = useState(false);

  const userRole = user?.role ? String(user.role).toUpperCase() : "";

  const getRoleTitle = (role) => {
    switch (role) {
      case "DOCTOR":
        return isAr ? "طبيب متخصص" : "Medical Doctor";
      case "PHARMACIST":
        return isAr ? "صيدلي / صيدلية" : "Pharmacist & Pharmacy";
      case "PROFESSIONAL_CAREGIVER":
      case "CAREGIVER":
        return isAr ? "مقدم رعاية محترف" : "Professional Caregiver";
      default:
        return isAr ? "مزود خدمة" : "Service Provider";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "DOCTOR":
        return <Stethoscope className="w-6 h-6 text-teal-500" />;
      case "PHARMACIST":
        return <Building2 className="w-6 h-6 text-emerald-500" />;
      default:
        return <UserCheck className="w-6 h-6 text-blue-500" />;
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      const updatedUser = queryClient.getQueryData(["auth", "user"]);

      if (updatedUser?.isApproved || updatedUser?.isVerified) {
        toast.success(
          isAr
            ? "مبروك! تم اعتماد حسابك بنجاح بواسطة الإدارة 🎉"
            : "Congratulations! Your account has been approved by admin! 🎉"
        );
        const role = String(updatedUser.role).toUpperCase();
        if (role === "PHARMACIST") {
          router.replace("/pharmacy");
        } else if (role === "ADMIN") {
          router.replace("/admin-dashboard");
        } else {
          router.replace("/dashboard");
        }
      } else {
        toast.info(
          isAr
            ? "حسابك ما زال قيد المراجعة والتدقيق من قِبل المسؤولين."
            : "Your account is still pending verification by MediMind administrators."
        );
      }
    } catch (err) {
      toast.error(isAr ? "فشل التحقق من حالة الحساب" : "Failed to check account status");
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-teal-500 selection:text-white" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/20">
            M
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white block leading-none">
              MediMind
            </span>
            <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-wider">
              {isAr ? "منصة الرعاية الصحية" : "Healthcare Platform"}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>{isAr ? "تسجيل الخروج" : "Sign Out"}</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center my-8">
        <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-8">
          
          {/* Top Decorative Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Status Header Badge */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse shadow-xl shadow-amber-500/10">
                <Clock className="w-10 h-10" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                !
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-3">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>{isAr ? "الحساب قيد المراجعة من الإدارة" : "Pending Admin Approval"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isAr ? "مرحباً بك في MediMind" : "Welcome to MediMind"}
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto font-medium">
                {isAr
                  ? "شكراً لتسجيلك كـ مزود خدمة طليعي. حسابك حالياً قيد المراجعة والتدقيق بواسطة إدارة المنصة للتحقق من التراخيص والبيانات المقدمة."
                  : "Thank you for registering. Your provider account is currently undergoing verification by MediMind administrators to confirm licensing & credentials."}
              </p>
            </div>
          </div>

          {/* Account & Role Summary Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                {isAr ? "تفاصيل الحساب المسجل" : "Registered Account Info"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold">
                {getRoleTitle(userRole)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                  {getRoleIcon(userRole)}
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">
                    {isAr ? "نوع الحساب" : "Account Role"}
                  </span>
                  <span className="font-extrabold text-slate-200">{getRoleTitle(userRole)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">
                    {isAr ? "البريد / الهاتف" : "Email / Phone"}
                  </span>
                  <span className="font-extrabold text-slate-200 truncate max-w-[160px] block">
                    {user?.email || user?.phone || (isAr ? "حساب جديد" : "New Provider")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              {isAr ? "مراحل الاعتماد والتفعيل" : "Verification Timeline"}
            </h3>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl text-xs text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-bold">
                  {isAr ? "١. إنشاء الحساب وتقديم المستندات والتراخيص" : "1. Account & Licensing Documents Submitted"}
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl text-xs text-amber-300">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
                <span className="font-bold">
                  {isAr ? "٢. مراجعة الترخيص والبيانات بواسطة الإدارة (جاري الآن)" : "2. Admin Review & Verification (In Progress)"}
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-3 bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-2xl text-xs text-slate-500">
                <Lock className="w-5 h-5 text-slate-600 shrink-0" />
                <span className="font-medium">
                  {isAr ? "٣. تفعيل الحساب والوصول الكامل للوحة التحكم" : "3. Account Activation & Full Portal Access"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="flex-1 py-4 px-6 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-teal-500/20 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
              <span>{isAr ? "التحقق من حالة الاعتماد" : "Check Approval Status"}</span>
            </button>

            <a
              href="https://wa.me/201000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-teal-400" />
              <span>{isAr ? "الدعم الفني" : "Support"}</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto text-center text-xs text-slate-600 py-4">
        &copy; {new Date().getFullYear()} MediMind Inc. {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}
      </footer>
    </div>
  );
}
