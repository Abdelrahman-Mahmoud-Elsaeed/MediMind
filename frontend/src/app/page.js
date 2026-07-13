import Link from "next/link";

/**
 * Landing Page — وفاء (Wafa) Platform
 *
 * Marketing landing page that explains the platform's value proposition.
 * Used during the pilot-first validation phase to collect waitlist signups.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">

      {/* ===== Header ===== */}
      <header className="border-b border-outline bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-xl">
              💊
            </div>
            <span className="text-xl font-bold">وفاء</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-on-surface-variant hover:text-primary">المميزات</a>
            <a href="#how" className="text-on-surface-variant hover:text-primary">إزاي شغال</a>
            <a href="#pricing" className="text-on-surface-variant hover:text-primary">الأسعار</a>
            <a href="#contact" className="text-on-surface-variant hover:text-primary">تواصل معانا</a>
          </nav>
          <Link href="/auth" className="btn btn-primary text-sm">
            ابدأ مجاناً
          </Link>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          <div>
            <span className="badge badge-info mb-6">🚀 منصة عربية جديدة</span>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              متحدّش ينسى <span className="text-primary">دواؤه</span> تاني
            </h1>
            <p className="text-lg text-on-surface-variant mb-8 leading-relaxed">
              منصة وفاء بتربط المريض بأهله وصيدليته ودكتوره في حتة واحدة.
              تذكير بمواعيد الأدوية، تنبيهات للأهل، ومتابعة حقيقية للالتزام.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/auth" className="btn btn-primary">
                ابدأ مجاناً الآن
              </Link>
              <a href="#how" className="btn btn-ghost">
                إزاي شغال؟
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-12">
              <div>
                <div className="text-2xl font-black text-primary">9M+</div>
                <div className="text-xs text-on-surface-variant">مريض سكر في مصر</div>
              </div>
              <div>
                <div className="text-2xl font-black text-primary">26M+</div>
                <div className="text-xs text-on-surface-variant">مريض ضغط في مصر</div>
              </div>
              <div>
                <div className="text-2xl font-black text-primary">70K+</div>
                <div className="text-xs text-on-surface-variant">صيدلية في مصر</div>
              </div>
            </div>
          </div>

          {/* Mockup card */}
          <div className="relative">
            <div className="card bg-gradient-to-br from-primary-container to-tertiary-container border-2 border-primary/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-on-surface-variant">صباح الخير، محمد 👋</p>
                  <h3 className="text-xl font-bold">أدوية اليوم</h3>
                </div>
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  75%
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💊</span>
                    <div>
                      <p className="font-semibold">Glucophage 500mg</p>
                      <p className="text-xs text-on-surface-variant">8:00 ص</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-tertiary rounded-full flex items-center justify-center text-white">✓</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💊</span>
                    <div>
                      <p className="font-semibold">Concor 5mg</p>
                      <p className="text-xs text-on-surface-variant">8:00 ص</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-tertiary rounded-full flex items-center justify-center text-white">✓</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💊</span>
                    <div>
                      <p className="font-semibold">Glucophage 500mg</p>
                      <p className="text-xs text-on-surface-variant">8:00 م</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 border-2 border-outline rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="bg-surface py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="badge badge-success mb-4">المميزات</span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">كل اللي محتاجه في حتة واحدة</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              وفاء بتربط الأطراف الأربعة في المنظومة الصحية عشان نضمن التزام المريض بدواؤه
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon="🧓"
              title="للمريض"
              desc="تذكير بمواعيد الأدوية بضغطة زرار واحدة. مجاني للأبد."
              color="primary"
            />
            <FeatureCard
              icon="👨‍👩‍👧"
              title="للأهل"
              desc="اطمن على أحبابك في أي وقت. تنبيهات فورية لو نسوا الدواء."
              color="tertiary"
            />
            <FeatureCard
              icon="💊"
              title="للصيدلية"
              desc="تابع عملاءك وزود مبيعاتك بـ reminders ذكية للـ refill."
              color="warning"
            />
            <FeatureCard
              icon="👨‍⚕️"
              title="للدكتور"
              desc="تقرير أسبوعي على WhatsApp بنسبة التزام مرضاك بالأدوية."
              color="info"
            />
          </div>
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <section id="how" className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="badge badge-info mb-4">إزاي شغال</span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">3 خطوات بس</h2>
          </div>

          <div className="space-y-8">
            <Step
              number="1"
              title="سجّل برقم موبايلك"
              desc="مفيش إيميل، مفيش كلمة سر. بس رقم موبايل وكود تحقيق بيرسل لك على SMS أو WhatsApp."
            />
            <Step
              number="2"
              title="ضيف أدويتك ومواعيدها"
              desc="اكتب اسم الدواء والجرعة والميعاد. أو امسح الروشتة بكاميرا الموبايل وهنقوم نضيفها تلقائياً."
            />
            <Step
              number="3"
              title="استلم التذكيرات واطمن أهلك"
              desc="هنذكّرك بميعاد كل دواء. لو نسيت، هنطمن أهلك عليك. والدكتور هيشوف التزامك كل أسبوع."
            />
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-gradient-to-br from-primary to-secondary py-20">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            ابدأ رحلتك مع وفاء النهارده
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            انضم لآلاف المرضى اللي قرروا ما ينسوش دواهم تاني. مجاني للمريض للأبد.
          </p>
          <Link href="/auth" className="btn bg-white text-primary hover:bg-white/90 text-lg px-8">
            ابدأ مجاناً →
          </Link>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer id="contact" className="bg-on-background text-background py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💊</span>
                <span className="text-xl font-bold">وفاء</span>
              </div>
              <p className="text-sm opacity-70">
                منصة متكاملة لإدارة الأدوية ومتابعة المرضى المزمنين في الوطن العربي.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3">المنصة</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li><a href="#features" className="hover:opacity-100">المميزات</a></li>
                <li><a href="#how" className="hover:opacity-100">إزاي شغال</a></li>
                <li><a href="#pricing" className="hover:opacity-100">الأسعار</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">الدعم</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li><a href="/help" className="hover:opacity-100">مركز المساعدة</a></li>
                <li><a href="/contact" className="hover:opacity-100">تواصل معانا</a></li>
                <li><a href="/privacy" className="hover:opacity-100">سياسة الخصوصية</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">تواصل</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li>📞 +20 100 000 0000</li>
                <li>✉️ hello@wafa.app</li>
                <li>📍 القاهرة، مصر</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm opacity-60">
            © 2026 وفاء. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc, color }) {
  const colorMap = {
    primary: "bg-primary-container text-on-primary-container",
    tertiary: "bg-tertiary-container text-on-tertiary-container",
    warning: "bg-warning-container text-on-warning-container",
    info: "bg-info-container text-on-info-container"
  };
  return (
    <div className="card text-center">
      <div className={`w-16 h-16 ${colorMap[color]} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-on-surface-variant">{desc}</p>
    </div>
  );
}

function Step({ number, title, desc }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center text-xl font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-on-surface-variant">{desc}</p>
      </div>
    </div>
  );
}
