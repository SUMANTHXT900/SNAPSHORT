import { CheckCircle2, Disc, Loader2 } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace-store";

export function StatusBar() {
  const statistics = useWorkspaceStore((s) => s.statistics);
  const generating = useWorkspaceStore((s) => s.generating);
  const stage = useWorkspaceStore((s) => s.stage);
  const progress = useWorkspaceStore((s) => s.progress);
  const currentFile = useWorkspaceStore((s) => s.currentFile);
  const filesProcessed = useWorkspaceStore((s) => s.filesProcessed);
  const totalFiles = useWorkspaceStore((s) => s.totalFiles);
  const estimatedRemaining = useWorkspaceStore((s) => s.estimatedRemaining);

  if (generating) {
    const remaining = estimatedRemaining != null
      ? `~${Math.round(estimatedRemaining / 1000)}s remaining`
      : "";

    return (
      <div className="flex h-12 shrink-0 items-center justify-between border-t border-hairline bg-canvas px-6">
        <div className="flex items-center gap-3 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-accent" strokeWidth={2} />
          <span className="font-medium text-ink">{stage}</span>
          <span className="text-faint">&bull;</span>
          <span className="text-xs text-faint">
            {filesProcessed}/{totalFiles} files
            {currentFile && ` — ${currentFile}`}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-hairline">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className="font-mono text-xs text-muted">{Math.round(progress)}%</span>
          {remaining && <span className="text-xs text-faint">{remaining}</span>}
        </div>
      </div>
    );
  }

  const { selected_files, ignored_files, total_size_bytes } = statistics;

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-t border-hairline bg-canvas px-6">
      <div className="flex items-center gap-3 text-sm">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" strokeWidth={2.5} />
        <span className="font-medium text-ink">Ready to generate snapshot</span>
        {selected_files > 0 && (
          <>
            <span className="text-faint">&bull;</span>
            <span className="text-xs text-faint">{selected_files.toLocaleString()} files selected</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-muted">Selected</span>
          <span className="ml-2 font-mono text-ink">{selected_files.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-400" />
          <span className="text-muted">Ignored</span>
          <span className="ml-2 font-mono text-ink">{ignored_files.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 border-l border-hairline pl-8">
          <Disc className="h-4 w-4 text-violet-400" strokeWidth={2} />
          <span className="text-muted">Selected Size</span>
          <span className="ml-2 font-mono text-ink">{formatBytes(total_size_bytes)}</span>
        </div>
      </div>
    </div>
  );
}
