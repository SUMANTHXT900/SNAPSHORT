import { RecentSnapshots } from "@/components/RecentSnapshots";
import { History, Trash2 } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HistoryViewProps {
  onSelect: (path: string) => void;
}

export function HistoryView({ onSelect }: HistoryViewProps) {
  const projects = useWorkspaceStore((s) => s.projects);
  const clearProjects = useWorkspaceStore((s) => s.clearProjects);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearAll = async () => {
    if (!confirmClear) {
      // First click: arm the button
      setConfirmClear(true);
      // Auto-disarm after 3 s if user doesn't confirm
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    // Second click: actually clear
    await clearProjects();
    setConfirmClear(false);
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-muted">
            <History className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight text-ink">
              Project History
            </h1>
            <p className="text-sm text-muted mt-1">
              Click any row to re-open that project.
              Hover a row to reveal the&nbsp;
              <Trash2 className="inline h-3 w-3 relative -top-px" strokeWidth={2} />
              &nbsp;delete button.
            </p>
          </div>
        </div>

        {/* Clear all button — two-step confirmation */}
        {projects.length > 0 && (
          <button
            onClick={handleClearAll}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5",
              "font-label text-xs font-medium tracking-wide transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50",
              confirmClear
                ? "bg-red-500/10 text-red-400 ring-1 ring-red-400/30 animate-pulse"
                : "text-muted hover:text-red-400 hover:bg-red-500/10",
            )}
            title={confirmClear ? "Click again to confirm" : "Clear all history"}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
            {confirmClear ? "Confirm clear?" : "Clear all"}
          </button>
        )}
      </div>

      {/* Tabs: All | Snapshots only */}
      <HistoryTabs onSelect={onSelect} />
    </div>
  );
}

function HistoryTabs({ onSelect }: { onSelect: (path: string) => void }) {
  const [tab, setTab] = useState<"all" | "snapshots">("all");
  const projects = useWorkspaceStore((s) => s.projects);
  const snapshotCount = projects.filter((p) => p.has_snapshot).length;

  return (
    <div className="rounded-xl border border-hairline bg-surface shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-hairline">
        {(["all", "snapshots"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 font-label text-xs font-semibold uppercase tracking-wider transition-colors",
              tab === t
                ? "border-b-2 border-accent text-accent -mb-px"
                : "text-muted hover:text-ink",
            )}
          >
            {t === "all" ? (
              <>All Projects <span className="rounded-full bg-hairline px-1.5 py-0.5 font-mono text-[10px] text-faint">{projects.length}</span></>
            ) : (
              <>Snapshots only <span className="rounded-full bg-hairline px-1.5 py-0.5 font-mono text-[10px] text-faint">{snapshotCount}</span></>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        <RecentSnapshots onSelect={onSelect} showAll={tab === "all"} />
      </div>
    </div>
  );
}
