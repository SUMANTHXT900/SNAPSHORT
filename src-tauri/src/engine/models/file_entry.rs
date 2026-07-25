use serde::{Deserialize, Serialize};

/// A single discovered file/directory within a project.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    pub path: String,
    pub name: String,
    pub is_dir: bool,
    pub depth: usize,
    pub excluded: bool,
}

/// Inclusion / status classification surfaced to the UI and SCP tree.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum FileStatus {
    Included,
    Excluded,
    Ignored,
    Binary,
    Empty,
}
