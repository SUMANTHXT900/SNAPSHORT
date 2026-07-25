use crate::engine::models::scp_document::ScpDocument;
use std::fs::File;
use std::io::{self, Read, Write};
use std::path::Path;

pub fn render_xml(doc: &ScpDocument, part_index: usize, writer: &mut dyn Write) -> io::Result<()> {
    let part = doc
        .parts
        .get(part_index)
        .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidInput, "Invalid part index"))?;

    write!(writer, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")?;
    write!(
        writer,
        "<snapshort project=\"{}\" package=\"{}\" total=\"{}\">\n",
        doc.metadata.project_name, part.package_number, part.total_packages
    )?;

    write!(
        writer,
        "  <metadata>\n    <generated>{}</generated>\n    <mode>{}</mode>\n    <format>{}</format>\n  </metadata>\n",
        doc.metadata.generation_time,
        doc.metadata.snapshot_mode,
        doc.metadata.output_format,
    )?;

    write!(
        writer,
        "  <instructions>{}</instructions>\n",
        doc.llm_instructions
    )?;
    write!(writer, "  <tree><![CDATA[\n{}\n]]></tree>\n", doc.tree)?;
    write!(writer, "  <files>\n")?;

    let root_dir = Path::new(&doc.metadata.root_directory);

    for b in &part.files {
        write!(
            writer,
            "  <file>\n    <name>{}</name>\n    <path>{}</path>\n    <language>{}</language>\n    <lines>{}</lines>\n    <size>{}</size>\n    <content><![CDATA[",
            b.name, b.path, b.language, b.line_count, b.size_bytes
        )?;

        let file_path = root_dir.join(&b.path);
        if let Ok(mut file) = File::open(&file_path) {
            let mut buf = Vec::new();
            if file.read_to_end(&mut buf).is_ok() {
                // Ensure valid UTF-8 and strip invalid characters
                let text = String::from_utf8_lossy(&buf);
                // Also need to escape CDATA end tags `]]>` if they exist in source
                let escaped = text.replace("]]>", "]]]]><![CDATA[>");
                write!(writer, "{}", escaped)?;
            }
        } else {
            write!(writer, "/* Error: Could not read file contents */")?;
        }

        write!(writer, "]]></content>\n  </file>\n")?;
    }

    write!(writer, "  </files>\n")?;

    write!(
        writer,
        "  <statistics files_included=\"{}\" estimated_tokens=\"{}\" estimated_lines=\"{}\" size_bytes=\"{}\" />\n",
        doc.statistics.files_included,
        doc.statistics.estimated_tokens,
        doc.statistics.estimated_lines,
        doc.statistics.package_size_bytes,
    )?;

    write!(writer, "</snapshort>\n")?;
    Ok(())
}
