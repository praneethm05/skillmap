type LoadingSkeletonProps = {
  variant?: 'cards' | 'journey';
};

const Pulse = ({ className }: { className: string }) => (
  <div className={`skeleton-shimmer rounded ${className}`} />
);

const CardSkeleton = () => (
  <div className="w-full overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-6">
    <Pulse className="mb-5 h-5 w-3/5" />
    <Pulse className="mb-3 h-3 w-2/5" />
    <Pulse className="mb-5 h-1.5 w-full" />
    <Pulse className="h-9 w-full rounded-[0.625rem]" />
  </div>
);

const JourneySkeleton = () => (
  <div className="space-y-5">
    <Pulse className="h-8 w-2/5" />
    <Pulse className="h-4 w-3/5" />
    <div className="glass-card p-5">
      <Pulse className="mb-3 h-5 w-1/4" />
      <Pulse className="h-1.5 w-full" />
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4">
          <Pulse className="h-7 w-7 !rounded-full flex-shrink-0" />
          <div className="flex-1 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-5">
            <Pulse className="mb-3 h-4 w-3/4" />
            <Pulse className="h-12 w-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function LoadingSkeleton({ variant = 'cards' }: LoadingSkeletonProps) {
  if (variant === 'journey') {
    return (
      <div aria-busy="true" aria-live="polite" aria-label="Loading journey">
        <JourneySkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-live="polite" aria-label="Loading skill cards">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
