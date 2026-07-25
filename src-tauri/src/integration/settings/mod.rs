use serde::{Deserialize, Serialize};

/// Persisted application settings (JSON).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub output_format: String,
    pub snapshot_mode: String,
    pub split_mode: String,
    pub respect_gitignore: bool,
    pub exclude_node_modules: bool,
    pub include_hidden: bool,
    pub include_binary: bool,
    #[serde(default)]
    pub enable_splitting: bool,
    #[serde(default = "default_line_threshold")]
    pub line_threshold: usize,
    pub last_output_dir: Option<String>,
    /// Unified project history — single source of truth.
    #[serde(default)]
    pub projects: Vec<crate::integration::commands::history::SnapshotSummary>,
    #[serde(default)]
    pub global_excludes: Vec<String>,
    #[serde(default)]
    pub recent_export_dirs: Vec<String>,
}

fn default_line_threshold() -> usize {
    use crate::engine::config::defaults::DEFAULT_LINE_THRESHOLD;
    DEFAULT_LINE_THRESHOLD
}

impl Default for AppSettings {
    fn default() -> Self {
        use crate::engine::config::defaults::*;
        Self {
            output_format: DEFAULT_OUTPUT_FORMAT.to_string(),
            snapshot_mode: DEFAULT_SNAPSHOT_MODE.to_string(),
            split_mode: DEFAULT_SPLIT_MODE.to_string(),
            respect_gitignore: DEFAULT_RESPECT_GITIGNORE,
            exclude_node_modules: DEFAULT_EXCLUDE_NODE_MODULES,
            include_hidden: DEFAULT_INCLUDE_HIDDEN,
            include_binary: DEFAULT_INCLUDE_BINARY,
            enable_splitting: false,
            line_threshold: DEFAULT_LINE_THRESHOLD,
            last_output_dir: None,
            projects: Vec::new(),
            global_excludes: vec![
                ".class".into(),
                ".jar".into(),
                ".war".into(),
                ".ear".into(),
                ".pyc".into(),
                ".pyo".into(),
                ".pyd".into(),
                ".egg".into(),
                ".whl".into(),
                ".o".into(),
                ".obj".into(),
                ".so".into(),
                ".dll".into(),
                ".dylib".into(),
                ".exe".into(),
                ".lib".into(),
                ".a".into(),
                ".log".into(),
                ".tmp".into(),
                ".bak".into(),
                ".swp".into(),
                ".DS_Store".into(),
            ],
            recent_export_dirs: Vec::new(),
        }
    }
}

/// Loads settings from disk, returning defaults when unavailable.
pub fn load_settings(path: &std::path::Path) -> AppSettings {
    std::fs::read_to_string(path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

/// Saves settings to disk.
pub fn save_settings(path: &std::path::Path, settings: &AppSettings) -> std::io::Result<()> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(path, serde_json::to_string_pretty(settings)?)
}
