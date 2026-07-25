use crate::engine::events::{ProgressEvent, Stage, StatisticsEvent};
use crate::engine::models::raw_project::RawProject;
use crate::engine::pipeline::analyzer::{Analyzer, AnalyzerConfig};
use crate::engine::pipeline::renderer::render;
use crate::engine::pipeline::scanner::{Scanner, ScannerConfig};
use crate::engine::pipeline::scp::ScpBuilder;
use crate::engine::pipeline::writer::create_package_file;
use crate::integration::commands::snapshot::{SnapshotRequest, SnapshotResult};
use crate::integration::events::emitter::EventEmitter;
use tracing::info;

fn progress(emitter: &EventEmitter, stage: Stage, pct: f32) {
    emitter.emit_progress(ProgressEvent {
        stage,
        current_file: None,
        files_processed: 0,
        total_files: 0,
        percentage: pct,
        elapsed_ms: 0,
        estimated_remaining_ms: None,
    });
}

pub fn generate_snapshot(
    app: &tauri::AppHandle,
    req: SnapshotRequest,
) -> Result<SnapshotResult, String> {
    let emitter = EventEmitter::new(app.clone());
    info!(
        "[generate_snapshot] Starting pipeline. project_path={}, output={}, format={}",
        req.project_path, req.output_dir, req.output_format
    );

    let project_name = std::path::Path::new(&req.project_path)
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| "project".into());
    info!("[generate_snapshot] Project name: {}", project_name);

    // Stage 1 — Scanner
    progress(&emitter, Stage::Scanning, 5.0);
    info!(
        "[Stage 1/5] Scanning directory: {} (gitignore={}, node_modules={}, hidden={}, binary={})",
        req.project_path,
        req.respect_gitignore,
        req.exclude_node_modules,
        req.include_hidden,
        req.include_binary
    );
    let scanner = Scanner::with_config(ScannerConfig {
        root: std::path::PathBuf::from(&req.project_path),
        respect_gitignore: req.respect_gitignore,
        exclude_common: req.exclude_node_modules,
        include_hidden: req.include_hidden,
        follow_symlinks: false,
        global_excludes: req.global_excludes.clone(),
        cancel: None,
    });
    let raw: RawProject = scanner.scan().map_err(|e| e.to_string())?;
    info!(
        "[Stage 1/5] Scan complete. files={}, dirs={}, total_size={} bytes",
        raw.file_count, raw.dir_count, raw.total_size_bytes
    );
    progress(&emitter, Stage::Scanning, 20.0);

    // Stage 2 — Analyzer
    progress(&emitter, Stage::Analyzing, 25.0);
    info!("[Stage 2/5] Analyzing files (parallel via Rayon)…");
    let analyzer = Analyzer::with_config(
        raw,
        AnalyzerConfig {
            include_binary: req.include_binary,
            global_excludes: req.global_excludes.clone(),
            cancel: None,
        },
    );
    let mut analyzed = analyzer.analyze();
    info!(
        "[Stage 2/5] Analyzed. selected={}, ignored={}, binary={}, tokens={}",
        analyzed.statistics.selected_files,
        analyzed.statistics.ignored_files,
        analyzed.statistics.binary_files,
        analyzed.statistics.estimated_tokens
    );

    // Emit statistics after analysis
    emitter.emit_statistics(StatisticsEvent {
        estimated_tokens: analyzed.statistics.estimated_tokens,
        estimated_lines: analyzed.statistics.estimated_lines,
        files_included: analyzed.statistics.selected_files,
        files_ignored: analyzed.statistics.ignored_files,
    });

    // Apply user file selection overrides
    if !req.force_included_paths.is_empty() || !req.excluded_paths.is_empty() {
        let count_before = analyzed.statistics.selected_files;

        for file in analyzed.files.iter_mut() {
            if req.force_included_paths.contains(&file.path) {
                file.included = true;
                file.ignored = false;
            }
        }

        for file in analyzed.files.iter_mut() {
            if req.excluded_paths.contains(&file.path) {
                file.included = false;
            }
        }

        analyzed.statistics.selected_files = analyzed.files.iter().filter(|f| f.included).count();
        analyzed.statistics.estimated_tokens = analyzed
            .files
            .iter()
            .filter(|f| f.included)
            .map(|f| f.estimated_tokens)
            .sum();
        analyzed.statistics.estimated_lines = analyzed
            .files
            .iter()
            .filter(|f| f.included)
            .map(|f| f.line_count)
            .sum();
        analyzed.statistics.total_size_bytes = analyzed
            .files
            .iter()
            .filter(|f| f.included)
            .map(|f| f.size_bytes)
            .sum();

        info!(
            "[Stage 2/5] User overrides applied. selected: {} -> {}",
            count_before, analyzed.statistics.selected_files
        );
    }
    progress(&emitter, Stage::Analyzing, 45.0);

    // Determine split thresholds based on split_mode
    let mut t_lines = 0;
    let mut t_tokens = 0;
    let mut t_chars = 0;
    if req.enable_splitting {
        match req.split_mode.as_str() {
            "tokens" => t_tokens = req.line_threshold as u64,
            "characters" => t_chars = req.line_threshold,
            _ => t_lines = req.line_threshold, // default to lines
        }
    }

    // Stage 3 — SCP Builder
    progress(&emitter, Stage::BuildingScp, 50.0);
    info!("[Stage 3/5] Building SCP document…");
    let doc = ScpBuilder::new(&analyzed)
        .project_name(project_name.clone())
        .snapshot_mode(&req.snapshot_mode)
        .output_format(&req.output_format)
        .threshold_lines(t_lines)
        .threshold_tokens(t_tokens)
        .threshold_chars(t_chars)
        .build();
    info!("[Stage 3/5] SCP built. packages={}", doc.parts.len());
    progress(&emitter, Stage::BuildingScp, 65.0);

    // Stage 4 & 5 — Renderer & Writer (Streaming)
    let ext = match req.output_format.to_lowercase().as_str() {
        "xml" => "xml",
        "txt" => "txt",
        _ => "md",
    };
    let total_packages = doc.parts.len().max(1);
    let mut out_dir = std::path::PathBuf::from(&req.output_dir);
    if total_packages > 1 {
        out_dir = out_dir.join(format!("{}_Snapshot", project_name));
        if !out_dir.exists() {
            std::fs::create_dir_all(&out_dir).map_err(|e| e.to_string())?;
        }
    }

    let base_name = if let Some(ref name) = req.output_file_name {
        let mut clean_name = name.trim().to_string();
        if clean_name.is_empty() {
            format!("{}_Snapshot", project_name)
        } else {
            // Strip any extension if user included it to avoid .md.md
            if let Some(dot_idx) = clean_name.rfind('.') {
                if dot_idx > 0 {
                    let ext_part = &clean_name[dot_idx..];
                    if ext_part.eq_ignore_ascii_case(".md")
                        || ext_part.eq_ignore_ascii_case(".xml")
                        || ext_part.eq_ignore_ascii_case(".txt")
                        || ext_part.eq_ignore_ascii_case(".json")
                    {
                        clean_name.truncate(dot_idx);
                    }
                }
            }
            clean_name
        }
    } else {
        format!("{}_Snapshot", project_name)
    };

    let mut written = Vec::new();

    progress(&emitter, Stage::Rendering, 70.0);
    info!(
        "[Stage 4/5] Rendering and writing {} packages to disk: {}",
        total_packages,
        out_dir.display()
    );

    for i in 0..total_packages {
        // Create file
        let (path, mut file) = create_package_file(&out_dir, &base_name, ext, i, total_packages)
            .map_err(|e| e.to_string())?;

        // Render into file stream
        render(&doc, i, &req.output_format, &mut file).map_err(|e| e.to_string())?;

        written.push(path);

        let pct = 70.0 + (30.0 * (i as f32 + 1.0) / total_packages as f32);
        progress(&emitter, Stage::WritingOutput, pct);
    }

    info!(
        "[Stage 5/5] Wrote {} file(s) to disk. paths: {:?}",
        written.len(),
        written
    );
    progress(&emitter, Stage::WritingOutput, 100.0);

    let files_included = analyzed.statistics.selected_files;

    println!(
        "✅ Snapshot successfully generated in: {}",
        out_dir.display()
    );

    info!(
        "[generate_snapshot] Pipeline complete. included={}, packages={}",
        files_included,
        doc.parts.len()
    );

    progress(&emitter, Stage::Completed, 100.0);

    Ok(SnapshotResult {
        output_paths: written
            .iter()
            .map(|p| p.to_string_lossy().to_string())
            .collect(),
        package_count: doc.parts.len(),
        files_included,
    })
}
