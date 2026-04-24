export function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent"
        role="status"
        aria-label={label}
      />
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
