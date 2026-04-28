interface RightRailPanelProps {
  notes: string;
  blockers: string;
  onNotesChange: (value: string) => void;
  onBlockersChange: (value: string) => void;
}

export default function RightRailPanel({
  notes,
  blockers,
  onNotesChange,
  onBlockersChange,
}: RightRailPanelProps) {
  return (
    <>
      <div className="glass-card p-5 fade-in-up" style={{ animationDelay: '160ms' }}>
        <label
          htmlFor="rail-notes"
          className="mb-3 block uppercase tracking-widest text-[var(--color-text-subtle)]"
          style={{ fontSize: 'var(--text-overline)', fontWeight: 600 }}
        >
          Notes
        </label>
        <textarea
          id="rail-notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={5}
          placeholder="Key insights, connections, questions…"
          className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-elevated)] px-3 py-2.5 text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:border-[var(--color-accent)] focus:outline-none"
          style={{ fontSize: 'var(--text-caption)', lineHeight: 1.6 }}
        />
      </div>

      <div className="glass-card p-5 fade-in-up" style={{ animationDelay: '200ms' }}>
        <label
          htmlFor="rail-blockers"
          className="mb-3 block uppercase tracking-widest text-[var(--color-text-subtle)]"
          style={{ fontSize: 'var(--text-overline)', fontWeight: 600 }}
        >
          Blockers
        </label>
        <textarea
          id="rail-blockers"
          value={blockers}
          onChange={(e) => onBlockersChange(e.target.value)}
          rows={3}
          placeholder="Confusing concepts, missing prerequisites…"
          className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-elevated)] px-3 py-2.5 text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:border-[var(--color-accent)] focus:outline-none"
          style={{ fontSize: 'var(--text-caption)', lineHeight: 1.6 }}
        />
      </div>
    </>
  );
}
