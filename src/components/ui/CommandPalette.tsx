import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { startFocus } from '../../state/timerSlice';

interface CommandPaletteAction {
  id: string;
  label: string;
  run: () => void;
}

export default function CommandPalette() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen((current) => !current);
      }

      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, []);

  const actions: CommandPaletteAction[] = useMemo(
    () => [
      { id: 'dashboard', label: 'Go to Dashboard', run: () => navigate('/dashboard') },
      { id: 'journey', label: 'Go to Journey', run: () => navigate('/journey') },
      { id: 'session', label: 'Start Focus Session', run: () => dispatch(startFocus({ title: 'Focus Session', durationMinutes: 25 })) },
    ],
    [navigate, dispatch],
  );

  const filtered = actions.filter((action) =>
    action.label.toLowerCase().includes(query.toLowerCase().trim()),
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/20 p-4 sm:p-8">
      <div className="w-full max-w-xl rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-raised)]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
          placeholder="Search commands"
          className="w-full rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm"
          aria-label="Command search"
        />
        <div className="mt-3 space-y-2">
          {filtered.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                action.run();
                setIsOpen(false);
              }}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-left text-sm text-[var(--color-text)] hover:bg-white"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
