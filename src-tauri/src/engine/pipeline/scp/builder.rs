use crate::engine::models::analyzed_project::AnalyzedProject;
use crate::engine::models::scp_document::{
    PackageMetadata, PackageStatistics, ProjectOverview, ScpDocument, ScpFileBlock, ScpPart,
};

use super::llm_instructions::llm_instructions;
use super::split::split_files;
use super::tree::render_tree;

/// Builds the canonical SCP representation, enforcing deterministic ordering
/// and the file-integrity splitting rule.
pub struct ScpBuilder<'a> {
    project: &'a AnalyzedProject,
    project_name: String,
    snapshot_mode: String,
    output_format: String,
    version: String,
    threshold_lines: usize,
    threshold_tokens: u64,
    threshold_chars: usize,
}

impl<'a> ScpBuilder<'a> {
    pub fn new(project: &'a AnalyzedProject) -> Self {
        Self {
            project,
            project_name: String::new(),
            snapshot_mode: "full".into(),
            output_format: "markdown".into(),
            version: env!("CARGO_PKG_VERSION").to_string(),
            threshold_lines: 1000,
            threshold_tokens: 200_000,
            threshold_chars: 0,
        }
    }

    pub fn project_name(mut self, name: impl Into<String>) -> Self {
        self.project_name = name.into();
        self
    }

    pub fn snapshot_mode(mut self, mode: impl Into<String>) -> Self {
        self.snapshot_mode = mode.into();
        self
    }

    pub fn output_format(mut self, format: impl Into<String>) -> Self {
        self.output_format = format.into();
        self
    }

    pub fn version(mut self, version: impl Into<String>) -> Self {
        self.version = version.into();
        self
    }

    pub fn threshold_lines(mut self, lines: usize) -> Self {
        self.threshold_lines = lines;
        self
    }

    pub fn threshold_tokens(mut self, tokens: u64) -> Self {
        self.threshold_tokens = tokens;
        self
    }

    pub fn threshold_chars(mut self, chars: usize) -> Self {
        self.threshold_chars = chars;
        self
    }

    pub fn build(self) -> ScpDocument {
        // Sort included files deterministically by path
        let mut included: Vec<_> = self
            .project
            .files
            .iter()
            .filter(|f| f.included && !f.is_binary)
            .collect();
        included.sort_by(|a, b| a.path.cmp(&b.path));

        // Split files into packages
        let parts_files = split_files(
            included.iter().map(|f| ScpFileBlock {
                path: f.path.clone(),
                name: f.name.clone(),
                language: f.language.clone(),
                size_bytes: f.size_bytes,
                line_count: f.line_count,
                char_count: f.char_count,
                estimated_tokens: f.estimated_tokens,
                status: if f.is_binary {
                    "Binary".into()
                } else {
                    "Included".into()
                },
            }),
            self.threshold_lines,
            self.threshold_tokens,
            self.threshold_chars,
        );

        let total_packages = parts_files.len().max(1);
        let now = chrono::Utc::now()
            .format("%Y-%m-%d %H:%M:%S UTC")
            .to_string();

        // Build tree once (identical across packages)
        let tree = render_tree(self.project);

        // Build parts
        let parts: Vec<ScpPart> = parts_files
            .into_iter()
            .enumerate()
            .map(|(i, files)| {
                let n = i + 1;
                ScpPart {
                    package_number: n,
                    total_packages,
                    previous_package: if n > 1 { Some(n - 1) } else { None },
                    next_package: if n < total_packages {
                        Some(n + 1)
                    } else {
                        None
                    },
                    files,
                }
            })
            .collect();

        // Aggregate statistics
        let files_included = self.project.statistics.selected_files;
        let files_ignored = self.project.statistics.ignored_files;
        let binary_files = self.project.statistics.binary_files;
        let empty_files = self.project.statistics.empty_files;
        let estimated_tokens = self.project.statistics.estimated_tokens;
        let estimated_lines = self.project.statistics.estimated_lines;
        let package_size_bytes = self.project.statistics.total_size_bytes;

        ScpDocument {
            metadata: PackageMetadata {
                project_name: self.project_name.clone(),
                root_directory: self.project.root.clone(),
                snapshot_mode: self.snapshot_mode.clone(),
                generation_time: now,
                snapshort_version: self.version,
                output_format: self.output_format.clone(),
                package_count: total_packages,
            },
            llm_instructions: llm_instructions(&self.project_name, total_packages),
            overview: ProjectOverview {
                languages: self.project.statistics.languages.clone(),
                frameworks: Vec::new(),
                total_directories: self.project.statistics.total_directories,
                total_files: self.project.statistics.total_files,
                snapshot_mode: self.snapshot_mode,
                package_count: total_packages,
            },
            tree,
            parts,
            statistics: PackageStatistics {
                files_included,
                files_ignored,
                binary_files,
                empty_files,
                estimated_tokens,
                estimated_characters: 0,
                estimated_lines,
                package_size_bytes,
            },
        }
    }
}
