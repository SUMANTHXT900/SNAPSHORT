use serde::{Deserialize, Serialize};

/// Canonical internal representation of a snapshot.
/// Answers "How should this project be packaged for an LLM?".
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScpDocument {
    pub metadata: PackageMetadata,
    pub llm_instructions: String,
    pub overview: ProjectOverview,
    pub tree: String,
    pub parts: Vec<ScpPart>,
    pub statistics: PackageStatistics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackageMetadata {
    pub project_name: String,
    pub root_directory: String,
    pub snapshot_mode: String,
    pub generation_time: String,
    pub snapshort_version: String,
    pub output_format: String,
    pub package_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectOverview {
    pub languages: Vec<String>,
    pub frameworks: Vec<String>,
    pub total_directories: usize,
    pub total_files: usize,
    pub snapshot_mode: String,
    pub package_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScpPart {
    pub package_number: usize,
    pub total_packages: usize,
    pub previous_package: Option<usize>,
    pub next_package: Option<usize>,
    pub files: Vec<ScpFileBlock>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScpFileBlock {
    pub path: String,
    pub name: String,
    pub language: String,
    pub size_bytes: u64,
    pub line_count: usize,
    pub char_count: usize,
    pub estimated_tokens: u64,
    pub status: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct PackageStatistics {
    pub files_included: usize,
    pub files_ignored: usize,
    pub binary_files: usize,
    pub empty_files: usize,
    pub estimated_tokens: u64,
    pub estimated_characters: u64,
    pub estimated_lines: usize,
    pub package_size_bytes: u64,
}
