import { useState } from 'react';

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="glass-card border-[var(--color-warning-soft)] p-8 text-center fade-in-up">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-warning-soft)]">
        <svg className="h-6 w-6 text-[var(--color-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3
        className="mb-1 text-[var(--color-text)]"
        style={{ fontSize: 'var(--text-subheading)', fontWeight: 600 }}
      >
        {title}
      </h3>
      <button
        type="button"
        onClick={() => setShowDetails((prev) => !prev)}
        className="btn-ghost mx-auto mb-4"
      >
        {showDetails ? 'Hide details' : 'What happened?'}
      </button>
      {showDetails ? (
        <p
          className="mx-auto mb-4 max-w-md rounded-lg bg-[var(--color-surface-muted)] p-3 text-left text-[var(--color-text-muted)]"
          style={{ fontSize: 'var(--text-caption)' }}
        >
          {message}
        </p>
      ) : null}
      {onRetry ? (
        <button type="button" onClick={onRetry} className="btn-primary">
          Try again
        </button>
      ) : null}
    </div>
  );
}
