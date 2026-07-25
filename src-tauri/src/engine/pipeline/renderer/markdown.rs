use crate::engine::models::scp_document::ScpDocument;
use std::fs::File;
use std::io::{self, Write};
use std::path::Path;

pub fn render_markdown(
    doc: &ScpDocument,
    part_index: usize,
    writer: &mut dyn Write,
) -> io::Result<()> {
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
        "# Snapshort Context Package — {}\n\n**Generated:** {}\n**Snapshot Mode:** {}\n**Format:** {}\n**{}**\n\n> {}\n\n---\n\n",
        doc.metadata.project_name,
        doc.metadata.generation_time,
        doc.metadata.snapshot_mode,
        doc.metadata.output_format,
        package_label,
        doc.llm_instructions
    )?;

    write!(
        writer,
        "## Project Overview\n\n- **Languages:** {}\n- **Total Files:** {}\n- **Total Directories:** {}\n- **Packages:** {}\n\n",
        doc.overview.languages.join(", "),
        doc.overview.total_files,
        doc.overview.total_directories,
        doc.overview.package_count
    )?;

    write!(
        writer,
        "## Project Tree\n\n```\n{}\n```\n\n---\n\n",
        doc.tree
    )?;

    write!(writer, "## File Contents\n\n")?;

    let root_dir = Path::new(&doc.metadata.root_directory);

    for b in &part.files {
        write!(
            writer,
            "### {}\n\n- Path: `{}`\n- Language: {}\n- Lines: {}\n- Size: {} bytes\n\n",
            b.name, b.path, b.language, b.line_count, b.size_bytes
        )?;

        let file_path = root_dir.join(&b.path);
        if let Ok(mut file) = File::open(&file_path) {
            use std::io::{Read, Seek, SeekFrom};

            // Pass 1: scan for max backticks
            let mut max_backticks = 0;
            let mut current_backticks = 0;
            let mut buf = [0u8; 128 * 1024];
            while let Ok(n) = file.read(&mut buf) {
                if n == 0 {
                    break;
                }
                for &byte in &buf[..n] {
                    if byte == b'`' {
                        current_backticks += 1;
                        if current_backticks > max_backticks {
                            max_backticks = current_backticks;
                        }
                    } else {
                        current_backticks = 0;
                    }
                }
            }

            let fence_len = std::cmp::max(3, max_backticks + 1);
            let fence = "`".repeat(fence_len);

            write!(writer, "{} {}\n", fence, b.language.to_lowercase())?;

            let _ = file.seek(SeekFrom::Start(0));
            io::copy(&mut file, writer)?;

            write!(writer, "\n{}\n\n", fence)?;
        } else {
            write!(
                writer,
                "```{} \n/* Error: Could not read file contents */\n```\n\n",
                b.language.to_lowercase()
            )?;
        }
    }

    write!(writer, "---\n\n## Package Statistics\n\n")?;
    write!(
        writer,
        "- Files Included: {}\n",
        doc.statistics.files_included
    )?;
    write!(writer, "- ~Tokens: {}\n", doc.statistics.estimated_tokens)?;
    write!(writer, "- ~Lines: {}\n", doc.statistics.estimated_lines)?;
    write!(
        writer,
        "- ~Size: {} bytes\n",
        doc.statistics.package_size_bytes
    )?;

    Ok(())
}
