import type { ReactNode } from 'react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

type ToastProps = {
  toasts: ToastItem[];
  onDismiss: (toastId: string) => void;
};

const toastStyles: Record<ToastItem['type'], { container: string; bar: string }> = {
  success: {
    container: 'border-[var(--color-success-muted)] bg-[var(--color-success-soft)] text-[var(--color-success)]',
    bar: 'bg-[var(--color-success)]',
  },
  error: {
    container: 'border-[var(--color-error-soft)] bg-[var(--color-error-soft)] text-[var(--color-error)]',
    bar: 'bg-[var(--color-error)]',
  },
  info: {
    container: 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]',
    bar: 'bg-[var(--color-accent)]',
  },
};

const toastIcons: Record<ToastItem['type'], ReactNode> = {
  success: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-16 z-[60] space-y-2 sm:right-6" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => {
        const style = toastStyles[toast.type];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto relative min-w-72 overflow-hidden rounded-xl border shadow-[var(--shadow-soft)] toast-enter ${style.container}`}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              {toastIcons[toast.type]}
              <p className="flex-1" style={{ fontSize: 'var(--text-caption)', fontWeight: 500 }}>
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="flex-shrink-0 opacity-60 transition-opacity hover:opacity-100"
                style={{ fontSize: 'var(--text-overline)' }}
              >
                Dismiss
              </button>
            </div>
            {/* Auto-dismiss progress bar */}
            <div className={`h-0.5 w-full ${style.bar} toast-dismiss-bar`} />
          </div>
        );
      })}
    </div>
  );
}
