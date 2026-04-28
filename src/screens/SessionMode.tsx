import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toggleSubtopicCompletion } from '../api/progress';
import { useAppData } from '../state/AppDataProvider';
import type { LearningPlan, PlanSubtopic } from '../types/domain';
import { getLearningPlan } from '../api/learningPlans';

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

const RING_RADIUS = 120;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

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
  const [showNotes, setShowNotes] = useState(false);
  const [isCompleteStep, setIsCompleteStep] = useState(false);
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [topicData, setTopicData] = useState<PlanSubtopic | null>(null);

  const elapsed = initialSeconds - secondsLeft;
  const progressFraction = initialSeconds > 0 ? elapsed / initialSeconds : 0;
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progressFraction);

  const storageKey = useMemo(
    () => `skillmap:session-notes:${session.subtopicId ?? 'default'}`,
    [session.subtopicId],
  );

  // Load persisted notes
  useEffect(() => {
    const storedNotes = localStorage.getItem(storageKey);
    if (storedNotes) {
      setNotes(storedNotes);
      setShowNotes(true);
    }
  }, [storageKey]);

  // Persist notes on change
  useEffect(() => {
    localStorage.setItem(storageKey, notes);
  }, [notes, storageKey]);

  // Load topic data for context panel
  useEffect(() => {
    const loadTopicData = async () => {
      if (!session.planId || !session.subtopicId) return;
      try {
        const plan: LearningPlan = await getLearningPlan(session.planId);
        const topic = plan.subtopics.find((s) => s.id === session.subtopicId);
        if (topic) setTopicData(topic);
      } catch {
        // Silently fail — context is optional
      }
    };
    void loadTopicData();
  }, [session.planId, session.subtopicId]);

  // Timer
  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning, secondsLeft]);

  // Auto-complete
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

      // Update streak
      try {
        const today = new Date().toISOString().slice(0, 10);
        const raw = localStorage.getItem('skillmap:streak');
        let count = 1;
        if (raw) {
          const prev = JSON.parse(raw) as { count: number; lastDate: string };
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          if (prev.lastDate === today) {
            count = prev.count;
          } else if (prev.lastDate === yesterday) {
            count = prev.count + 1;
          }
        }
        localStorage.setItem('skillmap:streak', JSON.stringify({ count, lastDate: today }));
      } catch {
        // Non-critical
      }

      localStorage.removeItem(storageKey);
      pushToast({ type: 'success', message: 'Session saved. Great progress today.' });
      navigate('/journey', {
        state: {
          sessionCompleted: true,
          completedTopicTitle: session.title,
          reflection,
        },
      });
    } catch {
      pushToast({ type: 'error', message: 'Could not save session completion. Please retry.' });
    } finally {
      setIsSaving(false);
    }
  };

  const statusText = isRunning ? 'Stay focused' : secondsLeft === initialSeconds ? 'Ready when you are' : 'Paused';

  return (
    <div className={`session-bg min-h-screen w-full px-4 py-8 sm:px-6 sm:py-12 transition-colors duration-[2000ms] ${isRunning ? 'session-bg--active' : ''}`}>
      <div className="mx-auto max-w-2xl page-enter">
        {/* Exit */}
        <header className="mb-10">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-ghost mb-6"
          >
            ← Exit session
          </button>
          <p
            className="uppercase tracking-widest text-[var(--color-text-subtle)]"
            style={{ fontSize: 'var(--text-overline)', fontWeight: 600 }}
          >
            Session mode
          </p>
          <h1
            className="mt-1 tracking-tight text-[var(--color-text)]"
            style={{ fontSize: 'var(--text-heading)', fontWeight: 600 }}
          >
            {session.title ?? 'Focused learning block'}
          </h1>
        </header>

        {!isCompleteStep ? (
          <div className="space-y-6">
            {/* Timer card */}
            <section className="glass-card p-8 text-center sm:p-10 fade-in-up">
              <div className={`relative mx-auto mb-8 h-64 w-64 sm:h-72 sm:w-72 ${isRunning ? 'session-ring-glow' : ''}`}>
                {/* Orbiting dashed ring */}
                {isRunning ? (
                  <svg className="absolute inset-0 h-full w-full session-ring-orbit" viewBox="0 0 280 280">
                    <circle
                      cx="140"
                      cy="140"
                      r={RING_RADIUS + 12}
                      fill="none"
                      stroke="var(--color-accent-soft)"
                      strokeWidth="1"
                      strokeDasharray="4 8"
                    />
                  </svg>
                ) : null}
                <svg className="h-full w-full -rotate-90" viewBox="0 0 280 280">
                  <circle
                    cx="140"
                    cy="140"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="var(--color-border-light)"
                    strokeWidth="5"
                  />
                  <circle
                    cx="140"
                    cy="140"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p
                    className="text-[var(--color-text)]"
                    style={{ fontSize: '3.5rem', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1 }}
                  >
                    {formatSeconds(secondsLeft)}
                  </p>
                  <p className="mt-2 text-[var(--color-text-subtle)]" style={{ fontSize: 'var(--text-caption)' }}>
                    {statusText}
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRunning((c) => !c)}
                  className="btn-primary"
                >
                  {isRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRunning(false); setSecondsLeft(initialSeconds); }}
                  className="btn-secondary"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsCompleteStep(true)}
                  className="btn-ghost"
                >
                  Mark done
                </button>
              </div>
            </section>

            {/* Topic context — only if we have topic data */}
            {topicData ? (
              <section className="glass-card p-5 fade-in-up" style={{ animationDelay: '80ms' }}>
                <p
                  className="mb-2 uppercase tracking-widest text-[var(--color-text-subtle)]"
                  style={{ fontSize: 'var(--text-overline)', fontWeight: 600 }}
                >
                  Studying
                </p>
                <h3
                  className="mb-1 text-[var(--color-text)]"
                  style={{ fontSize: 'var(--text-subheading)', fontWeight: 500 }}
                >
                  {topicData.title}
                </h3>
                {topicData.description ? (
                  <p className="mb-3 text-[var(--color-text-muted)]" style={{ fontSize: 'var(--text-caption)', lineHeight: 1.6 }}>
                    {topicData.description}
                  </p>
                ) : null}
                {topicData.resources && topicData.resources.length > 0 ? (
                  <div className="border-t border-[var(--color-border-light)] pt-3">
                    <p className="mb-2 text-[var(--color-text-subtle)]" style={{ fontSize: 'var(--text-overline)', fontWeight: 600 }}>
                      Resources
                    </p>
                    <ul className="space-y-1.5">
                      {topicData.resources.map((resource, i) => (
                        <li key={i}>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
                            style={{ fontSize: 'var(--text-caption)' }}
                          >
                            <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-[var(--color-accent-soft)]" style={{ fontSize: '8px' }}>
                              {resource.type === 'video' ? '▶' : resource.type === 'article' ? '¶' : '◆'}
                            </span>
                            {resource.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            ) : null}

            {/* Collapsible notes */}
            <section className="fade-in-up" style={{ animationDelay: '120ms' }}>
              {!showNotes ? (
                <button
                  type="button"
                  onClick={() => setShowNotes(true)}
                  className="btn-ghost w-full justify-center"
                >
                  + Add notes
                </button>
              ) : (
                <div className="glass-card p-5">
                  <p
                    className="mb-3 uppercase tracking-widest text-[var(--color-text-subtle)]"
                    style={{ fontSize: 'var(--text-overline)', fontWeight: 600 }}
                  >
                    Quick notes
                  </p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Key points, confusions, next steps…"
                    className="w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-elevated)] px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:border-[var(--color-accent)] focus:outline-none"
                    style={{ fontSize: 'var(--text-body)' }}
                  />
                </div>
              )}
            </section>
          </div>
        ) : (
          /* Completion step */
          <section className="glass-card p-6 sm:p-8 fade-in-up">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success-soft)] celebrate-pop">
              <svg className="h-7 w-7 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p
              className="mb-1 uppercase tracking-widest text-[var(--color-text-subtle)]"
              style={{ fontSize: 'var(--text-overline)', fontWeight: 600 }}
            >
              Session complete
            </p>
            <h2
              className="mb-2 text-[var(--color-text)]"
              style={{ fontSize: 'var(--text-heading)', fontWeight: 600 }}
            >
              What clicked for you today?
            </h2>
            <p className="mb-5 text-[var(--color-text-muted)]" style={{ fontSize: 'var(--text-body)' }}>
              {topicData
                ? `You studied "${topicData.title}" for ${minutes} minutes.`
                : `You focused for ${minutes} minutes.`}
            </p>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={4}
              placeholder="One insight you gained in this session…"
              className="mb-5 w-full rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-elevated)] px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:border-[var(--color-accent)] focus:outline-none"
              style={{ fontSize: 'var(--text-body)' }}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-[var(--color-text-subtle)]" style={{ fontSize: 'var(--text-overline)' }}>
                Your reflection will be saved to your journey
              </p>
              <button
                type="button"
                onClick={() => void handleDone()}
                disabled={isSaving}
                className="btn-primary"
              >
                {isSaving ? 'Saving…' : 'Save & return'}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
