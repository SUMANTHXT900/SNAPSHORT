use crate::engine::models::scp_document::ScpDocument;
use std::fs::File;
use std::io::{self, Write};
use std::path::Path;

pub fn render_txt(doc: &ScpDocument, part_index: usize, writer: &mut dyn Write) -> io::Result<()> {
    let part = doc
        .parts
        .get(part_index)
        .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidInput, "Invalid part index"))?;

    let package_label = if part.total_packages > 1 {
        format!("Package {} of {}", part.package_number, part.total_packages)
    } else {
        String::from("Package")
    };

    write!(
        writer,
        "SNAPSHORT CONTEXT PACKAGE — {}\n\nGenerated: {}\nMode: {}\nFormat: {}\n{}\n\n{}\n\n---\n\n",
        doc.metadata.project_name,
        doc.metadata.generation_time,
        doc.metadata.snapshot_mode,
        doc.metadata.output_format,
        package_label,
        doc.llm_instructions
    )?;

    write!(writer, "PROJECT TREE\n\n{}\n\n---\n\nFILES\n\n", doc.tree)?;

    let root_dir = Path::new(&doc.metadata.root_directory);

    for b in &part.files {
        write!(
            writer,
            "=== {} ===\nPath: {}\nLanguage: {}\nLines: {}\nSize: {} bytes\n\n",
            b.name, b.path, b.language, b.line_count, b.size_bytes
        )?;

        let file_path = root_dir.join(&b.path);
        if let Ok(mut file) = File::open(&file_path) {
            io::copy(&mut file, writer)?;
        } else {
            write!(writer, "/* Error: Could not read file contents */")?;
        }

        write!(writer, "\n\n")?;
    }

    write!(
        writer,
        "---\n\nSTATISTICS\n\nFiles Included: {}\nEstimated Tokens: {}\nEstimated Lines: {}\n",
        doc.statistics.files_included,
        doc.statistics.estimated_tokens,
        doc.statistics.estimated_lines
    )?;

    Ok(())
}
