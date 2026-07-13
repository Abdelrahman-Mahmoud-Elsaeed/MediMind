"use client";

import { useState } from "react";
import { Logo, Button, Card, Badge, BottomNav, Input } from "@/shared/components";
import { LanguageSwitcher, useI18n } from "@/shared/i18n/I18nProvider";
import { authApi, notificationsApi } from "@/shared/lib/api";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [batchNotifications, setBatchNotifications] = useState(true);

  const sections = [
    { key: "profile", label: "الملف الشخصي", icon: "👤" },
    { key: "notifications", label: "الإشعارات", icon: "🔔" },
    { key: "privacy", label: "الخصوصية والصلاحيات", icon: "🔒" },
    { key: "subscription", label: "الاشتراك", icon: "💳" },
    { key: "help", label: "المساعدة", icon: "❓" }
  ];

  async function handleTestPush() {
    setLoading(true);
    try {
      await notificationsApi.sendTest();
      alert("تم إرسال إشعار تجريبي ✓");
    } catch (err) {
      alert("فشل الإرسال — تأكد إنك فعّلت الإشعارات في المتصفح");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    if (!confirm("متأكد إنك عاوز تسجل خروج؟")) return;
    try {
      await authApi.logout();
      window.location.href = "/auth";
    } catch (err) {
      window.location.href = "/auth";
    }
  }

  return (
    <main className="min-h-screen bg-background pb-20 md:pb-0">

      <header className="bg-surface border-b border-outline">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <h1 className="text-xl font-bold">الإعدادات</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">

        <div className="grid md:grid-cols-4 gap-4">

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="flex md:flex-col gap-2 overflow-x-auto pb-2">
              {sections.map(s => (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm whitespace-nowrap ${
                    activeSection === s.key
                      ? "bg-primary text-on-primary font-bold"
                      : "bg-surface text-on-surface-variant border border-outline"
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">

            {/* ===== Profile ===== */}
            {activeSection === "profile" && (
              <Card>
                <h2 className="text-lg font-bold mb-4">👤 الملف الشخصي</h2>
                <div className="space-y-4">

                  {/* Language Switcher */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">🌍 اللغة / Language</label>
                    <LanguageSwitcher />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center text-3xl">
                      🧓
                    </div>
                    <div>
                      <p className="font-bold text-lg">محمد أحمد</p>
                      <p className="text-sm text-on-surface-variant">+20 100 123 4567</p>
                      <Badge variant="success">مريض</Badge>
                    </div>
                  </div>

                  <Input label="الاسم الأول" defaultValue="محمد" />
                  <Input label="الاسم الأخير" defaultValue="أحمد" />
                  <Input label="تاريخ الميلاد" type="date" defaultValue="1960-05-15" />

                  <div>
                    <label className="block text-sm font-semibold mb-2">فصيلة الدم</label>
                    <select className="input" defaultValue="O+">
                      <option value="">غير محدد</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <Button>حفظ التغييرات</Button>
                </div>
              </Card>
            )}

            {/* ===== Notifications ===== */}
            {activeSection === "notifications" && (
              <Card>
                <h2 className="text-lg font-bold mb-4">🔔 الإشعارات</h2>

                <div className="space-y-4">
                  <ToggleRow
                    label="إشعارات المتصفح (Push)"
                    description="استلم تذكيرات الأدوية على جهازك"
                    value={pushEnabled}
                    onChange={setPushEnabled}
                  />
                  <ToggleRow
                    label="تجميع الإشعارات"
                    description="دمج إشعارات الصبح والضهر والمسا في رسالة واحدة"
                    value={batchNotifications}
                    onChange={setBatchNotifications}
                  />
                  <ToggleRow
                    label="إشعارات WhatsApp"
                    description="استلم التذكيرات على WhatsApp (مناسب للمرضى الكبار)"
                    value={whatsappEnabled}
                    onChange={setWhatsappEnabled}
                  />

                  <Card accent="info" className="bg-info-container/20 mt-4">
                    <p className="text-sm font-semibold mb-2">⏰ ساعات الهدوء</p>
                    <p className="text-xs text-on-surface-variant mb-3">
                      مش هنرسل إشعارات في الفترة دي
                    </p>
                    <div className="flex gap-3">
                      <Input label="من" type="time" defaultValue="22:00" />
                      <Input label="إلى" type="time" defaultValue="06:00" />
                    </div>
                  </Card>

                  <Button variant="secondary" onClick={handleTestPush} loading={loading}>
                    🔔 تجربة الإشعارات
                  </Button>
                </div>
              </Card>
            )}

            {/* ===== Privacy ===== */}
            {activeSection === "privacy" && (
              <Card>
                <h2 className="text-lg font-bold mb-4">🔒 الخصوصية والصلاحيات</h2>

                <p className="text-sm text-on-surface-variant mb-4">
                  أنت بتتحكم في مين يقدر يشوف بياناتك الصحية. تقدر توقف أي صلاحية في أي وقت.
                </p>

                <div className="space-y-3">
                  <PermissionRow
                    icon="👨‍👩‍👧"
                    name="الأهل (Caregiver)"
                    description="أحمد محمد (ابنك) — يقدر يشوف جدول أدويتك وياخد تنبيهات"
                    granted={true}
                  />
                  <PermissionRow
                    icon="👨‍⚕️"
                    name="الدكتور"
                    description="د. سعيد محمد — يستلم تقرير أسبوعي بالتزامك"
                    granted={true}
                  />
                  <PermissionRow
                    icon="💊"
                    name="الصيدلية"
                    description="صيدلية النور — تتبعتك reminders للـ refill"
                    granted={true}
                  />
                </div>

                <div className="mt-6 pt-6 border-t border-outline">
                  <Button variant="danger" size="sm">
                    🗑 حذف جميع البيانات
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-surface-variant rounded-lg text-xs text-on-surface-variant">
                  📋 وفاء بتلتزم بقانون حماية البيانات المصري رقم 151 لسنة 2020.
                  بياناتك مش بتتباع ولا بتتشارك من غير إذنك.
                </div>
              </Card>
            )}

            {/* ===== Subscription ===== */}
            {activeSection === "subscription" && (
              <Card>
                <h2 className="text-lg font-bold mb-4">💳 الاشتراك</h2>

                <Card accent="success" className="bg-tertiary-container/30 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">باقة مجانية</p>
                      <p className="text-sm text-on-surface-variant">للمرضى — مجاني للأبد</p>
                    </div>
                    <Badge variant="success">نشط</Badge>
                  </div>
                </Card>

                <p className="text-sm text-on-surface-variant mb-4">
                  وفاء مجانية للمريض للأبد. الاشتراكات المدفوعة للأهل (Premium)، الصيدليات، والدكاترة.
                </p>

                <div className="space-y-3">
                  <PlanCard
                    name="Premium — للأهل"
                    price="99 ج/شهر"
                    features={["متابعة أكتر من مريض", "تقارير أسبوعية وشهرية", "تاريخ الالتزام بالرسم البياني"]}
                  />
                </div>
              </Card>
            )}

            {/* ===== Help ===== */}
            {activeSection === "help" && (
              <Card>
                <h2 className="text-lg font-bold mb-4">❓ المساعدة</h2>

                <div className="space-y-3">
                  <HelpItem
                    icon="📞"
                    question="إزاي أتواصل مع الدعم؟"
                    answer="كلمنا على 16567 أو ابعتلنا WhatsApp على +20 100 000 0000"
                  />
                  <HelpItem
                    icon="💊"
                    question="إزاي أضيف دواء جديد؟"
                    answer="من شاشة الأدوية، اضغط زرار + إضافة واتبع الخطوات الـ 3"
                  />
                  <HelpItem
                    icon="🔔"
                    question="ليه مش بوصلني إشعارات؟"
                    answer="تأكد إنك فعّلت إشعارات المتصفح من إعدادات جهازك"
                  />
                  <HelpItem
                    icon="👨‍👩‍👧"
                    question="إزاي أضيف ابن لمراقبتي؟"
                    answer="من إعدادات الخصوصية، اضغط إضافة Caregiver واكتب رقم موبايله"
                  />
                </div>

                <div className="mt-6 pt-6 border-t border-outline space-y-2">
                  <Button variant="ghost" className="w-full">📄 سياسة الخصوصية</Button>
                  <Button variant="ghost" className="w-full">📋 الشروط والأحكام</Button>
                  <Button variant="danger" className="w-full" onClick={handleLogout}>
                    🚪 تسجيل الخروج
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <BottomNav active="settings" />
    </main>
  );
}

function ToggleRow({ label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-outline last:border-0">
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-xs text-on-surface-variant">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-7 rounded-full relative transition-colors ${
          value ? "bg-tertiary" : "bg-outline"
        }`}
      >
        <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
          value ? "left-1" : "right-1"
        }`} />
      </button>
    </div>
  );
}

function PermissionRow({ icon, name, description, granted }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-outline last:border-0">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="font-semibold">{name}</p>
        <p className="text-xs text-on-surface-variant">{description}</p>
      </div>
      {granted ? (
        <Badge variant="success">مسموح</Badge>
      ) : (
        <Button size="sm" variant="ghost">سماح</Button>
      )}
    </div>
  );
}

function PlanCard({ name, price, features }) {
  return (
    <Card className="hover:border-primary cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold">{name}</p>
          <p className="text-2xl font-black text-primary">{price}</p>
        </div>
        <Button size="sm">اشترك</Button>
      </div>
      <ul className="space-y-1 text-sm">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-tertiary">✓</span>
            {f}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function HelpItem({ icon, question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-outline last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 py-3 text-right"
      >
        <span className="text-xl">{icon}</span>
        <span className="flex-1 font-semibold">{question}</span>
        <span className="text-on-surface-variant">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <p className="text-sm text-on-surface-variant pb-3 pr-8">{answer}</p>
      )}
    </div>
  );
}
