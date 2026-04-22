import { useMemo, useState } from 'react';
import type { LearningPlan } from '../../types/domain';
import {
  buildAchievementJournal,
  buildMentorSummaryPayload,
  createMockPrivateShareLink,
  createWeeklyCheckIn,
} from '../../api/social';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { useAppData } from '../../state/AppDataProvider';

interface SocialPanelsProps {
  plan: LearningPlan;
}

export default function SocialPanels({ plan }: SocialPanelsProps) {
  const { pushToast } = useAppData();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const {
    execute: generateShareLink,
    status: shareStatus,
  } = useAsyncAction(createMockPrivateShareLink);

  const checkIn = useMemo(() => createWeeklyCheckIn(plan), [plan]);
  const achievements = useMemo(() => buildAchievementJournal(plan), [plan]);
  const mentorSummary = useMemo(() => buildMentorSummaryPayload(plan), [plan]);

  const handleCreateShareLink = async () => {
    try {
      const share = await generateShareLink(plan);
      setShareUrl(share.url);
      await navigator.clipboard.writeText(share.url);
      pushToast({ type: 'success', message: 'Private share link generated and copied.' });
    } catch {
      pushToast({ type: 'error', message: 'Could not create share link. Please retry.' });
    }
  };

  return (
    <section className="mb-10 space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-soft)]">
      <h2 className="text-xl font-light text-[var(--color-text)]">Social and Accountability</h2>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Private sharing</p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Create a private link to share your progress snapshot with trusted peers.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleCreateShareLink()}
            disabled={shareStatus === 'loading'}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm text-white hover:bg-[var(--color-accent-strong)] disabled:bg-gray-300"
          >
            {shareStatus === 'loading' ? 'Generating...' : 'Generate private link'}
          </button>
          {shareUrl ? <span className="text-xs text-[var(--color-text-muted)]">{shareUrl}</span> : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Weekly check-in</p>
          <p className="mt-2 text-sm text-[var(--color-text)]">
            {checkIn.completedTopics} topics, {checkIn.completedHours} hours, consistency {checkIn.consistencyScore}%
          </p>
        </article>
        <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Mentor summary payload</p>
          <pre className="mt-2 max-h-28 overflow-auto rounded bg-white p-2 text-xs text-[var(--color-text)]">
{JSON.stringify(mentorSummary, null, 2)}
          </pre>
        </article>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Achievement journal</p>
        {achievements.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Complete topics to build your journal.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3">
            {achievements.map((achievement) => (
              <article key={achievement.id} className="rounded-lg border border-[var(--color-border)] bg-white p-3">
                <p className="text-sm text-[var(--color-text)]">{achievement.title}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{achievement.detail}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
