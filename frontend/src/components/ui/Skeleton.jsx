export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <SkeletonBlock className="aspect-[4/5] w-full rounded-2xl" />
      <SkeletonBlock className="h-3 w-16" />
      <SkeletonBlock className="h-4 w-3/4" />
      <SkeletonBlock className="h-5 w-24" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 min-[390px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

export function RowsSkeleton({ rows = 6 }) {
  return (
    <div className="divide-y hairline">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4">
          <SkeletonBlock className="size-12 rounded-xl" />
          <SkeletonBlock className="h-4 flex-1" />
          <SkeletonBlock className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
