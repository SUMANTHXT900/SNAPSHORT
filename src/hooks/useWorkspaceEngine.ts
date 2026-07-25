import { useCallback, useState } from "react";
import { useProjectScan } from "./useProjectScan";
import { snapshotService } from "@/services/snapshot";
import type { ProjectStatistics } from "@/types/snapshot";

export interface EngineFile {
  path: string;
  name: string;
  language: string;
  size_bytes: number;
  line_count: number;
  estimated_tokens: number;
  is_binary: boolean;
  included: boolean;
  ignored: boolean;
}

interface UseWorkspaceEngineReturn {
  scanning: boolean;
  ready: boolean;
  stats: ProjectStatistics | null;
  files: EngineFile[];
  root: string | null;
  error: string | null;
  generate: (outputDir: string, format: string) => Promise<{
    output_paths: string[];
    package_count: number;
    files_included: number;
  } | null>;
  generating: boolean;
  outputPaths: string[];
}

export function useWorkspaceEngine(projectPath: string | null): UseWorkspaceEngineReturn {
  const { data, loading: scanning, error: scanError } = useProjectScan(projectPath);
  const [generating, setGenerating] = useState(false);
  const [outputPaths, setOutputPaths] = useState<string[]>([]);

  const generate = useCallback(
    async (outputDir: string, format: string) => {
      console.log("[Snapshort:useWorkspaceEngine.generate] starting. outputDir:", outputDir, "format:", format);
      if (!projectPath) {
        console.warn("[Snapshort:useWorkspaceEngine.generate] abort — no projectPath");
        return null;
      }
      setGenerating(true);
      try {
        const result = await snapshotService.generate({
          project_path: projectPath,
          output_dir: outputDir,
          output_format: format,
          snapshot_mode: "full",
          respect_gitignore: true,
          exclude_node_modules: true,
          include_hidden: false,
          include_binary: false,
          enable_splitting: false,
          split_mode: "lines",
          line_threshold: 1000,
          excluded_paths: [],
          force_included_paths: [],
        });
        console.log("[Snapshort:useWorkspaceEngine.generate] done. outputPaths:", result.output_paths);
        setOutputPaths(result.output_paths);
        return result;
      } catch (e) {
        console.error("[Snapshort:useWorkspaceEngine.generate] FAILED:", e);
        return null;
      } finally {
        setGenerating(false);
      }
    },
    [projectPath],
  );

  const ready = data !== null;
  console.log(
    "[Snapshort:useWorkspaceEngine] state:",
    { scanning, ready, root: data?.root, fileCount: data?.files?.length, error: scanError, generating, outputPaths },
  );

  return {
    scanning,
    ready,
    stats: data?.statistics ?? null,
    files: data?.files ?? [],
    root: data?.root ?? null,
    error: scanError,
    generate,
    generating,
    outputPaths,
  };
}
