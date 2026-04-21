type LoadingSkeletonProps = {
  variant?: 'cards' | 'journey';
};

const CardSkeleton = () => (
  <div className="w-full rounded-3xl border border-gray-200 bg-white p-8 shadow-sm animate-pulse">
    <div className="mb-8 h-6 w-2/3 rounded bg-gray-200" />
    <div className="mb-4 h-3 w-1/2 rounded bg-gray-200" />
    <div className="h-2 w-full rounded bg-gray-200" />
  </div>
);

const JourneySkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 w-1/3 rounded bg-gray-200" />
    <div className="h-5 w-1/2 rounded bg-gray-200" />
    <div className="rounded-lg border border-gray-100 bg-white p-6">
      <div className="mb-4 h-4 w-1/4 rounded bg-gray-200" />
      <div className="h-2 w-full rounded bg-gray-200" />
    </div>
    <div className="space-y-3">
      <div className="h-16 rounded-lg bg-white" />
      <div className="h-16 rounded-lg bg-white" />
      <div className="h-16 rounded-lg bg-white" />
    </div>
  </div>
);

export default function LoadingSkeleton({ variant = 'cards' }: LoadingSkeletonProps) {
  if (variant === 'journey') {
    return <JourneySkeleton />;
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
