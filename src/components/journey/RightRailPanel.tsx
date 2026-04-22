interface RightRailPanelProps {
  notes: string;
  blockers: string;
  resources: string;
  reminderDate: string;
  onNotesChange: (value: string) => void;
  onBlockersChange: (value: string) => void;
  onResourcesChange: (value: string) => void;
  onReminderDateChange: (value: string) => void;
}

export default function RightRailPanel({
  notes,
  blockers,
  resources,
  reminderDate,
  onNotesChange,
  onBlockersChange,
  onResourcesChange,
  onReminderDateChange,
}: RightRailPanelProps) {
  return (
    <aside className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)]">
      <h3 className="text-sm uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Study rail</h3>

      <label className="mt-4 block text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Session notes</label>
      <textarea
        rows={3}
        value={notes}
        onChange={(event) => onNotesChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text)]"
      />

      <label className="mt-4 block text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Blockers</label>
      <textarea
        rows={2}
        value={blockers}
        onChange={(event) => onBlockersChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text)]"
      />

      <label className="mt-4 block text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Resources</label>
      <textarea
        rows={2}
        value={resources}
        onChange={(event) => onResourcesChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text)]"
      />

      <label className="mt-4 block text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Reminder date</label>
      <input
        type="date"
        value={reminderDate}
        onChange={(event) => onReminderDateChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text)]"
      />
    </aside>
  );
}
