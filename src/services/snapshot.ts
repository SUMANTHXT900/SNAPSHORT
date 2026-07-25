import { invokeTauri } from "../lib/tauri";
import type { SnapshotRequest, SnapshotResult, AnalyzedProject } from "../types/snapshot";
import type { SnapshotConfig } from "../types/config";

export const snapshotService = {
  async generate(req: SnapshotRequest): Promise<SnapshotResult> {
    console.log("[Snapshort:snapshotService.generate] request:", req);
    try {
      const result = await invokeTauri<SnapshotResult>("generate_snapshot_command", { request: req });
      console.log("[Snapshort:snapshotService.generate] result:", result);
      return result;
    } catch (e) {
      console.error("[Snapshort:snapshotService.generate] FAILED:", e);
      throw e;
    }
  },

  async scan(path: string, config?: Partial<SnapshotConfig>): Promise<AnalyzedProject> {
    console.log("[Snapshort:snapshotService.scan] path:", path, "config:", config);
    try {
      const result = await invokeTauri<AnalyzedProject>("scan_project_command", {
        projectPath: path,
        respectGitignore: config?.respect_gitignore ?? true,
        excludeNodeModules: config?.exclude_node_modules ?? true,
        includeHidden: config?.include_hidden ?? false,
        includeBinary: config?.include_binary ?? false,
      });
      console.log("[Snapshort:snapshotService.scan] got", result.file_count, "files, stats:", result.statistics);
      return result;
    } catch (e) {
      console.error("[Snapshort:snapshotService.scan] FAILED:", e);
      throw e;
    }
  },
};
