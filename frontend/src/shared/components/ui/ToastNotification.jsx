'use client';

import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const typeStyles = {
  success: {
    icon: CheckCircle2,
    iconClassName: 'text-emerald-600 dark:text-emerald-400',
    borderClassName: 'border-emerald-200/70 dark:border-emerald-800/60',
    bgClassName: 'bg-white/95 dark:bg-slate-900/95',
    titleClassName: 'text-slate-900 dark:text-slate-100',
    messageClassName: 'text-slate-600 dark:text-slate-300',
    progressClassName: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500',
  },
  error: {
    icon: CircleAlert,
    iconClassName: 'text-rose-600 dark:text-rose-400',
    borderClassName: 'border-rose-200/70 dark:border-rose-800/60',
    bgClassName: 'bg-white/95 dark:bg-slate-900/95',
    titleClassName: 'text-slate-900 dark:text-slate-100',
    messageClassName: 'text-slate-600 dark:text-slate-300',
    progressClassName: 'bg-gradient-to-r from-rose-500 via-red-500 to-orange-500',
  },
  warning: {
    icon: TriangleAlert,
    iconClassName: 'text-amber-600 dark:text-amber-400',
    borderClassName: 'border-amber-200/70 dark:border-amber-800/60',
    bgClassName: 'bg-white/95 dark:bg-slate-900/95',
    titleClassName: 'text-slate-900 dark:text-slate-100',
    messageClassName: 'text-slate-600 dark:text-slate-300',
    progressClassName: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500',
  },
  info: {
    icon: Info,
    iconClassName: 'text-cyan-600 dark:text-cyan-400',
    borderClassName: 'border-cyan-200/70 dark:border-cyan-800/60',
    bgClassName: 'bg-white/95 dark:bg-slate-900/95',
    titleClassName: 'text-slate-900 dark:text-slate-100',
    messageClassName: 'text-slate-600 dark:text-slate-300',
    progressClassName: 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500',
  },
};

export function ToastNotification({ toast, isClosing, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!toast) return null;

  const style = typeStyles[toast.type] || typeStyles.success;
  const Icon = style.icon;
  const containerClassName = [
    'pointer-events-auto w-[min(92vw,24rem)] overflow-hidden rounded-2xl border shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-xl',
    style.borderClassName,
    style.bgClassName,
    isClosing ? 'translate-y-2 opacity-0' : isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
    'transition-all duration-250 ease-out',
  ].join(' ');

  return (
    <div className="fixed inset-x-0 top-3 z-120 flex justify-center px-3 sm:justify-end sm:right-4 sm:left-auto sm:top-5 sm:px-0">
      <div className={containerClassName} dir={toast.isRtl ? 'rtl' : 'ltr'} role={toast.type === 'error' ? 'alert' : 'status'} aria-live={toast.type === 'error' ? 'assertive' : 'polite'}>
        <div className="flex items-start gap-3 px-4 py-3.5 sm:px-4.5 sm:py-4">
          <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50/80 dark:bg-slate-800/70 ${style.iconClassName}`}>
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${style.titleClassName}`}>
                  {toast.title}
                </p>
                <p className={`mt-1 text-sm leading-5 ${style.messageClassName}`}>
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="h-1 w-full overflow-hidden bg-slate-100/80 dark:bg-slate-800/80">
          <div className={`h-full ${style.progressClassName} animate-[toastProgress_3.8s_linear_forwards]`} />
        </div>
      </div>
    </div>
  );
}
