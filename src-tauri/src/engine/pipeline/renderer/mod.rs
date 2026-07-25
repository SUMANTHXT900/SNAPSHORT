//! Stage 6 — Output Renderer.
//! Converts an `ScpDocument` into the selected output format.
//! Changes presentation only; never changes package content.

mod markdown;
mod txt;
mod xml;

use crate::engine::models::scp_document::ScpDocument;
use std::io::Write;

pub use markdown::render_markdown;
pub use txt::render_txt;
pub use xml::render_xml;

/// Renders an SCP document part into the requested format by streaming directly to the given writer.
pub fn render(
    doc: &ScpDocument,
    part_index: usize,
    format: &str,
    writer: &mut dyn Write,
) -> std::io::Result<()> {
    match format.to_lowercase().as_str() {
        "xml" => render_xml(doc, part_index, writer),
        "txt" | "text" => render_txt(doc, part_index, writer),
        _ => render_markdown(doc, part_index, writer),
    }
}
