import { Search, CheckCircle, XCircle, RefreshCw, X } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";

export function ExplorerToolbar() {
  const selectAll = useWorkspaceStore((s) => s.selectAll);
  const clearAll = useWorkspaceStore((s) => s.clearAll);
  const loadProject = useWorkspaceStore((s) => s.loadProject);
  const projectPath = useWorkspaceStore((s) => s.projectPath);
  const searchQuery = useWorkspaceStore((s) => s.searchQuery);
  const setSearchQuery = useWorkspaceStore((s) => s.setSearchQuery);

  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-hairline px-6">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" strokeWidth={2} />
        <input
          className="w-full rounded-md border border-hairline bg-canvas py-1.5 pl-9 pr-8 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-faint"
          placeholder="Search files and folders..."
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-faint transition-colors hover:text-ink"
            onClick={() => setSearchQuery("")}
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 text-xs font-medium text-muted">
        <button
          className="flex items-center gap-1.5 transition-colors hover:text-ink"
          onClick={selectAll}
        >
          <CheckCircle className="h-4 w-4" />
          Select All
        </button>
        <button
          className="flex items-center gap-1.5 transition-colors hover:text-ink"
          onClick={clearAll}
        >
          <XCircle className="h-4 w-4" />
          Deselect All
        </button>
        <span className="mx-1 h-4 w-px bg-hairline" />
        <button
          className="rounded p-1 transition-colors hover:bg-accent-muted hover:text-ink"
          onClick={() => projectPath && loadProject(projectPath)}
          title="Re-scan project"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
