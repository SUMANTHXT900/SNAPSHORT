import { useEffect, useState } from "react";
import { FolderX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useSnapshotProgress } from "@/hooks/useSnapshotProgress";
import { WorkspaceHeader } from "@/components/WorkspaceHeader";
import { SnapshotSidebar } from "@/components/SnapshotSidebar";
import { ExplorerToolbar } from "@/components/ExplorerToolbar";
import { FileTree } from "@/components/FileTree";
import { StatusBar } from "@/components/StatusBar";
import { SuccessOverlay } from "@/components/SuccessOverlay";
import { SkeletonTree } from "@/components/SkeletonUI";
import { GenerateModal } from "@/components/GenerateModal";

interface WorkspaceProps {
  projectPath: string;
  onBack: () => void;
}

export function Workspace({ projectPath, onBack }: WorkspaceProps) {
  const loadProject = useWorkspaceStore((s) => s.loadProject);
  const scanning = useWorkspaceStore((s) => s.scanning);
  const scanError = useWorkspaceStore((s) => s.scanError);
  const root = useWorkspaceStore((s) => s.root);
  const generating = useWorkspaceStore((s) => s.generating);
  const progress = useWorkspaceStore((s) => s.progress);
  const stage = useWorkspaceStore((s) => s.stage);

  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Subscribe to live progress events from the backend
  useSnapshotProgress();

  // Load project on mount / path change
  useEffect(() => {
    if (projectPath) {
      loadProject(projectPath);
    }
  }, [projectPath, loadProject]);

  const projectName = root
    ? root.split(/[\\/]/).filter(Boolean).pop() ?? "Project"
    : "Snapshort";

  const handleGenerateClick = () => {
    setShowGenerateModal(true);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <WorkspaceHeader
        onBack={onBack}
        projectName={projectName}
        projectPath={projectPath}
        loading={scanning}
      />

      {!scanError && (
        <main className="flex flex-1 overflow-hidden">
          <SnapshotSidebar onGenerate={handleGenerateClick} generating={generating} />
          <section className="flex flex-1 flex-col bg-canvas">
            <ExplorerToolbar />
            {scanning ? (
              <SkeletonTree />
            ) : (
              <>
                <FileTree rootName={projectName} />
                {generating && stage && (
                  <div className="flex items-center gap-3 border-b border-hairline px-6 py-2 text-xs text-muted">
                    <span className="font-medium text-ink">{stage}</span>
                    <span className="text-faint">•</span>
                    <span>{progress.toFixed(0)}%</span>
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-hairline">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                <StatusBar />
              </>
            )}
          </section>
        </main>
      )}

      {scanError && (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm">
          {scanError.includes("unavailable in the browser") ? (
            <div className="max-w-md rounded-2xl border border-yellow-400/30 bg-yellow-400/5 px-6 py-5 text-center">
              <p className="text-sm font-medium text-yellow-400">Snapshort is running outside the Tauri desktop shell.</p>
              <p className="mt-2 text-xs text-muted">
                Tauri dev spawns both a Vite server (this browser tab) and a native desktop window.
                The native desktop window is a separate app — it has full filesystem access and folder pickers.
                Please look for the <strong className="text-ink">Snapshort desktop window</strong> on your taskbar — it may be behind this browser.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-muted/50 mb-6">
                <FolderX className="h-10 w-10 text-muted" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-semibold text-ink">Oops! We couldn't find this project.</h2>
              <p className="text-sm text-muted mt-2">
                The folder might have been moved, renamed, or deleted from your computer.
              </p>
              <code className="mt-4 bg-elevated px-3 py-1.5 rounded-md text-xs font-mono text-faint">
                {projectPath}
              </code>
              <Button onClick={onBack} className="mt-6">
                Return to Dashboard
              </Button>
            </div>
          )}
        </div>
      )}

      <GenerateModal 
        open={showGenerateModal} 
        onOpenChange={setShowGenerateModal} 
        projectName={projectName} 
      />

      {!scanning && !scanError && <SuccessOverlay />}
    </div>
  );
}
