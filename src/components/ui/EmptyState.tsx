import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="glass-card p-10 text-center fade-in-up sm:p-14">
      {icon ? (
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)]">
          {icon}
        </div>
      ) : null}
      <h3
        className="mb-2 text-[var(--color-text)]"
        style={{ fontSize: 'var(--text-heading)', fontWeight: 600 }}
      >
        {title}
      </h3>
      <p
        className="mx-auto mb-6 max-w-md text-[var(--color-text-muted)]"
        style={{ fontSize: 'var(--text-body)', lineHeight: 1.6 }}
      >
        {description}
      </p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
