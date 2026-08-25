'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, toast } from 'sonner';
import { useTranslation } from '@/shared/lib/i18nContext';

const Toaster = ({ ...props }) => {
  const { theme = 'system' } = useTheme();
  const { dir } = useTranslation();

  return (
    <Sonner
      theme={theme}
      dir={dir || 'ltr'}
      className="toaster group"
      position={dir === 'rtl' ? 'top-left' : 'top-right'}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-surface-container-lowest dark:group-[.toaster]:bg-surface-container-low group-[.toaster]:text-on-surface group-[.toaster]:border-outline-variant/30 group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl group-[.toaster]:p-4 font-sans',
          description: 'group-[.toast]:text-on-surface-variant group-[.toast]:text-xs',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-on-primary group-[.toast]:font-bold group-[.toast]:rounded-xl',
          cancelButton:
            'group-[.toast]:bg-surface-container-high group-[.toast]:text-on-surface-variant group-[.toast]:rounded-xl',
          success: 'group-[.toaster]:!border-emerald-500/40 group-[.toaster]:!bg-emerald-50 dark:group-[.toaster]:!bg-emerald-950/80 group-[.toaster]:!text-emerald-950 dark:group-[.toaster]:!text-emerald-100',
          error: 'group-[.toaster]:!border-rose-500/40 group-[.toaster]:!bg-rose-50 dark:group-[.toaster]:!bg-rose-950/80 group-[.toaster]:!text-rose-950 dark:group-[.toaster]:!text-rose-100',
          info: 'group-[.toaster]:!border-teal-500/40 group-[.toaster]:!bg-teal-50 dark:group-[.toaster]:!bg-teal-950/80 group-[.toaster]:!text-teal-950 dark:group-[.toaster]:!text-teal-100',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
