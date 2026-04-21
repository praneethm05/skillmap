export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

type ToastProps = {
  toasts: ToastItem[];
  onDismiss: (toastId: string) => void;
};

const toastStyles: Record<ToastItem['type'], string> = {
  success: 'border-green-200 bg-green-50 text-green-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-gray-200 bg-white text-gray-900',
};

export default function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex min-w-72 items-center justify-between rounded-lg border px-4 py-3 shadow-md ${toastStyles[toast.type]}`}
        >
          <p className="pr-4 text-sm">{toast.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="text-xs underline underline-offset-2"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
