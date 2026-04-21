type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <h3 className="mb-2 text-xl font-medium text-red-900">{title}</h3>
      <p className="text-red-800">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg border border-red-300 bg-white px-5 py-2 text-red-900 transition-colors hover:bg-red-100"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
