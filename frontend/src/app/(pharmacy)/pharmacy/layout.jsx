'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useTranslation } from '@/shared/lib/i18nContext';
import { useRouter } from 'next/navigation';

export default function PharmacyLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const { locale } = useTranslation();
  const isAr = locale === 'ar';
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isPharmacist = user?.role === 'PHARMACIST' || user?.role === 'ADMIN';

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl animate-spin text-teal-400">progress_activity</span>
          <p className="text-xs font-semibold">{isAr ? 'جاري التحقق من ترخيص الصيدلية...' : 'Verifying Pharmacy Credentials...'}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isPharmacist) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">lock_person</span>
          </div>
          <h2 className="text-xl font-black text-white">
            {isAr ? 'دخول غير مصرح به - خاص بالصيدليات فقط' : 'Pharmacy Role Access Restricted'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isAr
              ? 'هذه البوابة والمسار مخصصان حصرياً للصيدليات الشريكة المعتمدة ولا يمكن لأي حساب آخر استعراضها.'
              : 'This portal & route group are strictly restricted to licensed partner pharmacies. Non-pharmacist accounts cannot access this area.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.replace(user?.role === 'PATIENT' ? '/home' : '/login')}
              className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs transition-all shadow-md"
            >
              {isAr ? 'العودة إلى الصفحة الرئيسية' : 'Return to Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
