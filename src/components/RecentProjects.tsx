import { Folder, ChevronRight, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace-store";

interface RecentProjectsProps {
  onSelect?: (path: string) => void;
  /** Maximum rows to show. Defaults to 5. */
  limit?: number;
}

export function RecentProjects({ onSelect, limit = 5 }: RecentProjectsProps) {
  const projects = useWorkspaceStore((s) => s.projects);
  // Dashboard shows the top N most-recently opened projects
  const visible = projects.slice(0, limit);

  const formatName = (path: string) =>
    path.split(/[/\\]/).filter(Boolean).pop() || "Project";

  if (visible.length === 0) {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-headline text-ink">Recent Projects</h3>
        </div>
        <div className="-mx-2 px-2 py-4 text-sm text-muted">No recent projects</div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-headline text-ink">Recent Projects</h3>
        {projects.length > limit && (
          <span className="font-label text-xs text-muted">
            +{projects.length - limit} more in History
          </span>
        )}
      </div>

      <div className="-mx-2">
        {visible.map((project, i) => (
          <div
            key={project.id}
            onClick={() => onSelect?.(project.project_path)}
            className={cn(
              "group flex cursor-pointer items-center justify-between rounded-lg px-2 py-3 transition-colors hover:bg-accent-muted",
              i < visible.length - 1 && "border-b border-hairline",
            )}
          >
            <div className="flex items-center gap-4">
              {project.has_snapshot ? (
                <Archive className="h-5 w-5 shrink-0 text-accent/60 group-hover:text-accent transition-colors" strokeWidth={2} />
              ) : (
                <Folder className="h-5 w-5 shrink-0 text-muted group-hover:text-ink transition-colors" strokeWidth={2} />
              )}
              <div className="min-w-0">
                <p className="font-sans text-sm font-medium text-ink">
                  {formatName(project.project_path)}
                </p>
                <p className="mt-1 font-label text-xs text-muted truncate max-w-[320px]">
                  {project.project_path}
                </p>
              </div>
            </div>
            <ChevronRight
              className={cn(
                "h-4 w-4 shrink-0 text-muted opacity-0",
                "-translate-x-2 transform transition-all duration-200",
                "group-hover:translate-x-0 group-hover:opacity-100",
              )}
              strokeWidth={2}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
