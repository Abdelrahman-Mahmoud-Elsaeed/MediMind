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

export function showNotification({
  title,
  message,
  type = 'info',
  duration = 3800,
  isRtl = false,
}) {
  if (dismissTimer) {
    clearTimeout(dismissTimer);
  }
  if (closeTimer) {
    clearTimeout(closeTimer);
  }

  const toastConfig = { title, message, type, duration, isRtl };
  renderToast(toastConfig);

  dismissTimer = setTimeout(() => {
    dismissToast();
  }, duration);
}

export function showSuccess(message, title = 'Success', options = {}) {
  showNotification({ message, title, type: 'success', ...options });
}

export const showToast = (options = {}) => {
  const { title, message, type = 'info', duration = 3800, isRtl = false } = options;
  showNotification({ title, message, type, duration, isRtl });
};

export { showToast };

export function showError(message, title = 'Error', options = {}) {
  showNotification({ message, title, type: 'error', ...options });
}

export function showWarning(message, title = 'Warning', options = {}) {
  showNotification({ message, title, type: 'warning', ...options });
}

export function showInfo(message, title = 'Information', options = {}) {
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
