// Mirrors the Rust IDR models exposed to the frontend.

export type FileStatus = "Included" | "Excluded" | "Ignored" | "Binary" | "Empty";

export interface AnalyzedFile {
  path: string;
  name: string;
  language: string;
  size_bytes: number;
  line_count: number;
  estimated_tokens: number;
  is_binary: boolean;
  encoding: string;
  ignored: boolean;
  included: boolean;
}

export interface ProjectStatistics {
  total_files: number;
  selected_files: number;
  ignored_files: number;
  binary_files: number;
  empty_files: number;
  total_size_bytes: number;
  estimated_tokens: number;
  estimated_lines: number;
}

export interface AnalyzedProject {
  root: string;
  file_count: number;
  dir_count: number;
  files: AnalyzedFileOutput[];
  statistics: ProjectStatistics;
}

/** A single file entry returned by the scan command (no encoded content). */
export interface AnalyzedFileOutput {
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

// Engine events (kept in sync with backend `EngineEvent`).
export type Stage =
  | "Scanning"
  | "Analyzing"
  | "BuildingScp"
  | "Rendering"
  | "WritingOutput"
  | "Completed"
  | "Cancelled"
  | "Failed";

export interface ProgressEvent {
  stage: Stage;
  current_file: string | null;
  files_processed: number;
  total_files: number;
  percentage: number;
  elapsed_ms: number;
  estimated_remaining_ms: number | null;
}

export interface StatisticsEvent {
  estimated_tokens: number;
  estimated_lines: number;
  files_included: number;
  files_ignored: number;
}

export interface WarningEvent {
  kind: string;
  path: string | null;
  message: string;
}

// Command payloads/results (mirror backend command structs).
export interface SnapshotRequest {
  project_path: string;
  output_dir: string;
  output_format: string;
  snapshot_mode: string;
  respect_gitignore: boolean;
  exclude_node_modules: boolean;
  include_hidden: boolean;
  include_binary: boolean;
  enable_splitting: boolean;
  split_mode: string;
  line_threshold: number;
  excluded_paths: string[];
  force_included_paths: string[];
  output_file_name?: string;
}

export interface SnapshotResult {
  output_paths: string[];
  package_count: number;
  files_included: number;
}

/** Unified project history entry. Matches the Rust `SnapshotSummary` struct exactly. */
export interface SnapshotSummary {
  id: string;
  project_name: string;
  created_at: string;
  package_count: number;
  project_path: string;
  has_snapshot: boolean;
}

/** Persisted settings. Matches the Rust `AppSettings` struct exactly. */
export interface AppSettings {
  output_format: string;
  snapshot_mode: string;
  split_mode: string;
  respect_gitignore: boolean;
  exclude_node_modules: boolean;
  include_hidden: boolean;
  include_binary: boolean;
  last_output_dir: string | null;
  projects: SnapshotSummary[];
  global_excludes: string[];
  recent_export_dirs: string[];
}
