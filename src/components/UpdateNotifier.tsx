import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Download, RefreshCw, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function UpdateNotifier() {
  const [update, setUpdate] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "downloading" | "ready" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // 1. Silent automatic startup check after 3 seconds
    const timer = setTimeout(async () => {
      try {
        const { check } = await import("@tauri-apps/plugin-updater");
        const availableUpdate = await check();
        if (availableUpdate) {
          setUpdate(availableUpdate);
          setIsOpen(true);
        }
      } catch (err) {
        // Silently ignore updater errors in dev mode or offline environments
        console.debug("Auto-update check skipped:", err);
      }
    }, 3000);

    // 2. Listen for manual update checks (e.g., from AboutView)
    const handleManualOpen = (e: CustomEvent) => {
      setUpdate(e.detail);
      setIsOpen(true);
    };

    window.addEventListener("snapshort:open-update-modal" as any, handleManualOpen as any);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("snapshort:open-update-modal" as any, handleManualOpen as any);
    };
  }, []);

  const handleInstallAndRestart = async () => {
    if (!update) return;
    setStatus("downloading");
    setProgress(0);
    try {
      let downloadedBytes = 0;
      let totalBytes = 0;

      await update.downloadAndInstall((event: any) => {
        switch (event.event) {
          case "Started":
            totalBytes = event.data.contentLength || 0;
            break;
          case "Progress":
            downloadedBytes += event.data.chunkLength || 0;
            if (totalBytes > 0) {
              setProgress(Math.min(Math.round((downloadedBytes / totalBytes) * 100), 99));
            } else {
              setProgress(50); // Indeterminate pulsing progress
            }
            break;
          case "Finished":
            setProgress(100);
            setStatus("ready");
            break;
        }
      });

      toast.success("Update installed! Restarting Snapshort...");
      
      // Relaunch app into new version
      try {
        const { relaunch } = await import("@tauri-apps/plugin-process");
        await relaunch();
      } catch (err) {
        console.error("Relaunch failed, notifying user:", err);
        toast.info("Please restart Snapshort manually to finish installing the update.");
      }
    } catch (err: any) {
      console.error("Update install failed:", err);
      setStatus("error");
      setErrorMessage(err?.message || "Failed to download update bundle.");
      toast.error("Could not complete update. Please try again later.");
    }
  };

  if (!isOpen || !update) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md rounded-2xl bg-black border border-white/10 p-6 shadow-[0_12px_40px_rgba(0,0,0,1),0_0_25px_rgba(37,99,235,0.25)] relative overflow-hidden"
        >
          {/* Accent glow background */}
          <div className="absolute -right-20 -top-20 w-48 h-48 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent shadow-inner">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-headline text-lg font-bold text-ink">New Update Available!</h3>
                <p className="text-xs font-semibold text-accent mt-0.5">Version {update.version}</p>
              </div>
            </div>
            {status !== "downloading" && (
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-white/5 hover:text-ink transition-colors"
                title="Skip for now"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-4 my-4 max-h-40 overflow-y-auto custom-scrollbar">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Release Notes</p>
            <p className="text-sm text-ink/90 leading-relaxed whitespace-pre-wrap font-sans">
              {update.body || "A new, optimized version of Snapshort is ready with performance enhancements and features."}
            </p>
          </div>

          {status === "downloading" ? (
            <div className="space-y-2 mt-6">
              <div className="flex justify-between text-xs font-medium text-muted">
                <span className="flex items-center gap-1.5 text-accent">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Downloading & installing update...
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300 ease-out shadow-[0_0_10px_rgba(37,99,235,0.8)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : status === "error" ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 mt-4 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 mt-6">
            {status !== "downloading" && (
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-ink transition-colors"
              >
                Skip for Now
              </button>
            )}
            <button
              onClick={handleInstallAndRestart}
              disabled={status === "downloading"}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-accent/90 hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Download className="h-4 w-4" />
              {status === "downloading" ? "Updating..." : "Install & Restart"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
