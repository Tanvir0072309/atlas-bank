export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-rose-100/70 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-rose-100 bg-white p-5 sm:p-6 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3.5">
      <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-2.5 w-1/4" />
      </div>
      <Skeleton className="h-4 w-16 shrink-0" />
    </div>
  );
}
