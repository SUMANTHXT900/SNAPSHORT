import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, FolderOpen, Copy, Plus, X } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { Button } from "@/components/ui/button";

export function SuccessOverlay() {
  const showSuccess = useWorkspaceStore((s) => s.showSuccess);
  const result = useWorkspaceStore((s) => s.result);
  const dismissSuccess = useWorkspaceStore((s) => s.dismissSuccess);
  const outputPaths = useWorkspaceStore((s) => s.outputPaths);

  const fileCount = result?.files_included ?? 0;
  const packageCount = result?.package_count ?? 0;

  const handleCopyPath = async () => {
    if (outputPaths.length > 0) {
      await navigator.clipboard.writeText(outputPaths[0]);
    }
  };

  const handleGenerateAnother = () => {
    dismissSuccess();
  };

  const handleOpenFolder = async () => {
    if (outputPaths.length > 0) {
      try {
        // Try to use the Tauri opener plugin to reveal the file in the file explorer
        const { revealItemInDir } = await import("@tauri-apps/plugin-opener");
        await revealItemInDir(outputPaths[0]);
      } catch {
        // Fallback: copy the directory path to clipboard so user can navigate there
        const path = outputPaths[0];
        const sepIdx = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
        const dir = sepIdx >= 0 ? path.substring(0, sepIdx) : path;
        await navigator.clipboard.writeText(dir);
      }
    }
  };

  return (
    <AnimatePresence>
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-overlay flex items-center justify-center bg-overlay backdrop-blur-sm pointer-events-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
            className="relative flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-hairline bg-surface p-8 shadow-xl"
          >
            <button
              onClick={dismissSuccess}
              className="absolute right-4 top-4 rounded-md p-1 text-muted transition-colors hover:text-ink hover:bg-elevated/60"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-10 w-10 text-success" strokeWidth={1.5} />
            </div>

            <div className="text-center">
              <h2 className="text-xl font-semibold text-ink">Snapshot Generated</h2>
              <p className="mt-2 text-sm text-muted">
                Successfully packaged {fileCount.toLocaleString()} files into {packageCount} package{packageCount !== 1 ? "s" : ""}
              </p>
            </div>

            {outputPaths.length > 0 && (
              <div className="w-full rounded-lg border border-hairline bg-elevated/50 p-3">
                <p className="mb-1 font-label text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Output
                </p>
                <p className="truncate font-mono text-xs text-ink">
                  {outputPaths[0]}
                </p>
                {outputPaths.length > 1 && (
                  <p className="mt-1 text-xs text-faint">
                    +{outputPaths.length - 1} more file{outputPaths.length - 1 !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}

            <div className="flex w-full flex-col gap-2">
              <Button
                variant="primary"
                className="w-full gap-2"
                onClick={handleOpenFolder}
              >
                <FolderOpen className="h-4 w-4" />
                Open Output Folder
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleCopyPath}
                >
                  <Copy className="h-4 w-4" />
                  Copy Path
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 gap-2"
                  onClick={handleGenerateAnother}
                >
                  <Plus className="h-4 w-4" />
                  New Snapshot
                </Button>
              </div>
              <Button
                variant="ghost"
                className="mt-1 text-muted"
                onClick={dismissSuccess}
              >
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
