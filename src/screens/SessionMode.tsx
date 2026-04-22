import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toggleSubtopicCompletion } from '../api/progress';
import { useAppData } from '../state/AppDataProvider';

interface SessionState {
  planId?: string;
  subtopicId?: string;
  title?: string;
  minutes?: number;
}

const formatSeconds = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

export default function SessionMode() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pushToast } = useAppData();
  const session = (location.state as SessionState | null) ?? {};

  const minutes = session.minutes ?? 25;
  const initialSeconds = minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [notes, setNotes] = useState('');
  const [isCompleteStep, setIsCompleteStep] = useState(false);
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const storageKey = useMemo(
    () => `skillmap:session-notes:${session.subtopicId ?? 'default'}`,
    [session.subtopicId],
  );

  useEffect(() => {
    const storedNotes = localStorage.getItem(storageKey);
    if (storedNotes) {
      setNotes(storedNotes);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, notes);
  }, [notes, storageKey]);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      pushToast({ type: 'success', message: 'Session completed. Capture your reflection.' });
      setIsCompleteStep(true);
    }
  }, [isRunning, pushToast, secondsLeft]);

  const handleDone = async () => {
    setIsSaving(true);

    try {
      if (session.planId && session.subtopicId) {
        await toggleSubtopicCompletion(session.planId, session.subtopicId, true);
      }

      localStorage.removeItem(storageKey);
      pushToast({ type: 'success', message: 'Session saved. Great progress today.' });
      navigate('/journey');
    } catch {
      pushToast({ type: 'error', message: 'Could not save session completion. Please retry.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--color-bg)] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mb-5 rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-text)]"
          >
            Exit session
          </button>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Session mode</p>
          <h1 className="mt-2 text-3xl font-light tracking-tight text-[var(--color-text)]">
            {session.title ?? 'Focused learning block'}
          </h1>
        </header>

        {!isCompleteStep ? (
          <>
            <section className="mb-6 rounded-2xl border border-[var(--color-border)] bg-white p-6 text-center shadow-[var(--shadow-soft)]">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Focus timer</p>
              <p className="mt-4 text-6xl font-light text-[var(--color-text)]">{formatSeconds(secondsLeft)}</p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRunning((current) => !current)}
                  className="rounded-lg bg-[var(--color-accent)] px-5 py-2 text-sm text-white"
                >
                  {isRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRunning(false);
                    setSecondsLeft(initialSeconds);
                  }}
                  className="rounded-lg border border-[var(--color-border)] bg-white px-5 py-2 text-sm text-[var(--color-text)]"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsCompleteStep(true)}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-2 text-sm text-[var(--color-text)]"
                >
                  Mark done
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-soft)]">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Quick notes</p>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={7}
                placeholder="Capture key points, confusions, and next steps..."
                className="mt-3 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
              />
            </section>
          </>
        ) : (
          <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-soft)]">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Reflection</p>
            <h2 className="mt-2 text-xl font-light text-[var(--color-text)]">What clicked for you today?</h2>
            <textarea
              value={reflection}
              onChange={(event) => setReflection(event.target.value)}
              rows={5}
              placeholder="One insight you gained in this session..."
              className="mt-4 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => void handleDone()}
                disabled={isSaving}
                className="rounded-lg bg-[var(--color-accent)] px-5 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isSaving ? 'Saving...' : 'Save reflection and return'}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
