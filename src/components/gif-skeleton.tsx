export function GifSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card">
      <div className="aspect-video w-full animate-shimmer" />
      <div className="space-y-2 p-3.5">
        <div className="h-4 w-3/4 rounded-lg bg-muted animate-pulse" />
        <div className="flex gap-1.5">
          <div className="h-4 w-12 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-10 rounded-md bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function GifGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <GifSkeleton key={i} />
      ))}
    </div>
  )
}
