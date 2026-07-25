import { useFolderPicker } from "@/hooks/useFolderPicker";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar } from "@/components/Sidebar";
import { HeroSection } from "@/components/HeroSection";
import { RecentProjects } from "@/components/RecentProjects";
import { SettingsView } from "@/pages/SettingsView";
import { HistoryView } from "@/pages/HistoryView";
import { AboutView } from "@/pages/AboutView";
import { stagger } from "@/theme/animation";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useEffect, useState } from "react";
import { settingsService } from "@/services/settings";

interface DashboardProps {
  onStart: (projectPath: string) => void;
}

export function Dashboard({ onStart }: DashboardProps) {
  const { pick, notTauriWarning } = useFolderPicker();
  const [activeView, setActiveView] = useState<"dashboard" | "history" | "settings" | "about">("dashboard");

  // Load persisted settings into the store on mount
  useEffect(() => {
    settingsService.load().then((settings) => {
      useWorkspaceStore.setState({
        projects: settings.projects || [],
        generatedOutputDir: settings.last_output_dir || null,
        recentExportDirs: settings.recent_export_dirs || [],
      });
    });
  }, []);

  const handleStart = async (pathOverride?: string) => {
    const path =
      typeof pathOverride === "string" && pathOverride.trim()
        ? pathOverride
        : await pick() ?? null;

    if (path) {
      useWorkspaceStore.getState().addRecentProject(path);
      onStart(path);
    }
  };

  return (
    <>
      <Sidebar activeView={activeView} onNavigate={(v) => { if (v) setActiveView(v); }} />
      <main className="ml-64 flex-1 overflow-y-auto custom-scrollbar px-12 py-12">
        {notTauriWarning && (
          <div className="mx-auto mb-8 max-w-lg rounded-2xl border border-yellow-400/30 bg-yellow-400/5 px-6 py-5 text-center">
            <p className="text-sm font-medium text-yellow-400">
              Snapshort is running outside the Tauri desktop shell.
            </p>
            <p className="mt-2 text-xs text-muted">
              When you run <code className="rounded bg-hairline px-1.5 py-0.5 font-mono text-faint">tauri dev</code>,
              two windows open: a terminal and a native desktop window.
              The native window is where you select a project folder.
              Please look for the Snapshort desktop window — it may be behind this browser tab.
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeView === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto flex max-w-[1440px] flex-col gap-16"
            >
              <motion.div variants={stagger.item} initial="hidden" animate="visible">
                <HeroSection onStart={handleStart} />
              </motion.div>

              <motion.div
                variants={stagger.container}
                initial="hidden"
                animate="visible"
                className="mx-auto w-full max-w-4xl"
              >
                <motion.div variants={stagger.item}>
                  <RecentProjects onSelect={handleStart} />
                </motion.div>
              </motion.div>
              <div className="h-8" />
            </motion.div>
          )}

          {activeView === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto flex max-w-[1440px] flex-col"
            >
              <SettingsView />
            </motion.div>
          )}

          {activeView === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto flex max-w-[1440px] flex-col"
            >
              <HistoryView onSelect={handleStart} />
            </motion.div>
          )}

          {activeView === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto flex max-w-[1440px] flex-col"
            >
              <AboutView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
