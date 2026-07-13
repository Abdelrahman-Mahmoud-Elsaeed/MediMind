"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo, Button, Card, Input, Badge } from "@/shared/components";
import { medicationsApi } from "@/shared/lib/api";

const STEPS = [
  { num: 1, title: "اسم الدواء", icon: "💊" },
  { num: 2, title: "الجرعة والميعاد", icon: "⏰" },
  { num: 3, title: "الصيدلية", icon: "🏪" }
];

const COMMON_MEDS = [
  { name: "Glucophage", nameAr: "جلوكوفاج", for: "سكر" },
  { name: "Concor", nameAr: "كونكور", for: "ضغط" },
  { name: "Aspirin", nameAr: "أسبرين", for: "قلب" },
  { name: "Crestor", nameAr: "كريستور", for: "كوليسترول" },
  { name: "L-thyroxine", nameAr: "إل-ثيروكسين", for: "غدة" }
];

export default function AddMedicationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    formType: "TABLET",
    isChronic: false,

    inventory: {
      initialQuantity: 30,
      currentQuantity: 30,
      doseAmount: 1,
      unit: "pill",
      refillThreshold: 5
    },

    instructions: {
      relationToMeals: "NONE",
      notes: ""
    },

    schedule: {
      frequency: "DAILY",
      dosesPerDay: 1,
      firstDoseTime: "08:00",
      timesOfDay: ["08:00"]
    },

    pharmacyId: "",
    expirationDate: ""
  });

  // ===== Handlers =====
  function updateField(path, value) {
    setFormData(prev => {
      const updated = { ...prev };
      const keys = path.split(".");
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  }

  function addTimeSlot() {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        dosesPerDay: prev.schedule.dosesPerDay + 1,
        timesOfDay: [...prev.schedule.timesOfDay, "20:00"]
      }
    }));
  }

  function removeTimeSlot(index) {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        dosesPerDay: Math.max(1, prev.schedule.dosesPerDay - 1),
        timesOfDay: prev.schedule.timesOfDay.filter((_, i) => i !== index)
      }
    }));
  }

  function updateTimeSlot(index, value) {
    setFormData(prev => {
      const times = [...prev.schedule.timesOfDay];
      times[index] = value;
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          timesOfDay: times,
          firstDoseTime: times[0]
        }
      };
    });
  }

  // ===== Submit =====
  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...formData,
        expirationDate: formData.expirationDate
          ? new Date(formData.expirationDate).toISOString()
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };
      if (formData.pharmacyId) delete payload.pharmacyId; // handled separately

      const res = await medicationsApi.create(payload);
      router.push(`/medications/${res.data._id}`);
    } catch (err) {
      setError(err.message || "حدث خطأ في حفظ الدواء");
    } finally {
      setLoading(false);
    }
  }

  // ===== Render =====
  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <aside className="app-sidebar p-4">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-outline">
          <Logo size="sm" />
          <p className="font-bold">وفاء</p>
        </div>
        <nav className="space-y-1">
          {[
            { label: "الرئيسية", icon: "🏠", href: "/dashboard" },
            { label: "أدويتي", icon: "💊", href: "/medications", active: true },
            { label: "التقارير", icon: "📊", href: "/reports" },
            { label: "AI Insights", icon: "🤖", href: "/ai-insights" },
            { label: "الإعدادات", icon: "⚙️", href: "/settings" }
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <div className={`nav-item ${item.active ? 'active' : ''}`}>
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="app-main pb-20 lg:pb-0">
        <header className="bg-surface border-b border-outline sticky top-0 z-10 glass">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/dashboard">
              <button className="text-on-surface-variant flex items-center gap-1 hover:text-primary">
                <span className="icon-flip">→</span> الرئيسية
              </button>
            </Link>
            <h1 className="font-bold text-sm lg:text-base">إضافة دواء جديد</h1>
            <Link href="/medications">
              <button className="text-on-surface-variant flex items-center gap-1 hover:text-primary">
                أدويتي <span>←</span>
              </button>
            </Link>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Steps Indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s.num ? "bg-primary text-on-primary" : "bg-surface-variant text-on-surface-variant"
                }`}>
                  {step > s.num ? "✓" : s.num}
                </div>
                <span className={`text-xs ${step >= s.num ? "font-bold" : "text-on-surface-variant"}`}>
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-1 flex-1 mx-2 rounded ${
                  step > s.num ? "bg-primary" : "bg-surface-variant"
                }`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* ===== Step 1: Name & Form ===== */}
        {step === 1 && (
          <Card>
            <h2 className="text-lg font-bold mb-4">💊 اسم الدواء ونوعه</h2>

            <div className="space-y-4">
              <Input
                label="اسم الدواء *"
                value={formData.name}
                onChange={e => updateField("name", e.target.value)}
                placeholder="مثال: Glucophage"
              />

              <Input
                label="الاسم بالعربي (اختياري)"
                value={formData.nameAr}
                onChange={e => updateField("nameAr", e.target.value)}
                placeholder="مثال: جلوكوفاج"
              />

              {/* Common Medications Quick Pick */}
              <div>
                <p className="text-sm font-semibold mb-2">أو اختر من الأدوية الشائعة:</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_MEDS.map(med => (
                    <button
                      key={med.name}
                      onClick={() => {
                        updateField("name", med.name);
                        updateField("nameAr", med.nameAr);
                      }}
                      className="px-3 py-2 bg-primary-container text-on-primary-container rounded-lg text-sm hover:bg-primary/30"
                    >
                      {med.nameAr} <span className="text-xs">({med.for})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">نوع الدواء *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { v: "TABLET", label: "أقراص", icon: "💊" },
                    { v: "CAPSULE", label: "كبسولات", icon: "💊" },
                    { v: "SYRUP", label: "شراب", icon: "🧪" },
                    { v: "INJECTION", label: "حقن", icon: "💉" },
                    { v: "DROP", label: "نقط", icon: "💧" },
                    { v: "CREAM", label: "كريم", icon: "🧴" },
                    { v: "INHALER", label: "بخاخ", icon: "🌬️" },
                    { v: "OTHER", label: "أخرى", icon: "📦" }
                  ].map(t => (
                    <button
                      key={t.v}
                      onClick={() => updateField("formType", t.v)}
                      className={`p-3 rounded-lg border-2 text-center ${
                        formData.formType === t.v
                          ? "border-primary bg-primary-container"
                          : "border-outline bg-surface"
                      }`}
                    >
                      <div className="text-2xl mb-1">{t.icon}</div>
                      <div className="text-xs">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isChronic}
                  onChange={e => updateField("isChronic", e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-sm">دواء مزمن (استمرارية بدون تاريخ انتهاء)</span>
              </label>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setStep(2)}
                disabled={!formData.name}
              >
                التالي ←
              </Button>
            </div>
          </Card>
        )}

        {/* ===== Step 2: Dosage & Schedule ===== */}
        {step === 2 && (
          <Card>
            <h2 className="text-lg font-bold mb-4">⏰ الجرعة والميعاد</h2>

            <div className="space-y-4">
              {/* Inventory */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="الكمية الحالية"
                  type="number"
                  value={formData.inventory.currentQuantity}
                  onChange={e => updateField("inventory.currentQuantity", parseInt(e.target.value))}
                  min="0"
                />
                <Input
                  label="الجرعة في كل مرة"
                  type="number"
                  step="0.5"
                  value={formData.inventory.doseAmount}
                  onChange={e => updateField("inventory.doseAmount", parseFloat(e.target.value))}
                  min="0.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">وحدة القياس</label>
                <div className="flex gap-2">
                  {[
                    { v: "pill", label: "قرص" },
                    { v: "ml", label: "مل" },
                    { v: "mg", label: "مجم" },
                    { v: "drop", label: "نقطة" }
                  ].map(u => (
                    <button
                      key={u.v}
                      onClick={() => updateField("inventory.unit", u.v)}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        formData.inventory.unit === u.v
                          ? "bg-primary text-on-primary"
                          : "bg-surface border border-outline"
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule Times */}
              <div>
                <label className="block text-sm font-semibold mb-2">مواعيد الجرعات</label>
                <div className="space-y-2">
                  {formData.schedule.timesOfDay.map((time, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={e => updateTimeSlot(i, e.target.value)}
                        className="input flex-1"
                      />
                      {formData.schedule.timesOfDay.length > 1 && (
                        <button
                          onClick={() => removeTimeSlot(i)}
                          className="w-12 h-12 bg-error-container text-on-error-container rounded-lg"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {formData.schedule.timesOfDay.length < 6 && (
                  <button
                    onClick={addTimeSlot}
                    className="mt-2 text-sm text-primary font-semibold"
                  >
                    + إضافة ميعاد
                  </button>
                )}
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-semibold mb-2">علاقة بالطعام</label>
                <select
                  value={formData.instructions.relationToMeals}
                  onChange={e => updateField("instructions.relationToMeals", e.target.value)}
                  className="input"
                >
                  <option value="NONE">بدون قيود</option>
                  <option value="BEFORE_MEALS">قبل الأكل</option>
                  <option value="AFTER_MEALS">بعد الأكل</option>
                  <option value="WITH_FOOD">مع الأكل</option>
                  <option value="ON_EMPTY_STOMACH">على معدة فارغة</option>
                </select>
              </div>

              <Input
                label="ملاحظات (اختياري)"
                value={formData.instructions.notes}
                onChange={e => updateField("instructions.notes", e.target.value)}
                placeholder="مثال: اشرب معاه كوباية مية كبيرة"
              />

              <Input
                label="تاريخ انتهاء الصلاحية"
                type="date"
                value={formData.expirationDate}
                onChange={e => updateField("expirationDate", e.target.value)}
              />
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={() => setStep(1)}>→ رجوع</Button>
              <Button onClick={() => setStep(3)}>التالي ←</Button>
            </div>
          </Card>
        )}

        {/* ===== Step 3: Pharmacy ===== */}
        {step === 3 && (
          <Card>
            <h2 className="text-lg font-bold mb-4">🏪 الصيدلية</h2>

            <p className="text-on-surface-variant text-sm mb-4">
              اربط دواؤك بصيدليتك المفضلة عشان تستلم reminders للـ refill وتقدر تتواصل معاهم.
            </p>

            <div className="space-y-3">
              <Card accent="info" className="bg-info-container/20">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏪</span>
                  <div>
                    <p className="font-bold">صيدلية النور</p>
                    <p className="text-xs text-on-surface-variant">مدينة نصر • 0.5 كم</p>
                  </div>
                  <input type="radio" name="pharmacy" className="mr-auto" defaultChecked />
                </div>
              </Card>

              <Card className="cursor-pointer hover:border-primary">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">💊</span>
                  <div>
                    <p className="font-bold">صيدلية العزبي</p>
                    <p className="text-xs text-on-surface-variant">مدينة نصر • 1.2 كم</p>
                  </div>
                  <input type="radio" name="pharmacy" className="mr-auto" />
                </div>
              </Card>

              <Card className="cursor-pointer hover:border-primary">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏥</span>
                  <div>
                    <p className="font-bold">صيدلية سيف</p>
                    <p className="text-xs text-on-surface-variant">مدينة نصر • 2.0 كم</p>
                  </div>
                  <input type="radio" name="pharmacy" className="mr-auto" />
                </div>
              </Card>

              <button className="text-primary font-semibold text-sm">
                + إضافة صيدلية جديدة
              </button>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={() => setStep(2)}>→ رجوع</Button>
              <Button onClick={handleSubmit} loading={loading}>
                {loading ? "جاري الحفظ..." : "حفظ الدواء ✓"}
              </Button>
            </div>
          </Card>
        )}
        </div>
      </main>
    </div>
  );
}
