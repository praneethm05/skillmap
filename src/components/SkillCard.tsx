interface SkillCardProps {
  skillName?: string;
  progress?: number;
  subtopicsLeft?: number;
  totalSubtopics?: number;
  estimatedHours?: number;
  nextTopicName?: string;
  onContinue?: () => void;
  onComplete?: () => void;
  disableActions?: boolean;
  variant?: 'primary' | 'secondary' | 'compact';
  animationDelayMs?: number;
}

const SkillCard = ({
  skillName = 'React JS',
  progress = 65,
  subtopicsLeft = 8,
  totalSubtopics = 20,
  estimatedHours,
  nextTopicName,
  onContinue,
  disableActions = false,
  variant = 'secondary',
  animationDelayMs = 0,
}: SkillCardProps) => {
  const progressPercentage = Math.min(100, Math.max(0, progress));
  const completedSubtopics = totalSubtopics - subtopicsLeft;
  const isComplete = progressPercentage === 100;
  const isNotStarted = progressPercentage === 0;

  // State-driven styling
  const stateStyles = isComplete
    ? 'border-[var(--color-success-muted)] bg-[var(--color-success-soft)]'
    : isNotStarted
      ? 'border-dashed border-[var(--color-border)] bg-[var(--color-surface)]'
      : 'border-[var(--color-border-light)] bg-[var(--color-surface)]';

  const accentBarColor = isComplete
    ? 'bg-[var(--color-success)]'
    : isNotStarted
      ? 'bg-[var(--color-border)]'
      : 'bg-[var(--color-accent)]';

  const actionLabel = isComplete ? 'Review' : isNotStarted ? 'Start' : 'Continue';

  const variantSize =
    variant === 'primary' ? 'lg:col-span-2' : '';

  return (
    <div
      className={`group card-stagger relative w-full overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)] ${stateStyles} ${variantSize}`}
      style={{ animationDelay: `${animationDelayMs}ms` }}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${accentBarColor}`} />

      <div className="flex h-full flex-col justify-between p-5 pl-6 sm:p-6 sm:pl-7">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-3">
            <h2
              className="text-[var(--color-text)] tracking-tight"
              style={{ fontSize: 'var(--text-subheading)', fontWeight: 600 }}
            >
              {skillName}
            </h2>
            {isComplete ? (
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-success)]">
                <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            ) : (
              <span
                className="flex-shrink-0 text-[var(--color-text)]"
                style={{ fontSize: '1.5rem', fontWeight: 300 }}
              >
                {progressPercentage}<span className="text-[var(--color-text-subtle)]" style={{ fontSize: 'var(--text-body)' }}>%</span>
              </span>
            )}
          </div>
          <p className="mt-1 text-[var(--color-text-muted)]" style={{ fontSize: 'var(--text-caption)' }}>
            {completedSubtopics} of {totalSubtopics} topics
            {typeof estimatedHours === 'number' ? ` · ${estimatedHours}h est.` : ''}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border-light)]">
            <div
              className={`h-1.5 rounded-full transition-all duration-700 ease-out ${
                isComplete ? 'bg-[var(--color-success)]' : 'bg-[var(--color-accent)] progress-shimmer'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Next topic preview */}
        {nextTopicName && !isComplete ? (
          <p className="mb-4 text-[var(--color-text-subtle)]" style={{ fontSize: 'var(--text-overline)' }}>
            Next: {nextTopicName}
          </p>
        ) : null}

        {/* Action */}
        {onContinue ? (
          <button
            type="button"
            onClick={onContinue}
            disabled={disableActions}
            aria-label={`${actionLabel} learning ${skillName}`}
            className={isComplete ? 'btn-secondary w-full' : 'btn-primary w-full'}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default SkillCard;
