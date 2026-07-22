export function Loader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3" role="status">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700 dark:border-emerald-900 dark:border-t-emerald-400" />
      {label && (
        <span className="text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
      )}
    </div>
  );
}
