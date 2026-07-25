use crate::engine::models::analyzed_project::{AnalyzedFile, AnalyzedProject, ProjectStatistics};
use crate::engine::models::raw_project::RawProject;
use rayon::prelude::*;
use std::collections::BTreeSet;
use std::path::Path;
use tracing::{debug, info};

use super::analysis::language::detect_language;

/// Configuration for the Analyzer pass.
#[derive(Debug, Clone, Default)]
pub struct AnalyzerConfig {
    /// If false (default), binary files are marked as not-included so they
    /// appear correctly in the stats and UI without counting toward the output.
    pub include_binary: bool,
    /// Persistent global ignores that act exactly like structural noise
    pub global_excludes: Vec<String>,
    pub cancel: Option<std::sync::Arc<std::sync::atomic::AtomicBool>>,
}

pub struct Analyzer {
    project: RawProject,
    config: AnalyzerConfig,
}

impl Analyzer {
    pub fn new(project: RawProject) -> Self {
        Self {
            project,
            config: AnalyzerConfig::default(),
        }
    }

    pub fn with_config(project: RawProject, config: AnalyzerConfig) -> Self {
        Self { project, config }
    }

    pub fn analyze(&self) -> AnalyzedProject {
        info!(
            "[Analyzer] Starting parallel analysis of {} files (include_binary={})",
            self.project.file_count, self.config.include_binary
        );

        let include_binary = self.config.include_binary;

        let files: Vec<AnalyzedFile> = self
            .project
            .entries
            .par_iter()
            .filter(|e| !e.is_dir)
            .map(|e| {
                if let Some(ref cancel_token) = self.config.cancel {
                    if cancel_token.load(std::sync::atomic::Ordering::Relaxed) {
                        return AnalyzedFile {
                            path: e.path.clone(),
                            name: e.name.clone(),
                            language: "Cancelled".to_string(),
                            size_bytes: 0,
                            line_count: 0,
                            char_count: 0,
                            estimated_tokens: 0,
                            is_binary: false,
                            encoding: "utf-8".to_string(),
                            ignored: true,
                            included: false,
                            hash: None,
                        };
                    }
                }

                let full = Path::new(&self.project.root).join(&e.path);

                let mut is_noise = super::analysis::binary::is_structural_noise(&e.name);
                let mut is_bin = super::analysis::binary::is_known_binary_extension(&e.name);

                let ext = Path::new(&e.name)
                    .extension()
                    .and_then(|x| x.to_str())
                    .unwrap_or("");
                let ext_with_dot = format!(".{}", ext);
                if self
                    .config
                    .global_excludes
                    .iter()
                    .any(|g| g == &e.name || g == &ext_with_dot || g == ext)
                {
                    is_noise = true;
                }

                let mut line_count = 0;
                let mut char_count = 0;
                let mut est = 0;
                let mut encoding = "utf-8".to_string();
                let mut hash = None;
                let mut size_bytes = e.size_bytes;

                // Fix: if scanner provided 0, we can try to re-read it from metadata.
                // But scanner's size_bytes is generally correct.
                if size_bytes == 0 {
                    if let Ok(m) = std::fs::metadata(&full) {
                        size_bytes = m.len();
                    }
                }

                if !is_bin && size_bytes > 0 {
                    if let Ok(mut file) = std::fs::File::open(&full) {
                        use std::io::Read;
                        let mut buffer = [0u8; 64 * 1024];
                        let mut hasher = blake3::Hasher::new();
                        let mut first_chunk = true;
                        let mut last_byte = 0u8;

                        while let Ok(n) = file.read(&mut buffer) {
                            if n == 0 {
                                break;
                            }

                            if let Some(ref cancel_token) = self.config.cancel {
                                if cancel_token.load(std::sync::atomic::Ordering::Relaxed) {
                                    return AnalyzedFile {
                                        path: e.path.clone(),
                                        name: e.name.clone(),
                                        language: "Cancelled".to_string(),
                                        size_bytes: 0,
                                        line_count: 0,
                                        char_count: 0,
                                        estimated_tokens: 0,
                                        is_binary: false,
                                        encoding: "utf-8".to_string(),
                                        ignored: true,
                                        included: false,
                                        hash: None,
                                    };
                                }
                            }

                            if first_chunk {
                                first_chunk = false;
                                if super::analysis::binary::is_binary(&buffer[..n]) {
                                    is_bin = true;
                                    break;
                                }
                                encoding = super::analysis::encoding::detect_encoding(&buffer[..n]);
                            }

                            hasher.update(&buffer[..n]);

                            for &b in &buffer[..n] {
                                if b == b'\n' {
                                    line_count += 1;
                                }
                                if (b & 0xC0) != 0x80 {
                                    char_count += 1;
                                }
                                last_byte = b;
                            }
                        }

                        if !is_bin {
                            hash = Some(hasher.finalize().to_hex().to_string());
                            est = (char_count as f64 / 4.0).ceil() as u64;
                            if char_count > 0 && last_byte != b'\n' {
                                line_count += 1;
                            }
                        }
                    }
                }

                debug!(
                    "[Analyzer] {}: lang={}, lines={}, tokens={}, binary={}",
                    e.name,
                    detect_language(&e.name),
                    line_count,
                    est,
                    is_bin
                );

                // A file is included if:
                // - It is not gitignored/excluded from the scan
                // - It is not structural noise (unless user overrides later)
                // - AND (it is not binary, OR include_binary is explicitly enabled)
                let included = if e.ignored || is_noise {
                    false
                } else if is_bin && !include_binary {
                    false
                } else {
                    true
                };

                AnalyzedFile {
                    path: e.path.clone(),
                    name: e.name.clone(),
                    language: detect_language(&e.name),
                    size_bytes,
                    line_count,
                    char_count,
                    estimated_tokens: est,
                    is_binary: is_bin,
                    encoding,
                    ignored: e.ignored || is_noise, // We treat noise as 'ignored' structurally so it is filtered out by default but visible
                    included,
                    hash,
                }
            })
            .collect();

        let mut languages: BTreeSet<String> = BTreeSet::new();
        let statistics = files
            .iter()
            .fold(ProjectStatistics::default(), |mut acc, f| {
                acc.total_files += 1;
                acc.total_size_bytes += f.size_bytes;
                // Only count tokens/lines for included files (excludes binary/ignored)
                if f.included {
                    acc.estimated_tokens += f.estimated_tokens;
                    acc.estimated_lines += f.line_count;
                }
                if f.is_binary {
                    acc.binary_files += 1;
                }
                if f.included {
                    acc.selected_files += 1;
                }
                if f.ignored {
                    acc.ignored_files += 1;
                }
                if f.line_count == 0 && !f.is_binary {
                    acc.empty_files += 1;
                }
                languages.insert(f.language.clone());
                acc
            });

        let statistics = ProjectStatistics {
            total_directories: self.project.dir_count,
            languages: languages.into_iter().collect(),
            ..statistics
        };

        info!(
            "[Analyzer] Done. total={}, selected={}, ignored={}, binary={}, tokens={}, langs={:?}",
            statistics.total_files,
            statistics.selected_files,
            statistics.ignored_files,
            statistics.binary_files,
            statistics.estimated_tokens,
            statistics.languages
        );

        AnalyzedProject {
            root: self.project.root.clone(),
            files,
            statistics,
        }
    }
}
