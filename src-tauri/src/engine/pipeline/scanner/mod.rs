use crate::engine::models::raw_project::{RawEntry, RawProject};

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tracing::info;

pub struct ScannerConfig {
    pub root: std::path::PathBuf,
    pub respect_gitignore: bool,
    pub exclude_common: bool,
    pub include_hidden: bool,
    pub follow_symlinks: bool,
    pub global_excludes: Vec<String>,
    pub cancel: Option<Arc<AtomicBool>>,
}

impl Default for ScannerConfig {
    fn default() -> Self {
        Self {
            root: std::path::PathBuf::new(),
            respect_gitignore: true,
            exclude_common: true,
            include_hidden: false,
            follow_symlinks: false,
            global_excludes: Vec::new(),
            cancel: None,
        }
    }
}

pub struct Scanner {
    config: ScannerConfig,
}

impl Scanner {
    pub fn new(root: impl Into<std::path::PathBuf>) -> Self {
        Self {
            config: ScannerConfig {
                root: root.into(),
                ..Default::default()
            },
        }
    }

    pub fn with_config(config: ScannerConfig) -> Self {
        Self { config }
    }

    pub fn scan(&self) -> Result<RawProject, ScannerError> {
        let root = &self.config.root;
        let root_str = root.to_string_lossy().to_string();
        info!("[Scanner] Walking directory: {}", root_str);

        let mut entries = Vec::new();
        let mut dir_count = 0usize;
        let mut file_count = 0usize;
        let mut total_size = 0u64;

        let mut builder = ignore::WalkBuilder::new(root);

        // Map frontend config directly to WalkBuilder
        builder.hidden(!self.config.include_hidden);
        builder.git_ignore(self.config.respect_gitignore);
        builder.git_global(self.config.respect_gitignore);
        builder.git_exclude(self.config.respect_gitignore);
        builder.follow_links(self.config.follow_symlinks);

        // Clone global_excludes and exclude_common for use inside the closure
        let global_excludes = self.config.global_excludes.clone();
        let exclude_common = self.config.exclude_common;

        builder.filter_entry(move |entry| {
            let name = entry.file_name().to_string_lossy();

            // Check global excludes for exact name match (useful for directories like 'node_modules', 'build', '.venv')
            // or extension match for files. But WalkBuilder filter drops the entire subtree if a directory matches.
            if global_excludes
                .iter()
                .any(|ext| ext == &name || (ext.starts_with('.') && name.ends_with(ext)))
            {
                return false;
            }

            // Fallback hardcoded list if exclude_common is active and they aren't explicitly in global_excludes
            if exclude_common && entry.file_type().map_or(false, |ft| ft.is_dir()) {
                if name == "node_modules"
                    || name == "dist"
                    || name == "build"
                    || name == "out"
                    || name == ".next"
                    || name == ".nuxt"
                    || name == ".svelte-kit"
                    || name == "coverage"
                    || name == "vendor"
                    || name == "__pycache__"
                    || name == ".pytest_cache"
                    || name == ".venv"
                    || name == "venv"
                    || name == "env"
                    || name == ".tox"
                    || name == ".idea"
                {
                    return false;
                }
            }
            true
        });

        let walker = builder.build();

        for result in walker {
            if let Some(ref cancel) = self.config.cancel {
                if cancel.load(Ordering::Relaxed) {
                    return Err(ScannerError::Cancelled);
                }
            }

            let entry = match result {
                Ok(e) => e,
                Err(e) => {
                    tracing::warn!("[Scanner] Walk error: {}", e);
                    continue;
                }
            };

            let path = entry.path();
            if path == root {
                continue;
            }

            // Always use project-relative paths to prevent Windows drive prefix issues
            let rel = path.strip_prefix(root).unwrap_or(path);
            let metadata = entry.metadata().ok();

            let is_dir = entry.file_type().map(|ft| ft.is_dir()).unwrap_or(false);
            let is_symlink = entry.file_type().map(|ft| ft.is_symlink()).unwrap_or(false);
            let size = if is_dir {
                0
            } else {
                metadata.map(|m| m.len()).unwrap_or(0)
            };

            if is_dir {
                dir_count += 1;
            }
            if !is_dir {
                file_count += 1;
                total_size += size;
            }

            entries.push(RawEntry {
                path: rel.to_string_lossy().replace("\\", "/"), // Normalize paths to forward slashes for cross-platform consistency
                name: path
                    .file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default(),
                is_dir,
                is_symlink,
                depth: rel.components().count(),
                size_bytes: size,
                ignored: false, // WalkBuilder already filters out all ignored files!
            });
        }

        info!(
            "[Scanner] Walk complete. entries={}, files={}, dirs={}, total_bytes={}",
            entries.len(),
            file_count,
            dir_count,
            total_size
        );

        Ok(RawProject {
            root: root_str,
            entries,
            dir_count,
            file_count,
            total_size_bytes: total_size,
        })
    }
}

#[derive(Debug, thiserror::Error)]
pub enum ScannerError {
    #[error("Walk error: {0}")]
    WalkError(String),
    #[error("Scan cancelled")]
    Cancelled,
    #[error("Root directory not found: {0}")]
    RootNotFound(String),
}
