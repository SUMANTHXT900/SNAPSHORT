import { Archive, Folder, ChevronRight, Trash2, FolderX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace-store";

interface RecentSnapshotsProps {
  /** Called when a row is clicked to open its workspace. */
  onSelect: (path: string) => void;
  /** When true, shows ALL projects (opened + snapshotted). When false (default), shows only snapshotted. */
  showAll?: boolean;
}

export function RecentSnapshots({ onSelect, showAll = false }: RecentSnapshotsProps) {
  const projects = useWorkspaceStore((s) => s.projects);
  const removeProject = useWorkspaceStore((s) => s.removeProject);

  // History view shows everything; snapshot-only mode filters to entries with snapshots
  const visible = showAll ? projects : projects.filter((p) => p.has_snapshot);

  return (
    <section className="flex flex-col gap-4">
      {visible.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-hairline bg-canvas/50">
          <FolderX className="h-8 w-8 text-muted/50" strokeWidth={1.5} />
          <p className="text-sm font-medium text-muted">
            {showAll ? "No projects yet" : "No snapshots generated yet"}
          </p>
          <p className="text-xs text-faint">
            {showAll
              ? "Open a folder from the Dashboard to get started."
              : "Generate a snapshot from a workspace to see it here."}
          </p>
        </div>
      ) : (
        <div className="-mx-2">
          {visible.map((project, i) => {
            const hasValidPath = Boolean(project.project_path?.trim());
            const isClickable = hasValidPath;

            return (
              <div
                key={project.id}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-2 py-3 transition-colors",
                  i < visible.length - 1 && "border-b border-hairline",
                  isClickable ? "hover:bg-accent-muted" : "opacity-50",
                )}
              >
                {/* Clickable left section */}
                <button
                  className={cn(
                    "flex flex-1 items-center gap-4 text-left min-w-0",
                    isClickable ? "cursor-pointer" : "cursor-not-allowed",
                  )}
                  onClick={() => isClickable && onSelect(project.project_path)}
                  disabled={!isClickable}
                  title={
                    !isClickable
                      ? "Project path is unavailable — cannot open workspace"
                      : `Open ${project.project_path}`
                  }
                >
                  {project.has_snapshot ? (
                    <Archive
                      className="h-5 w-5 shrink-0 text-muted group-hover:text-accent transition-colors"
                      strokeWidth={2}
                    />
                  ) : (
                    <Folder
                      className="h-5 w-5 shrink-0 text-muted group-hover:text-ink transition-colors"
                      strokeWidth={2}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-sans text-sm font-medium text-ink truncate">
                        {project.project_name}
                      </p>
                      {project.has_snapshot && (
                        <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 font-label text-[10px] font-semibold text-accent">
                          {project.package_count > 0
                            ? `${project.package_count} pkg${project.package_count !== 1 ? "s" : ""}`
                            : "Snapshot"}
                        </span>
                      )}
                    </div>
                    {project.created_at && (
                      <p className="mt-0.5 font-label text-xs text-muted">
                        {project.has_snapshot ? "Snapshotted" : "Opened"} {project.created_at}
                      </p>
                    )}
                    {hasValidPath ? (
                      <p className="mt-0.5 max-w-[420px] truncate font-mono text-[10px] text-faint">
                        {project.project_path}
                      </p>
                    ) : (
                      <p className="mt-0.5 font-label text-[10px] text-red-400/70 italic">
                        Path unavailable — click trash to remove
                      </p>
                    )}
                  </div>

                  {/* Chevron affordance */}
                  {isClickable && (
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted opacity-0 -translate-x-2",
                        "transform transition-all duration-200",
                        "group-hover:translate-x-0 group-hover:opacity-100",
                      )}
                      strokeWidth={2}
                    />
                  )}
                </button>

                {/* Per-row delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeProject(project.project_path);
                  }}
                  title="Remove from history"
                  className={cn(
                    "ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                    "text-muted/40 opacity-0 transition-all duration-150",
                    "hover:bg-red-500/10 hover:text-red-400",
                    "group-hover:opacity-100",
                    "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50",
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
