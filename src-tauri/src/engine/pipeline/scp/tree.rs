use crate::engine::models::analyzed_project::AnalyzedProject;

/// Renders the complete project tree as a plain-text indented listing.
/// The tree is deterministic (sorted by path) and identical across every
/// generated package so each part remains independently understandable.
pub fn render_tree(project: &AnalyzedProject) -> String {
    let mut lines: Vec<String> = project
        .files
        .iter()
        .map(|f| {
            let status = if f.is_binary {
                "Binary"
            } else if f.ignored {
                "Ignored"
            } else if f.included {
                "Included"
            } else {
                "Excluded"
            };
            format!("{}\t{}", f.path, status)
        })
        .collect();
    lines.sort();
    lines.join("\n")
}
