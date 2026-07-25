import { create } from "zustand";
import { snapshotService } from "@/services/snapshot";
import { settingsService } from "@/services/settings";
import type { AnalyzedFileOutput, ProjectStatistics, SnapshotResult, SnapshotSummary, ProgressEvent, WarningEvent } from "@/types/snapshot";
import type { SnapshotConfig } from "@/types/config";

// ── Helpers ──────────────────────────────────────────────────

/** Single-pass stats computation (avoids 3× filter over the file array). */
function computeStats(files: WorkspaceFile[]): ProjectStatistics {
  let selected = 0, ignored = 0, binary = 0, sizeBytes = 0, tokens = 0, lines = 0;
  for (const f of files) {
    if (f.effectiveIncluded) {
      selected++;
      sizeBytes += f.size_bytes;
      tokens += f.estimated_tokens;
      lines += f.line_count;
    }
    if (f.ignored && !f.effectiveIncluded) ignored++;
    if (f.is_binary) binary++;
  }
  return {
    total_files: files.length,
    selected_files: selected,
    ignored_files: ignored,
    binary_files: binary,
    empty_files: 0,
    total_size_bytes: sizeBytes,
    estimated_tokens: tokens,
    estimated_lines: lines,
  };
}

function computeEffectiveFiles(
  files: AnalyzedFileOutput[],
  overrides: Record<string, "included" | "excluded">,
): WorkspaceFile[] {
  return files.map((f) => ({
    ...f,
    effectiveIncluded: overrides[f.path] === "included"
      ? true
      : overrides[f.path] === "excluded"
        ? false
        : f.included,
  }));
}

/** Recompute effective files + stats and return a partial state update. */
function recompute(scannedFiles: AnalyzedFileOutput[], overrides: Record<string, "included" | "excluded">) {
  const effectiveFiles = computeEffectiveFiles(scannedFiles, overrides);
  return { effectiveFiles, statistics: computeStats(effectiveFiles) };
}

/** Shared helper: load settings → mutate → save → return the new projects list. */
async function updateProjects(
  mutate: (current: SnapshotSummary[]) => SnapshotSummary[],
): Promise<SnapshotSummary[]> {
  const settings = await settingsService.load();
  const updated = mutate(settings.projects || []);
  settings.projects = updated;
  await settingsService.save(settings);
  return updated;
}

