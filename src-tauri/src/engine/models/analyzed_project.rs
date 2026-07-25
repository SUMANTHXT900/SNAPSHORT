use serde::{Deserialize, Serialize};

/// Analyzed representation of the project.
/// Answers "What do we know about each file?".
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyzedProject {
    pub root: String,
    pub files: Vec<AnalyzedFile>,
    pub statistics: ProjectStatistics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyzedFile {
    pub path: String,
    pub name: String,
    pub language: String,
    pub size_bytes: u64,
    pub line_count: usize,
    pub char_count: usize,
    pub estimated_tokens: u64,
    pub is_binary: bool,
    pub encoding: String,
    pub ignored: bool,
    pub included: bool,
    pub hash: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ProjectStatistics {
    pub total_files: usize,
    pub total_directories: usize,
    pub selected_files: usize,
    pub ignored_files: usize,
    pub binary_files: usize,
    pub empty_files: usize,
    pub total_size_bytes: u64,
    pub estimated_tokens: u64,
    pub estimated_lines: usize,
    pub languages: Vec<String>,
}
