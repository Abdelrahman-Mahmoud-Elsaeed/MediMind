"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo, Button, Card, Badge, Spinner } from "@/shared/components";
import { relationshipsApi, authApi } from "@/shared/lib/api";

export default function AcceptInvitePage({ params }) {
  const { token } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    loadInvitation();
    checkAuth();
  }, []);

  async function loadInvitation() {
    try {
      const res = await relationshipsApi.getInvitation(token);
      setInvitation(res.data);
    } catch (err) {
      setError(err.message || "الدعوة غير صالحة أو منتهية");
    } finally {
      setLoading(false);
    }
  }

  async function checkAuth() {
    try {
      await authApi.getMe();
      setIsLoggedIn(true);
    } catch {
      setIsLoggedIn(false);
    }
  }

  async function handleAccept() {
    setAccepting(true);
    try {
      await relationshipsApi.acceptInvitation(token);
      setAccepted(true);
      setTimeout(() => router.push("/companion"), 2000);
    } catch (err) {
      setError(err.message || "حدث خطأ في قبول الدعوة");
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  }

  if (error && !invitation) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-xl font-bold mb-2">الدعوة غير صالحة</h1>
          <p className="text-on-surface-variant mb-6">{error}</p>
          <Link href="/dashboard">
            <Button>الذهاب للرئيسية</Button>
          </Link>
        </Card>
      </main>
    );
  }

  if (accepted) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card accent="success" className="max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-black mb-2">تم قبول الدعوة!</h1>
          <p className="text-on-surface-variant mb-4">
            تم ربطك بـ <strong>{invitation.patientName}</strong> بنجاح.
            تقدر دلوقتي تتابع أدويته وتطمن عليه.
          </p>
          <p className="text-xs text-on-surface-variant">جاري التحويل...</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl mb-3 shadow-lg">
            <span className="text-4xl">💊</span>
          </div>
          <h1 className="text-2xl font-black">وفاء</h1>
        </div>

        <Card accent="primary">
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">👋</div>
            <h2 className="text-xl font-bold mb-2">أنت مدعو تتابع مريض</h2>
            <p className="text-on-surface-variant">
              <strong className="text-on-background text-lg">{invitation.patientName}</strong> بدعاك تتابع أدويته على وفاء
            </p>
          </div>

          {/* Permissions */}
          <div className="bg-info-container text-on-info-container p-3 rounded-lg mb-4">
            <p className="text-sm font-semibold mb-2">إنت هتقدر:</p>
            <ul className="text-xs space-y-1">
              {invitation.permissions?.canViewMedicalRecords && (
                <li>✓ تشوف جدول أدوية المريض</li>
              )}
              {invitation.permissions?.canConfirmDoses && (
                <li>✓ تأكد أخذ الجرعات</li>
              )}
              {invitation.permissions?.canAddMedication && (
                <li>✓ تضيف أدوية جديدة</li>
              )}
              {invitation.permissions?.canReceiveAlerts && (
                <li>✓ تستلم تنبيهات لو المريض مخدش الدواء</li>
              )}
            </ul>
          </div>

          {/* Expiry */}
          <div className="text-xs text-on-surface-variant text-center mb-4">
            ⏰ الدعوة صالحة حتى {new Date(invitation.expiresAt).toLocaleDateString('ar-EG', {
              day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
            })}
          </div>

          {/* Actions */}
          {!isLoggedIn ? (
            <div>
              <p className="text-sm text-on-surface-variant mb-3 text-center">
                عشان تقبل الدعوة، لازم تسجل دخول الأول
              </p>
              <Link href={`/auth?redirect=/accept-invite/${token}`}>
                <Button className="w-full">تسجيل الدخول / إنشاء حساب</Button>
              </Link>
            </div>
          ) : (
            <Button
              onClick={handleAccept}
              loading={accepting}
              className="w-full"
            >
              {accepting ? "جاري القبول..." : "✓ قبول الدعوة"}
            </Button>
          )}

          {error && (
            <div className="mt-3 p-3 bg-error-container text-on-error-container rounded-lg text-sm text-center">
              {error}
            </div>
          )}
        </Card>

        <p className="text-center text-xs text-on-surface-variant mt-4">
          💊 وفاء — منصة إدارة الأدوية ومتابعة المرضى
        </p>
      </div>
    </main>
  );
}
