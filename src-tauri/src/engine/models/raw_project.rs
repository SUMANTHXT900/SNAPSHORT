use serde::{Deserialize, Serialize};

/// Raw representation of the filesystem after scanning.
/// Answers "What exists?". Contains no analysis.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RawProject {
    pub root: String,
    pub entries: Vec<RawEntry>,
    pub dir_count: usize,
    pub file_count: usize,
    pub total_size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RawEntry {
    pub path: String,
    pub name: String,
    pub is_dir: bool,
    pub is_symlink: bool,
    pub depth: usize,
    pub size_bytes: u64,
    pub ignored: bool,
}
