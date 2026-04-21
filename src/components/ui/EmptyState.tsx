type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
      <h3 className="mb-2 text-2xl font-light text-gray-900">{title}</h3>
      <p className="mx-auto max-w-xl text-gray-600">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 rounded-lg bg-gray-900 px-6 py-3 text-white transition-colors hover:bg-gray-800"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
