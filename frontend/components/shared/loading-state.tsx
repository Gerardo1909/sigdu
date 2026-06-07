import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  /** Number of skeleton rows/cards to show */
  count?: number;
  /** Layout variant */
  variant?: "cards" | "rows";
}

export function LoadingState({ count = 6, variant = "cards" }: LoadingStateProps) {
  if (variant === "rows") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-white/10 p-5">
          <Skeleton className="h-5 w-3/4 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-4 w-1/3 rounded" />
        </div>
      ))}
    </div>
  );
}
