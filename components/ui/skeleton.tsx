import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export function WordCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
      <div className="space-y-3">
        {/* Image skeleton */}
        <Skeleton className="w-full h-40 rounded-lg" />

        {/* Title and action row */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

export function WordListSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-16 h-16 rounded-lg" />
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-6 w-6 rounded" />
      </div>
    </div>
  );
}

export function TopicCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
      <div className="text-center space-y-4">
        <Skeleton className="w-12 h-12 rounded-lg mx-auto" />
        <Skeleton className="h-6 w-24 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-16 rounded-full mx-auto" />
      </div>
    </div>
  );
}

export function FlashcardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl p-6 text-center space-y-4 mx-16 relative">
      <Skeleton className="absolute top-4 right-4 h-8 w-8 rounded" />
      <Skeleton className="h-4 w-16 mx-auto" />
      <Skeleton className="w-48 h-32 rounded-xl mx-auto" />
      <div className="space-y-2">
        <Skeleton className="h-12 w-32 mx-auto" />
        <Skeleton className="h-4 w-4 rounded-full mx-auto" />
        <Skeleton className="h-6 w-24 rounded-full mx-auto" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
      </div>
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-4 w-64 mx-auto" />
    </div>
  );
}

interface SkeletonGridProps {
  count?: number;
  type?: "card" | "list" | "topic";
}

export function SkeletonGrid({ count = 8, type = "card" }: SkeletonGridProps) {
  const SkeletonComponent =
    type === "list"
      ? WordListSkeleton
      : type === "topic"
      ? TopicCardSkeleton
      : WordCardSkeleton;

  const gridClass =
    type === "list"
      ? "space-y-3"
      : type === "topic"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";

  return (
    <div className={gridClass}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}

export { Skeleton };
