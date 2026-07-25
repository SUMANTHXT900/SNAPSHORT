//! Stage 7 — Output Writer.
//! Persists rendered packages to disk. The only module that writes output.

use std::fs::File;
use std::path::{Path, PathBuf};

/// Creates a new package file for writing and returns its handle and path.
pub fn create_package_file(
    output_dir: &Path,
    base_name: &str,
    extension: &str,
    index: usize,
    total: usize,
) -> std::io::Result<(PathBuf, File)> {
    std::fs::create_dir_all(output_dir)?;

    let file_name = if total > 1 {
        format!("{}_Part_{:02}.{}", base_name, index + 1, extension)
    } else {
        format!("{}.{}", base_name, extension)
    };

    let path = output_dir.join(file_name);
    let file = File::create(&path)?;
    Ok((path, file))
}
