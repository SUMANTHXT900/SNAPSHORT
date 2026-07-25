use crate::engine::models::analyzed_project::AnalyzedProject;
use crate::engine::pipeline::analyzer::{Analyzer, AnalyzerConfig};
use crate::engine::pipeline::scanner::{Scanner, ScannerConfig};
use serde::Serialize;
use tracing::info;

/// User-facing config for a scan operation (mirrors frontend config).
#[derive(Debug, Clone)]
pub struct ScanConfig {
    pub respect_gitignore: bool,
    pub exclude_node_modules: bool,
    pub include_hidden: bool,
    pub include_binary: bool,
    pub global_excludes: Vec<String>,
}

impl Default for ScanConfig {
    fn default() -> Self {
        Self {
            respect_gitignore: true,
            exclude_node_modules: true,
            include_hidden: false,
            include_binary: false,
            global_excludes: Vec::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct AnalyzedProjectOutput {
    pub root: String,
    pub file_count: usize,
    pub dir_count: usize,
    pub files: Vec<AnalyzedFileOutput>,
    pub statistics: StatisticsOutput,
}

#[derive(Debug, Clone, Serialize)]
pub struct AnalyzedFileOutput {
    pub path: String,
    pub name: String,
    pub language: String,
    pub size_bytes: u64,
    pub line_count: usize,
    pub estimated_tokens: u64,
    pub is_binary: bool,
    pub included: bool,
    pub ignored: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct StatisticsOutput {
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

impl From<AnalyzedProject> for AnalyzedProjectOutput {
    fn from(ap: AnalyzedProject) -> Self {
        Self {
            root: ap.root,
            file_count: ap.statistics.total_files,
            dir_count: ap.statistics.total_directories,
            files: ap
                .files
                .iter()
                .map(|f| AnalyzedFileOutput {
                    path: f.path.clone(),
                    name: f.name.clone(),
                    language: f.language.clone(),
                    size_bytes: f.size_bytes,
                    line_count: f.line_count,
                    estimated_tokens: f.estimated_tokens,
                    is_binary: f.is_binary,
                    included: f.included,
                    ignored: f.ignored,
                })
                .collect(),
            statistics: StatisticsOutput {
                total_files: ap.statistics.total_files,
                total_directories: ap.statistics.total_directories,
                selected_files: ap.statistics.selected_files,
                ignored_files: ap.statistics.ignored_files,
                binary_files: ap.statistics.binary_files,
                empty_files: ap.statistics.empty_files,
                total_size_bytes: ap.statistics.total_size_bytes,
                estimated_tokens: ap.statistics.estimated_tokens,
                estimated_lines: ap.statistics.estimated_lines,
                languages: ap.statistics.languages,
            },
        }
    }
}

pub fn scan_project(
    project_path: &str,
    config: &ScanConfig,
    cancel_token: Option<std::sync::Arc<std::sync::atomic::AtomicBool>>,
) -> Result<AnalyzedProject, String> {
    info!(
        "[scan_project] Starting scan of: {} (gitignore={}, node_modules={}, hidden={}, binary={})",
        project_path,
        config.respect_gitignore,
        config.exclude_node_modules,
        config.include_hidden,
        config.include_binary
    );

    let scanner_config = ScannerConfig {
        root: std::path::PathBuf::from(project_path),
        respect_gitignore: config.respect_gitignore,
        exclude_common: config.exclude_node_modules,
        include_hidden: config.include_hidden,
        follow_symlinks: false,
        global_excludes: config.global_excludes.clone(),
        cancel: cancel_token.clone(),
    };

    let scanner = Scanner::with_config(scanner_config);
    let raw = scanner.scan().map_err(|e| {
        tracing::error!("[scan_project] Scanner failed: {}", e);
        e.to_string()
    })?;
    info!(
        "[scan_project] Scan done. files={}, dirs={}",
        raw.file_count, raw.dir_count
    );

    let analyzer = Analyzer::with_config(
        raw,
        AnalyzerConfig {
            include_binary: config.include_binary,
            global_excludes: config.global_excludes.clone(),
            cancel: cancel_token,
        },
    );
    let analyzed = analyzer.analyze();
    info!(
        "[scan_project] Analysis done. selected={}, ignored={}, tokens={}",
        analyzed.statistics.selected_files,
        analyzed.statistics.ignored_files,
        analyzed.statistics.estimated_tokens
    );

    Ok(analyzed)
}
