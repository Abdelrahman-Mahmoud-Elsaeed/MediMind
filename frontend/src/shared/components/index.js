/**
 * Common UI components for وفاء (Wafa) frontend
 */

import Link from "next/link";

// ===== Logo =====
export function Logo({ size = "md" }) {
  const sizes = {
    sm: "w-8 h-8 text-lg rounded-lg",
    md: "w-10 h-10 text-xl rounded-xl",
    lg: "w-16 h-16 text-3xl rounded-2xl",
    xl: "w-20 h-20 text-4xl rounded-3xl"
  };
  return (
    <div className={`${sizes[size]} bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md`}>
      💊
    </div>
  );
}

// ===== BrandName =====
export function BrandName({ size = "md" }) {
  const sizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-4xl"
  };
  return <span className={`${sizes[size]} font-black text-on-background`}>وفاء</span>;
}

// ===== Button =====
export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const variants = {
    primary: "bg-primary text-on-primary hover:bg-secondary",
    secondary: "bg-primary-container text-on-primary-container hover:bg-primary/20",
    ghost: "bg-transparent text-secondary border border-outline hover:border-primary",
    danger: "bg-error text-on-error hover:bg-error/90",
    success: "bg-tertiary text-on-tertiary hover:bg-tertiary/90"
  };
  const sizes = {
    sm: "px-3 py-2 text-sm min-h-[40px] md:px-4 md:py-2",
    md: "px-4 py-2.5 text-sm min-h-[48px] md:px-6 md:py-3 md:text-base md:min-h-[56px]",
    lg: "px-6 py-3 text-base min-h-[52px] md:px-8 md:py-4 md:text-lg md:min-h-[64px]"
  };
  return (
    <button
      className={`btn ${variants[variant]} ${sizes[size]} ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="animate-spin">⏳</span>}
      {children}
    </button>
  );
}

// ===== Card =====
export function Card({ children, className = "", accent = null }) {
  const accents = {
    primary: "border-r-4 border-r-primary",
    success: "border-r-4 border-r-tertiary bg-tertiary-container/30",
    warning: "border-r-4 border-r-warning bg-warning-container/30",
    danger: "border-r-4 border-r-error bg-error-container/30",
    info: "border-r-4 border-r-info bg-info-container/30"
  };
  return (
    <div className={`card ${accent ? accents[accent] : ""} ${className}`}>
      {children}
    </div>
  );
}

// ===== Badge =====
export function Badge({ children, variant = "info" }) {
  const variants = {
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
    info: "badge-info"
  };
  return <span className={`badge ${variants[variant]}`}>{children}</span>;
}

// ===== Input =====
export function Input({ label, error, className = "", ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-semibold mb-2">{label}</label>}
      <input className={`input ${error ? "border-error" : ""} ${className}`} {...props} />
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}

// ===== Bottom Navigation (Mobile) =====
export function BottomNav({ active = "home" }) {
  const items = [
    { key: "home", label: "الرئيسية", icon: "🏠", href: "/dashboard" },
    { key: "meds", label: "أدويتي", icon: "💊", href: "/medications" },
    { key: "reports", label: "التقارير", icon: "📊", href: "/reports" },
    { key: "settings", label: "حسابي", icon: "⚙️", href: "/settings" }
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline z-10 md:hidden">
      <div className="flex justify-around items-center h-14 md:h-16">
        {items.map(item => (
          <Link
            key={item.key}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 md:px-4 py-1.5 ${
              active === item.key ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            <span className="text-lg md:text-xl">{item.icon}</span>
            <span className="text-[10px] md:text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

// ===== Page Header =====
export function PageHeader({ title, subtitle, action = null }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-on-surface-variant text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ===== Stat Card =====
export function StatCard({ label, value, icon = null, color = "primary" }) {
  const colors = {
    primary: "text-primary",
    success: "text-tertiary",
    warning: "text-warning",
    error: "text-error",
    info: "text-info"
  };
  return (
    <div className="card text-center">
      {icon && <div className="text-xl md:text-2xl mb-1">{icon}</div>}
      <div className={`text-xl md:text-3xl font-black ${colors[color]}`}>{value}</div>
      <div className="text-[10px] md:text-xs text-on-surface-variant mt-1">{label}</div>
    </div>
  );
}

// ===== Empty State =====
export function EmptyState({ icon = "📭", title, description, action = null }) {
  return (
    <div className="card text-center py-12">
      <div className="text-5xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      {description && <p className="text-on-surface-variant text-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

// ===== Loading Spinner =====
export function Spinner({ size = "md" }) {
  const sizes = { sm: "text-base", md: "text-2xl", lg: "text-4xl" };
  return <div className={`${sizes[size]} animate-pulse`}>⏳</div>;
}
