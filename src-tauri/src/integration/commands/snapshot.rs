use serde::{Deserialize, Serialize};

/// Request payload for a snapshot generation (high-level command only).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotRequest {
    pub project_path: String,
    pub output_dir: String,
    pub output_format: String,
    pub snapshot_mode: String,
    pub respect_gitignore: bool,
    pub exclude_node_modules: bool,
    pub include_hidden: bool,
    pub include_binary: bool,
    pub enable_splitting: bool,
    pub split_mode: String,
    pub line_threshold: usize,
    pub excluded_paths: Vec<String>,
    pub force_included_paths: Vec<String>,
    #[serde(default)]
    pub global_excludes: Vec<String>,
    #[serde(default)]
    pub output_file_name: Option<String>,
}

/// Result returned after a snapshot generation completes.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotResult {
    pub output_paths: Vec<String>,
    pub package_count: usize,
    pub files_included: usize,
}
