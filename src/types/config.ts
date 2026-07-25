// Application config types (frontend-side defaults + form state).

export type OutputFormat = "markdown" | "xml" | "txt";
export type SnapshotMode = "full" | "custom" | "changes";
export type SplitMode = "tokens" | "lines" | "characters";

export interface SnapshotConfig {
  output_format: OutputFormat;
  snapshot_mode: SnapshotMode;
  split_mode: SplitMode;
  respect_gitignore: boolean;
  exclude_node_modules: boolean;
  include_hidden: boolean;
  include_binary: boolean;
  enable_splitting: boolean;
  line_threshold: number;
  global_excludes: string[];
}
