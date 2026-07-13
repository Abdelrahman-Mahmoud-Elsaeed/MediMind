"use client";

import { useState, useEffect } from "react";
import { Logo, Button, Card, Badge, Spinner } from "@/shared/components";
import { relationshipsApi } from "@/shared/lib/api";

export default function InvitePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invitation, setInvitation] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const [relationType, setRelationType] = useState("");
  const [invitedPhone, setInvitedPhone] = useState("");

  useEffect(() => {
    loadRelationships();
  }, []);

  async function loadRelationships() {
    try {
      const res = await relationshipsApi.getMyRelationships();
      setRelationships(res.data || []);
    } catch (err) {
      console.error("Load relationships error:", err);
    }
  }

  async function generateInvitation() {
    setLoading(true);
    setError("");
    try {
      const data = {};
      if (relationType) data.relationType = relationType;
      if (invitedPhone) {
        // Normalize phone
        let phone = invitedPhone.replace(/\s/g, "");
        if (phone.startsWith("0")) phone = "+2" + phone;
        else if (!phone.startsWith("+20")) phone = "+20" + phone;
        data.invitedPhone = phone;
      }
      const res = await relationshipsApi.createInvitation(data);
      setInvitation(res.data);
    } catch (err) {
      setError(err.message || "حدث خطأ في توليد الدعوة");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(id) {
    if (!confirm("متأكد إنك عاوز تشيل هذا الشخص من متابعتك؟")) return;
    try {
      await relationshipsApi.revoke(id);
      loadRelationships();
    } catch (err) {
      alert("حدث خطأ");
    }
  }

  function copyLink() {
    if (!invitation?.invitationUrl) return;
    navigator.clipboard.writeText(invitation.invitationUrl);
    alert("تم نسخ الرابط ✓");
  }

  function shareWhatsApp() {
    if (!invitation?.invitationUrl) return;
    const text = `مرحباً، أنا بدعوك تتابع أدويتي على منصة وفاء 💊\n\nاضغط على الرابط ده: ${invitation.invitationUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <main className="min-h-screen bg-background pb-20">

      <header className="bg-surface border-b border-outline">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/dashboard" className="text-on-surface-variant flex items-center gap-1">
            <span className="icon-flip">→</span> رجوع
          </a>
          <h1 className="text-xl font-bold">دعوة الأهل</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-lg">
            {error}
          </div>
        )}

        {/* ===== Generate Invitation ===== */}
        <Card>
          <h2 className="text-lg font-bold mb-2">📲 ادعِ أهلك يتابعوك</h2>
          <p className="text-on-surface-variant text-sm mb-4">
            ولّد QR code وابعتله لحد من أهلك، هيقدر يشوف جدول أدويتك ويطمن عليك في أي وقت.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">صلة القرابة (اختياري)</label>
              <select
                value={relationType}
                onChange={e => setRelationType(e.target.value)}
                className="input"
              >
                <option value="">اختر...</option>
                <option value="son">ابن</option>
                <option value="daughter">ابنة</option>
                <option value="spouse">زوج/زوجة</option>
                <option value="parent">أب/أم</option>
                <option value="sibling">أخ/أخت</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">رقم موبايل المدعو (اختياري)</label>
              <input
                type="tel"
                value={invitedPhone}
                onChange={e => setInvitedPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="input"
                dir="ltr"
              />
              <p className="text-xs text-on-surface-variant mt-1">
                لو حطيت الرقم، هيتبعت له WhatsApp تلقائياً
              </p>
            </div>

            <Button
              onClick={generateInvitation}
              loading={loading}
              className="w-full"
            >
              {loading ? "جاري التوليد..." : "🎲 ولّد QR Code"}
            </Button>
          </div>
        </Card>

        {/* ===== QR Code Display ===== */}
        {invitation && (
          <Card accent="primary">
            <h3 className="font-bold mb-4 text-center">📱 امسح الـ QR ده</h3>

            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-2xl shadow-md">
                <img
                  src={invitation.qrCode}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              </div>
            </div>

            <div className="bg-info-container text-on-info-container p-3 rounded-lg text-sm text-center mb-4">
              💡 افتح كاميرا الموبايل وامسح الـ QR، هيوصلك لصفحة قبول الدعوة
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Button size="sm" variant="secondary" onClick={copyLink}>
                📋 نسخ الرابط
              </Button>
              <Button size="sm" variant="success" onClick={shareWhatsApp}>
                💬 إرسال WhatsApp
              </Button>
            </div>

            {/* Expiry */}
            <p className="text-xs text-on-surface-variant text-center">
              ⏰ الدعوة دي صالحة لمدة 7 أيام (حتى {new Date(invitation.expiresAt).toLocaleDateString('ar-EG')})
            </p>
          </Card>
        )}

        {/* ===== Current Relationships ===== */}
        <Card>
          <h3 className="font-bold mb-4">👥 الأشخاص المرتبطين بيك</h3>

          {relationships.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-6">
              لسه مفيش حد مرتبط بيك. ابدأ بدعوة حد من أهلك 👆
            </p>
          ) : (
            <div className="space-y-3">
              {relationships.map(rel => (
                <div key={rel._id} className="flex items-center gap-3 p-3 bg-surface-variant rounded-lg">
                  <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-xl">
                    👤
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">
                      {rel.caregiver?.name || rel.invitedPhone || "بانتظار القبول"}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {rel.relationType ? getRelationLabel(rel.relationType) : "بدون صلة"} •{" "}
                      {new Date(rel.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <div>
                    {rel.status === 'PENDING' && <Badge variant="warning">⏳ في الانتظار</Badge>}
                    {rel.status === 'ACCEPTED' && <Badge variant="success">✓ مقبول</Badge>}
                  </div>
                  <button
                    onClick={() => handleRevoke(rel._id)}
                    className="w-8 h-8 bg-error-container text-on-error-container rounded-lg"
                    title="إلغاء"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
    </main>
  );
}

function getRelationLabel(type) {
  const labels = {
    son: "ابن",
    daughter: "ابنة",
    spouse: "زوج/زوجة",
    parent: "أب/أم",
    sibling: "أخ/أخت",
    other: "أخرى"
  };
  return labels[type] || "بدون";
}
