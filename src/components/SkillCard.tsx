interface SkillCardProps {
  skillName?: string;
  progress?: number;
  subtopicsLeft?: number;
  totalSubtopics?: number;
  estimatedHours?: number;
  onContinue?: () => void;
  onComplete?: () => void;
  disableActions?: boolean;
  variant?: 'primary' | 'secondary' | 'compact';
}

const SkillCard = ({
  skillName = 'React JS',
  progress = 65,
  subtopicsLeft = 8,
  totalSubtopics = 20,
  estimatedHours,
  onContinue,
  onComplete,
  disableActions = false,
  variant = 'secondary',
}: SkillCardProps) => {
  const progressPercentage = Math.min(100, Math.max(0, progress));
  const completedSubtopics = totalSubtopics - subtopicsLeft;

  const variantClasses = {
    primary:
      'border-[var(--color-accent-soft)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-raised)] lg:col-span-2',
    secondary:
      'border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]',
    compact:
      'border-[var(--color-border)] bg-[var(--color-surface-muted)] shadow-[var(--shadow-soft)]',
  };

  const titleClasses = {
    primary: 'text-3xl',
    secondary: 'text-2xl',
    compact: 'text-xl',
  };
  
  return (
    <div
      className={`group w-full overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-0.5 ${variantClasses[variant]}`}
    >
      <div className="flex h-full min-h-[220px] flex-col justify-between p-6 sm:p-8">
        
        <div className="space-y-1">
          <h2 className={`${titleClasses[variant]} font-light tracking-tight text-[var(--color-text)]`}>
            {skillName}
          </h2>
          <p className="text-sm font-normal text-[var(--color-text-muted)]">
            {subtopicsLeft} remaining of {totalSubtopics}
          </p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <div className="mb-1 text-4xl font-light text-[var(--color-text)]">
              {progressPercentage}<span className="text-2xl text-[var(--color-text-muted)]">%</span>
            </div>
            <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              Complete
            </div>
            {typeof estimatedHours === 'number' ? (
              <div className="mt-2 text-xs text-[var(--color-text-muted)]">{estimatedHours}h estimated</div>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="h-1 w-full rounded-full bg-[var(--color-border)]">
              <div 
                className="h-1 rounded-full bg-[var(--color-accent)] transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--color-text-muted)]">
                {completedSubtopics} completed
              </span>
              <span className="font-medium text-[var(--color-text)]">
                {progressPercentage < 100 ? 'In Progress' : 'Complete'}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {onContinue ? (
              <button
                type="button"
                onClick={onContinue}
                disabled={disableActions}
                aria-label={`Continue learning ${skillName}`}
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-muted)]"
              >
                Continue
              </button>
            ) : null}
            {onComplete ? (
              <button
                type="button"
                onClick={onComplete}
                disabled={progressPercentage === 100 || disableActions}
                aria-label={`Mark ${skillName} as complete`}
                className="flex-1 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm text-white transition-colors hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Mark Complete
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillCard;
