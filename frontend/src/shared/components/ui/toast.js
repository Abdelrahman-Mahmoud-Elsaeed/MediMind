'use client';

import { createRoot } from 'react-dom/client';
import { ToastNotification } from './ToastNotification';

let toastRoot = null;
let activeToast = null;
let dismissTimer = null;
let closeTimer = null;

function ensureRoot() {
  if (typeof document === 'undefined') return null;
  if (!toastRoot) {
    const container = document.createElement('div');
    container.id = 'medimind-toast-root';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
    toastRoot = createRoot(container);
  }
  return toastRoot;
}

function renderToast(toastConfig) {
  const root = ensureRoot();
  if (!root) return;
  activeToast = toastConfig;
  root.render(<ToastNotification toast={toastConfig} isClosing={false} onClose={() => dismissToast()} />);
}

function extractLocalizedText(val, isRtl) {
  if (!val) return '';
  if (typeof val === 'string') return val;

  if (typeof val === 'object') {
    const apiError = val?.response?.data?.error || val?.response?.data || val;
    const messages = apiError?.messages || val?.messages;

    if (messages) {
      if (typeof messages === 'string') return messages;
      if (typeof messages === 'object') {
        return isRtl ? (messages.ar || messages.en || '') : (messages.en || messages.ar || '');
      }
    }

    if (apiError?.message) {
      if (typeof apiError.message === 'string') return apiError.message;
      if (typeof apiError.message === 'object') {
        return isRtl ? (apiError.message.ar || apiError.message.en || '') : (apiError.message.en || apiError.message.ar || '');
      }
    }

    if (val.en || val.ar) {
      return isRtl ? (val.ar || val.en) : (val.en || val.ar);
    }
  }

  return String(val);
}

export function showNotification({
  title,
  message,
  type = 'info',
  duration = 3800,
  isRtl,
}) {
  if (dismissTimer) clearTimeout(dismissTimer);
  if (closeTimer) clearTimeout(closeTimer);

  const resolvedIsRtl =
    typeof isRtl === 'boolean'
      ? isRtl
      : typeof document !== 'undefined' &&
        (document.documentElement.dir === 'rtl' ||
         document.dir === 'rtl' ||
         document.documentElement.getAttribute('lang') === 'ar');

  const localizedMessage =
    extractLocalizedText(message, resolvedIsRtl) ||
    (resolvedIsRtl ? 'حدث خطأ غير متوقع' : 'An unexpected event occurred');

  let localizedTitle = extractLocalizedText(title, resolvedIsRtl);
  if (!localizedTitle) {
    const defaultTitles = {
      success: resolvedIsRtl ? 'نجاح' : 'Success',
      error: resolvedIsRtl ? 'خطأ' : 'Error',
      warning: resolvedIsRtl ? 'تنبيه' : 'Warning',
      info: resolvedIsRtl ? 'معلومات' : 'Information',
    };
    localizedTitle = defaultTitles[type] || defaultTitles.info;
  } else if (localizedTitle === 'Error' && resolvedIsRtl) {
    localizedTitle = 'خطأ';
  } else if (localizedTitle === 'Success' && resolvedIsRtl) {
    localizedTitle = 'نجاح';
  } else if (localizedTitle === 'Warning' && resolvedIsRtl) {
    localizedTitle = 'تنبيه';
  } else if (localizedTitle === 'Information' && resolvedIsRtl) {
    localizedTitle = 'معلومات';
  }

  const toastConfig = {
    title: localizedTitle,
    message: localizedMessage,
    type,
    duration,
    isRtl: resolvedIsRtl,
  };

  renderToast(toastConfig);

  dismissTimer = setTimeout(() => {
    dismissToast();
  }, duration);
}

export function showSuccess(message, title, options = {}) {
  showNotification({ message, title, type: 'success', ...options });
}

export const showToast = (options = {}) => {
  const { title, message, type = 'info', duration = 3800, isRtl } = options;
  showNotification({ title, message, type, duration, isRtl });
};


export function showError(message, title, options = {}) {
  showNotification({ message, title, type: 'error', ...options });
}

export function showApiError(err, fallbackTitle, options = {}) {
  showNotification({ message: err, title: fallbackTitle, type: 'error', ...options });
}

export function showWarning(message, title, options = {}) {
  showNotification({ message, title, type: 'warning', ...options });
}

export function showInfo(message, title, options = {}) {
  showNotification({ message, title, type: 'info', ...options });
}

export function dismissToast() {
  if (!toastRoot || !activeToast) return;

  const root = toastRoot;
  root.render(<ToastNotification toast={null} isClosing={true} onClose={() => dismissToast()} />);
  closeTimer = setTimeout(() => {
    root.render(null);
    activeToast = null;
  }, 260);
}
