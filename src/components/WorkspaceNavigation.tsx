import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkspaceNavigationProps {
  projectName: string;
  projectPath: string;
  onBack: () => void;
}

export function WorkspaceNavigation({ projectName, projectPath, onBack }: WorkspaceNavigationProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Back / Exit button — red like a close/exit control so it's instantly recognisable */}
      <button
        onClick={onBack}
        className={cn(
          "group flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5",
          "font-label text-xs font-semibold tracking-wide transition-all duration-150",
          // Red palette — idle is muted so it doesn't distract while working,
          // but unmistakably red on hover so users know it exits the workspace.
          "text-red-400/70 hover:text-red-400 hover:bg-red-500/10",
          "active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50",
        )}
        aria-label="Back to Dashboard"
        title="Exit workspace — return to Dashboard"
      >
        <ChevronLeft
          className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-0.5"
          strokeWidth={2}
        />
        <span>Dashboard</span>
      </button>

      {/* Breadcrumb separator */}
      <span className="select-none text-muted/30 text-sm font-light">/</span>

      {/* Workspace identity pill — also clickable to go back */}
      <button
        onClick={onBack}
        className={cn(
          "group flex flex-col text-left rounded-lg px-2 py-1.5",
          "transition-colors duration-150",
          "hover:bg-red-500/5 hover:ring-1 hover:ring-red-400/20",
          "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/30",
        )}
        aria-label={`Exit ${projectName} — return to Dashboard`}
        title={projectPath}
      >
        <span className="font-headline text-base font-semibold text-ink group-hover:text-red-400 transition-colors duration-150">
          {projectName}
        </span>
        <span className="max-w-[300px] truncate font-mono text-xs text-faint group-hover:text-red-400/60 transition-colors duration-150">
          {projectPath}
        </span>
      </button>
    </div>
  );
}
