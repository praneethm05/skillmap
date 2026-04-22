interface DailyFocusCardProps {
  title: string;
  estimatedMinutes: number;
  reason: string;
  onStartSession: () => void;
}

export default function DailyFocusCard({
  title,
  estimatedMinutes,
  reason,
  onStartSession,
}: DailyFocusCardProps) {
  return (
    <article className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Daily focus</p>
      <h2 className="mt-2 text-2xl font-light tracking-tight text-[var(--color-text)]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">{reason}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-text-muted)]">Suggested session: {estimatedMinutes} min</p>
        <button
          type="button"
          onClick={onStartSession}
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm text-white transition-colors hover:bg-[var(--color-accent-strong)]"
        >
          Start 25-min session
        </button>
      </div>
    </article>
  );
}
