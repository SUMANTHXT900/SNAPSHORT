import { Folder, FileText, Hash, Database } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { WorkspaceNavigation } from "@/components/WorkspaceNavigation";
import { useWorkspaceStore } from "@/store/workspace-store";
import { SkeletonStats } from "@/components/SkeletonUI";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function pct(part: number, total: number): string {
  if (total === 0) return "—";
  return `${((part / total) * 100).toFixed(2)}% of total`;
}

interface WorkspaceHeaderProps {
  onBack: () => void;
  projectName: string;
  projectPath: string;
  loading?: boolean;
}

export function WorkspaceHeader({ onBack, projectName, projectPath, loading }: WorkspaceHeaderProps) {
  const statistics = useWorkspaceStore((s) => s.statistics);
  const scannedFiles = useWorkspaceStore((s) => s.scannedFiles);

  const total = scannedFiles.length;
  const selected = statistics.selected_files;
  const ignored = statistics.ignored_files;
  const tokens = statistics.estimated_tokens;
  const sizeBytes = statistics.total_size_bytes;
  const tokensPerFile = selected > 0 ? `~ ${formatTokens(Math.round(tokens / selected))} per file` : "—";

  const statItems = [
    { label: "Selected Files", value: selected.toLocaleString(), sub: pct(selected, total), icon: Folder, color: "text-emerald-400", dot: "bg-emerald-400" },
    { label: "Ignored Files", value: ignored.toLocaleString(), sub: pct(ignored, total), icon: FileText, color: "text-blue-400", dot: "bg-blue-400" },
    { label: "Estimated Tokens", value: formatTokens(tokens), sub: tokensPerFile, icon: Hash, color: "text-violet-400", dot: "bg-violet-400" },
    { label: "Output Size", value: formatBytes(sizeBytes), sub: "Snapshot", icon: Database, color: "text-yellow-400", dot: "bg-yellow-400" },
  ];

  return (
    <header className="flex h-[100px] shrink-0 items-center justify-between border-b border-hairline bg-canvas px-6">
      <WorkspaceNavigation
        projectName={projectName}
        projectPath={projectPath}
        onBack={onBack}
      />

      <div className="flex flex-1 items-center justify-center gap-10">
        {loading
          ? <SkeletonStats />
          : statItems.map((stat, i) => (
              <div
                key={stat.label}
                className={cn("flex items-start gap-4", i > 0 && "border-l border-hairline pl-10")}
              >
                <div className={cn("mt-1", stat.color)}>
                  <stat.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 font-label text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {stat.label}
                  </span>
                  <span className="text-xl font-semibold leading-none text-ink">{stat.value}</span>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className={cn("h-2 w-2 rounded-full", stat.dot)} />
                    <span className="text-xs text-faint">{stat.sub}</span>
                  </div>
                </div>
              </div>
            ))}
      </div>

      <div className="w-10" />
    </header>
  );
}
