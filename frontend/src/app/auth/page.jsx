"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, setAccessToken } from "@/shared/lib/api";

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    const cleanPhone = phone.replace(/\s/g, "");
    if (!cleanPhone) { setError("برجاء إدخال رقم الموبايل"); return; }

    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith("0")) formattedPhone = "+2" + formattedPhone;
    else if (!formattedPhone.startsWith("+20")) formattedPhone = "+20" + formattedPhone;

    setLoading(true);
    try {
      await authApi.sendOtp(formattedPhone, "sms");
      setPhone(formattedPhone);
      setStep(2);
      startResendTimer(60);
    } catch (err) {
      if (err.code === "OTP_COOLDOWN") setError(`استنى ${err.waitSeconds} ثانية قبل طلب كود جديد`);
      else if (err.status === 429) setError("محاولات كتيرة جداً — استنى دقيقة وحاول تاني");
      else setError(err.message || "حدث خطأ، برجاء المحاولة مرة أخرى");
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length !== 6) { setError("برجاء إدخال الكود المكون من 6 أرقام"); return; }

    setLoading(true);
    try {
      const res = await authApi.verifyOtp(phone, code);
      const { accessToken, user } = res.data;
      setAccessToken(accessToken);

      switch (user.role) {
        case "PATIENT": router.push("/dashboard"); break;
        case "CAREGIVER": router.push("/companion"); break;
        case "PHARMACY": router.push("/pharmacy"); break;
        case "DOCTOR": router.push("/doctor"); break;
        case "ADMIN": router.push("/admin"); break;
        default: router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message || "الكود غير صحيح، برجاء المحاولة مرة أخرى");
    } finally { setLoading(false); }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp]; newOtp[index] = value; setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpKeydown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus();
  };

  const startResendTimer = (seconds) => {
    setResendTimer(seconds);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp(["", "", "", "", "", ""]);
    handleSendOtp({ preventDefault: () => {} });
  };

  return (
    <main className="min-h-screen flex">
      {/* ===== Left side — Brand (Desktop only) ===== */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 text-center text-white max-w-md">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/15 backdrop-blur-sm rounded-3xl mb-6 border border-white/20">
            <span className="text-5xl">💊</span>
          </div>
          <h1 className="text-5xl font-black mb-4">وفاء</h1>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            منصة متكاملة لإدارة الأدوية ومتابعة المرضى المزمنين في الوطن العربي
          </p>
          <div className="grid grid-cols-3 gap-4 mt-12">
            <div className="text-center">
              <div className="text-3xl font-black">9M+</div>
              <div className="text-xs opacity-75">مريض سكر</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black">26M+</div>
              <div className="text-xs opacity-75">مريض ضغط</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black">70K+</div>
              <div className="text-xs opacity-75">صيدلية</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Right side — Form ===== */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-3 shadow-lg">
              <span className="text-3xl">💊</span>
            </div>
            <h1 className="text-2xl font-black">وفاء</h1>
          </div>

          <div className="card shadow-lg">

            {step === 1 && (
              <form onSubmit={handleSendOtp}>
                <h2 className="text-xl font-bold mb-1 text-center">تسجيل الدخول</h2>
                <p className="text-on-surface-variant text-sm mb-6 text-center">
                  أدخل رقم موبايلك وهنرسلك كود تحقق
                </p>

                <label className="block text-sm font-semibold mb-2">رقم الموبايل</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="input pr-16"
                    dir="ltr"
                    autoComplete="tel"
                    autoFocus
                  />
                  <span className="absolute top-1/2 -translate-y-1/2 right-4 text-on-surface-variant font-semibold text-sm">
                    🇪🇬 +20
                  </span>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn btn-primary w-full mt-6">
                  {loading ? "جاري الإرسال..." : "أرسل الكود"}
                </button>

                <div className="mt-6 p-3 bg-info-container text-on-info-container rounded-lg text-xs">
                  💡 <strong>للتجربة:</strong> استخدم الأرقام دي:
                  <br />
                  مريض: +201001234567 | أهل: +201001234570
                  <br />
                  صيدلية: +201001234572 | دكتور: +201001234573
                  <br />
                  الـ OTP هتلاقيه في الـ terminal بتاع الـ backend
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <button type="button" onClick={() => setStep(1)}
                  className="text-sm text-on-surface-variant mb-4 flex items-center gap-1">
                  <span className="icon-flip">→</span> تغيير الرقم
                </button>

                <h2 className="text-xl font-bold mb-1 text-center">أدخل الكود</h2>
                <p className="text-on-surface-variant text-sm mb-2 text-center">
                  أرسلنا كود تحقق إلى <span dir="ltr" className="font-semibold">{phone}</span>
                </p>
                <p className="text-xs text-info mb-6">
                  💡 الـ OTP هتلاقيه في الـ terminal بتاع الـ backend
                </p>

                <div className="flex gap-1.5 justify-center mb-6" dir="ltr">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeydown(i, e)}
                      className="w-10 h-12 md:w-12 md:h-14 text-center text-xl md:text-2xl font-bold border-2 border-outline rounded-lg focus:border-primary focus:outline-none"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn btn-primary w-full">
                  {loading ? "جاري التحقق..." : "تحقق"}
                </button>

                <div className="text-center mt-6 text-sm">
                  {resendTimer > 0 ? (
                    <span className="text-on-surface-variant">
                      إعادة الإرسال خلال {resendTimer} ثانية
                    </span>
                  ) : (
                    <button type="button" onClick={handleResend}
                      className="text-secondary font-semibold underline">
                      إعادة إرسال الكود
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-on-surface-variant mt-6">
            💊 وفاء — نبني المستقبل الصحي للوطن العربي
          </p>
        </div>
      </div>
    </main>
  );
}