function timestamp(): string {
  return new Date().toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function projectNameFromPath(path: string): string {
  return path.split(/[/\\]/).filter(Boolean).pop() || "Project";
}

// Default config
const defaultConfig: SnapshotConfig = {
  output_format: "markdown",
  snapshot_mode: "full",
  split_mode: "lines",
  respect_gitignore: true,
  exclude_node_modules: true,
  include_hidden: false,
  include_binary: false,
  enable_splitting: false,
  line_threshold: 1000,
  global_excludes: [
    ".class", ".jar", ".war", ".ear", ".nar", ".jpi", ".hpi", ".apk",
    ".pyc", ".pyo", ".pyd", ".egg", ".whl", ".ipynb_checkpoints", "__pycache__", ".pytest_cache", ".venv", "venv", "env", ".tox",
    ".o", ".obj", ".so", ".dll", ".dylib", ".exe", ".lib", ".a", ".out", ".app", "target", "CMakeCache.txt", "CMakeFiles",
    "node_modules", "dist", "build", "out", ".next", ".nuxt", ".svelte-kit", ".angular", "coverage", ".cache", ".parcel-cache", ".turbo",
    "bin", "obj", ".suo", ".user",
    "vendor", ".bundle",
    ".idea", ".vscode", ".vs", ".eclipse", ".DS_Store", "Thumbs.db", "ehthumbs.db", ".Spotlight-V100", ".Trashes",
    ".log", ".tmp", ".bak", ".swp", ".swo", "~",
  ],
};

export const DEFAULT_GLOBAL_EXCLUDES = defaultConfig.global_excludes;

// ── Types ────────────────────────────────────────────────────

export interface WorkspaceFile extends AnalyzedFileOutput {
  effectiveIncluded: boolean;
}

export type FolderState = "selected" | "partial" | "unselected";

export interface TreeNode {
  name: string;
  path: string;
  children: TreeNode[];
  files: WorkspaceFile[];
  state: FolderState;
}

// ── Store interface ──────────────────────────────────────────

interface WorkspaceState {
  projectPath: string | null;
  root: string | null;
  scannedFiles: AnalyzedFileOutput[];
  scanning: boolean;
  scanError: string | null;
  selectionOverrides: Record<string, "included" | "excluded">;
  config: SnapshotConfig;
  generatedOutputDir: string | null;

  generating: boolean;
  progress: number;
  stage: string | null;
  currentFile: string | null;
  filesProcessed: number;
  totalFiles: number;
  estimatedRemaining: number | null;
  warnings: WarningEvent[];
  result: SnapshotResult | null;
  showSuccess: boolean;
  outputPaths: string[];

  effectiveFiles: WorkspaceFile[];
  statistics: ProjectStatistics;
  searchQuery: string;

  // Unified project history — single array for Dashboard + History
  projects: SnapshotSummary[];
  recentExportDirs: string[];

  // Actions
  loadProject: (path: string) => Promise<void>;
  toggleFile: (path: string) => void;
  toggleFolder: (prefixPath: string) => void;
  selectAll: () => void;
  clearAll: () => void;
  setConfig: (partial: Partial<SnapshotConfig>) => void;
  setGeneratedOutputDir: (dir: string | null) => void;
  setSearchQuery: (q: string) => void;
  generate: (options?: { outputFileName?: string }) => Promise<void>;
  receiveProgress: (evt: ProgressEvent) => void;
  pushWarning: (w: WarningEvent) => void;
  dismissSuccess: () => void;
  reset: () => void;
  addRecentProject: (path: string) => Promise<void>;
  addRecentSnapshot: (s: SnapshotSummary) => Promise<void>;
  removeProject: (projectPath: string) => Promise<void>;
  clearProjects: () => Promise<void>;
  addGlobalExclude: (ext: string) => Promise<void>;
}

// ── File tree helpers ────────────────────────────────────────

export function getFilesUnderPrefix<T extends AnalyzedFileOutput>(files: T[], prefix: string): T[] {
  if (!prefix) return files;
  const n = prefix.replace(/\\/g, "/");
  return files.filter((f) => f.path.replace(/\\/g, "/").startsWith(n + "/"));
}

export function buildFileTree(files: WorkspaceFile[]): TreeNode {
  const root: TreeNode = { name: "", path: "", children: [], files: [], state: "unselected" };

  for (const f of files) {
    const parts = f.path.replace(/\\/g, "/").split("/");
    let node = root;
    let currentPath = "";
    for (let i = 0; i < parts.length; i++) {
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
      if (i === parts.length - 1) {
        node.files.push(f);
      } else {
        let child = node.children.find((c) => c.name === parts[i]);
        if (!child) {
          child = { name: parts[i], path: currentPath, children: [], files: [], state: "unselected" };
          node.children.push(child);
        }
        node = child;
      }
    }
  }

  computeNodeBottomUp(root);
  return root;
}

function computeNodeBottomUp(node: TreeNode): { total: number; included: number } {
  node.children.sort((a, b) => a.name.localeCompare(b.name));
  node.files.sort((a, b) => a.name.localeCompare(b.name));

  let total = node.files.length;
  let included = node.files.filter((f) => f.effectiveIncluded).length;

  for (const child of node.children) {
    const c = computeNodeBottomUp(child);
    total += c.total;
    included += c.included;
  }

  node.state = total === 0 || included === 0 ? "unselected" : included === total ? "selected" : "partial";
  return { total, included };
}

// ── Zero state ───────────────────────────────────────────────

const zeroStats: ProjectStatistics = {
  total_files: 0, selected_files: 0, ignored_files: 0, binary_files: 0,
  empty_files: 0, total_size_bytes: 0, estimated_tokens: 0, estimated_lines: 0,
};

// ── Store implementation ─────────────────────────────────────

let rescanTimeout: number | undefined;

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  projectPath: null,
  root: null,
  scannedFiles: [],
  scanning: false,
  scanError: null,
  selectionOverrides: {},
  config: { ...defaultConfig },
  generatedOutputDir: null,
  generating: false,
  progress: 0,
  stage: null,
  currentFile: null,
  filesProcessed: 0,
  totalFiles: 0,
  estimatedRemaining: null,
  warnings: [],
  result: null,
  showSuccess: false,
  outputPaths: [],
  effectiveFiles: [],
  statistics: { ...zeroStats },
  searchQuery: "",
  projects: [],
  recentExportDirs: [],

  // ── Project history (unified) ─────────────────────────────

  addRecentProject: async (path) => {
    const projects = await updateProjects((current) => {
      const existing = current.find((p) => p.project_path === path);
      const entry: SnapshotSummary = existing
        ? { ...existing, created_at: existing.has_snapshot ? existing.created_at : timestamp() }
        : { id: crypto.randomUUID(), project_name: projectNameFromPath(path), project_path: path, created_at: timestamp(), package_count: 0, has_snapshot: false };
      return [entry, ...current.filter((p) => p.project_path !== path)].slice(0, 30);
    });
    set({ projects });
  },

  addRecentSnapshot: async (snapshot) => {
    const projects = await updateProjects((current) => {
      const entry: SnapshotSummary = { ...snapshot, has_snapshot: true };
      return [entry, ...current.filter((p) => p.project_path !== snapshot.project_path)].slice(0, 30);
    });
    set({ projects });
  },

  removeProject: async (projectPath) => {
    const projects = await updateProjects((current) => current.filter((p) => p.project_path !== projectPath));
    set({ projects });
  },

  clearProjects: async () => {
    const projects = await updateProjects(() => []);
    set({ projects });
  },

  // ── Workspace scanning ────────────────────────────────────

  loadProject: async (path) => {
    set({ projectPath: path, scanning: true, scanError: null, selectionOverrides: {}, result: null, showSuccess: false, outputPaths: [] });
    try {
      const result = await snapshotService.scan(path, get().config);
      set({ scannedFiles: result.files, root: result.root, scanning: false, ...recompute(result.files, {}) });
    } catch (e) {
      set({ scanError: e instanceof Error ? e.message : String(e), scanning: false });
    }
  },

  toggleFile: (path) => {
    const { scannedFiles, effectiveFiles, selectionOverrides } = get();
    const file = scannedFiles.find((f) => f.path === path);
    const eff = effectiveFiles.find((f) => f.path === path);
    if (!file || !eff) return;

    const newOverrides = { ...selectionOverrides };
    if (eff.effectiveIncluded) {
      newOverrides[path] = "excluded";
    } else if (file.included) {
      delete newOverrides[path];
    } else {
      newOverrides[path] = "included";
    }
    set({ selectionOverrides: newOverrides, ...recompute(scannedFiles, newOverrides) });
  },

  toggleFolder: (prefixPath) => {
    const { scannedFiles, effectiveFiles, selectionOverrides } = get();
    const children = getFilesUnderPrefix(scannedFiles, prefixPath);
    if (children.length === 0) return;

    const np = prefixPath.replace(/\\/g, "/");
    const childEff = np === ""
      ? effectiveFiles
      : effectiveFiles.filter((f) => f.path.replace(/\\/g, "/").startsWith(np + "/"));

    const allSelected = childEff.length > 0 && childEff.every((f) => f.effectiveIncluded);
    const newOverrides = { ...selectionOverrides };

    for (const child of children) {
      if (allSelected) {
        if (child.included) newOverrides[child.path] = "excluded";
        else if (newOverrides[child.path] === "included") delete newOverrides[child.path];
      } else {
        if (!child.included) newOverrides[child.path] = "included";
        else if (newOverrides[child.path] === "excluded") delete newOverrides[child.path];
      }
    }
    set({ selectionOverrides: newOverrides, ...recompute(scannedFiles, newOverrides) });
  },

  selectAll: () => {
    const { scannedFiles, selectionOverrides } = get();
    const newOverrides = { ...selectionOverrides };
    for (const f of scannedFiles) {
      if (f.ignored || f.is_binary) continue;
      if (f.included) { if (newOverrides[f.path] === "excluded") delete newOverrides[f.path]; }
      else newOverrides[f.path] = "included";
    }
    set({ selectionOverrides: newOverrides, ...recompute(scannedFiles, newOverrides) });
  },

  clearAll: () => {
    const { scannedFiles, selectionOverrides } = get();
    const newOverrides = { ...selectionOverrides };
    for (const f of scannedFiles) {
      if (f.ignored || f.is_binary) continue;
      if (f.included) newOverrides[f.path] = "excluded";
      else if (newOverrides[f.path] === "included") delete newOverrides[f.path];
    }
    set({ selectionOverrides: newOverrides, ...recompute(scannedFiles, newOverrides) });
  },

  setConfig: (partial) => {
    set((s) => ({ config: { ...s.config, ...partial } }));

    const needsRescan =
      partial.respect_gitignore !== undefined ||
      partial.exclude_node_modules !== undefined ||
      partial.include_hidden !== undefined ||
      partial.include_binary !== undefined;

    if (!needsRescan) return;
    if (rescanTimeout) clearTimeout(rescanTimeout);

    rescanTimeout = window.setTimeout(async () => {
      const state = get();
      if (!state.projectPath) return;

      if (state.scanning) {
        try {
          const { invokeTauri } = await import("../lib/tauri");
          await invokeTauri("cancel_scan");
        } catch (e) { console.error("Failed to cancel scan:", e); }
        await new Promise((r) => setTimeout(r, 100));
      }

      set({ scanning: true });
      const saved = { ...state.selectionOverrides };

      try {
        const result = await snapshotService.scan(state.projectPath, get().config);
        set({ scannedFiles: result.files, root: result.root, selectionOverrides: saved, scanning: false, ...recompute(result.files, saved) });
      } catch (e) {
        console.error("Background rescan failed:", e);
        set({ scanning: false });
      }
    }, 300);
  },

  addGlobalExclude: async (ext) => {
    const state = get();
    const currentExcludes = state.config.global_excludes || [];
    if (currentExcludes.includes(ext)) return;

    const newExcludes = [...currentExcludes, ext];
    set({ config: { ...state.config, global_excludes: newExcludes } });

    const updatedScanned = state.scannedFiles.map((f) =>
      (f.name === ext || f.path.includes(ext) || f.name.endsWith(ext))
        ? { ...f, ignored: true, included: false }
        : f,
    );
    set({ scannedFiles: updatedScanned, ...recompute(updatedScanned, state.selectionOverrides) });

    const settings = await settingsService.load();
    settings.global_excludes = newExcludes;
    await settingsService.save(settings);
  },

  setGeneratedOutputDir: (dir) => {
    set({ generatedOutputDir: dir });
    settingsService.load().then((s) => { s.last_output_dir = dir; settingsService.save(s); });
  },

  setSearchQuery: (q) => set({ searchQuery: q }),

  // ── Snapshot generation ───────────────────────────────────

  generate: async (options) => {
    const { projectPath, config, effectiveFiles, generatedOutputDir, selectionOverrides } = get();
    if (!projectPath) return;

    const excludedPaths: string[] = [];
    const forceIncludedPaths: string[] = [];
    for (const f of effectiveFiles) {
      const o = selectionOverrides[f.path];
      if (o === "excluded") excludedPaths.push(f.path);
      else if (o === "included") forceIncludedPaths.push(f.path);
    }

    set({
      generating: true, progress: 0, stage: "Starting", currentFile: null,
      filesProcessed: 0, totalFiles: effectiveFiles.length, estimatedRemaining: null,
      warnings: [], result: null, showSuccess: false, outputPaths: [],
    });

    try {
      const finalOutputDir = generatedOutputDir || projectPath;

      const result = await snapshotService.generate({
        project_path: projectPath,
        output_dir: finalOutputDir,
        output_format: config.output_format,
        snapshot_mode: config.snapshot_mode,
        respect_gitignore: config.respect_gitignore,
        exclude_node_modules: config.exclude_node_modules,
        include_hidden: config.include_hidden,
        include_binary: config.include_binary,
        enable_splitting: config.enable_splitting,
        split_mode: config.split_mode,
        line_threshold: config.line_threshold,
        excluded_paths: excludedPaths,
        force_included_paths: forceIncludedPaths,
        output_file_name: options?.outputFileName,
      });

      set({ generating: false, progress: 100, stage: "Completed", result, outputPaths: result.output_paths, showSuccess: true });

      // Add to recent export dirs
      settingsService.load().then((s) => {
        const current = s.recent_export_dirs || [];
        const deduped = [finalOutputDir, ...current.filter(d => d !== finalOutputDir)].slice(0, 10);
        s.recent_export_dirs = deduped;
        settingsService.save(s);
        set({ recentExportDirs: deduped });
      });

      get().addRecentSnapshot({
        id: crypto.randomUUID(),
        project_name: projectNameFromPath(projectPath),
        project_path: projectPath,
        created_at: timestamp(),
        package_count: result.output_paths.length,
        has_snapshot: true,
      });
    } catch (e) {
      set({
        generating: false,
        stage: "Failed",
        warnings: [...get().warnings, { kind: "error", path: null, message: e instanceof Error ? e.message : String(e) }],
      });
    }
  },

  receiveProgress: (evt) => set({
    progress: evt.percentage, stage: evt.stage, currentFile: evt.current_file,
    filesProcessed: evt.files_processed, totalFiles: evt.total_files, estimatedRemaining: evt.estimated_remaining_ms,
  }),

  pushWarning: (w) => set((s) => ({ warnings: [...s.warnings, w] })),
  dismissSuccess: () => set({ showSuccess: false, result: null, outputPaths: [], warnings: [] }),

  reset: () => set({
    projectPath: null, root: null, scannedFiles: [], scanning: false, scanError: null,
    selectionOverrides: {}, config: { ...defaultConfig }, generatedOutputDir: null,
    generating: false, progress: 0, stage: null, currentFile: null,
    filesProcessed: 0, totalFiles: 0, estimatedRemaining: null,
    warnings: [], result: null, showSuccess: false, outputPaths: [],
    effectiveFiles: [], statistics: { ...zeroStats }, searchQuery: "",
  }),
}));
