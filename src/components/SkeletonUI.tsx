import { cn } from "@/lib/utils";

export function SkeletonTree() {
  return (
    <div className="flex-1 animate-pulse overflow-hidden px-2 py-4">
      <div className="flex flex-col gap-1">
        {/* Root */}
        <div className="flex items-center gap-3 py-2 pl-4">
          <div className="h-4 w-4 shrink-0 rounded bg-accent/20" />
          <div className="h-4 w-4 shrink-0 rounded bg-accent/20" />
          <div className="h-4 w-32 rounded bg-muted/20" />
        </div>
        
        {/* Children mock */}
        <div className="ml-5 mt-2 flex flex-col gap-2 border-l border-hairline pl-5">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5" style={{ opacity: 1 - i * 0.05 }}>
              <div className="h-4 w-4 shrink-0 rounded bg-accent/10" />
              <div className="h-4 w-4 shrink-0 rounded bg-muted/10" />
              <div
                className="h-4 rounded bg-muted/10"
                style={{ width: `${Math.max(40, Math.random() * 200)}px` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="flex animate-pulse items-center justify-center gap-10">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={cn("flex items-start gap-4", i > 0 && "border-l border-hairline pl-10")}>
          <div className="mt-1 h-5 w-5 rounded bg-muted/20" />
          <div className="flex flex-col gap-2">
            <div className="h-3 w-20 rounded bg-muted/20" />
            <div className="h-6 w-16 rounded bg-muted/20" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-muted/20" />
              <div className="h-2 w-12 rounded bg-muted/20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
