use std::collections::HashSet;
use std::sync::OnceLock;

static BINARY_EXTENSIONS: OnceLock<HashSet<&'static str>> = OnceLock::new();
static STRUCTURAL_NOISE: OnceLock<HashSet<&'static str>> = OnceLock::new();

fn binary_extensions() -> &'static HashSet<&'static str> {
    BINARY_EXTENSIONS.get_or_init(|| {
        let mut set = HashSet::new();
        // Images
        set.extend([
            "png", "jpg", "jpeg", "gif", "ico", "bmp", "tiff", "webp", "heic", "svgz",
        ]);
        // Video / Audio
        set.extend([
            "mp4", "webm", "mkv", "avi", "mov", "mp3", "wav", "ogg", "flac", "aac",
        ]);
        // Fonts
        set.extend(["ttf", "otf", "woff", "woff2", "eot"]);
        // Archives
        set.extend(["zip", "tar", "gz", "rar", "7z", "bz2", "xz", "iso"]);
        // Executables / Binaries
        set.extend([
            "exe", "dll", "so", "dylib", "bin", "obj", "o", "a", "lib", "class", "pyc", "pyo",
            "pyd", "wasm",
        ]);
        // Databases
        set.extend(["sqlite", "db", "sqlite3", "rdb", "ibd", "frm", "mdf", "ldf"]);
        // Other
        set.extend(["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"]);
        set
    })
}

fn structural_noise() -> &'static HashSet<&'static str> {
    STRUCTURAL_NOISE.get_or_init(|| {
        let mut set = HashSet::new();
        // Lockfiles and generated noise
        set.extend([
            "package-lock.json",
            "yarn.lock",
            "pnpm-lock.yaml",
            "bun.lockb",
            "cargo.lock",
            "gemfile.lock",
            "poetry.lock",
            "composer.lock",
            "mix.lock",
            "ds_store",
            ".ds_store",
        ]);
        set
    })
}

pub fn is_known_binary_extension(name: &str) -> bool {
    let ext = std::path::Path::new(name)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase());

    if let Some(ext) = ext {
        if binary_extensions().contains(ext.as_str()) {
            return true;
        }
    }
    false
}

pub fn is_structural_noise(name: &str) -> bool {
    let name_lower = name.to_lowercase();

    // Check exact matches (lockfiles etc)
    if structural_noise().contains(name_lower.as_str()) {
        return true;
    }

    // Check suffixes
    if name_lower.ends_with(".map")
        || name_lower.ends_with(".min.js")
        || name_lower.ends_with(".min.css")
        || name_lower.ends_with(".d.ts")
        || name_lower.ends_with(".chunk.js")
        || name_lower.ends_with(".chunk.css")
        || name_lower.ends_with(".bundle.js")
        || name_lower.ends_with(".pyc")
        || name_lower.ends_with(".pyo")
        || name_lower.ends_with(".pyd")
        || name_lower.ends_with(".egg")
        || name_lower.ends_with(".whl")
        || name_lower.ends_with(".ipynb_checkpoints")
    {
        return true;
    }

    false
}

/// Heuristic binary detection by scanning for NUL bytes and non-text ratios.
pub fn is_binary(bytes: &[u8]) -> bool {
    if bytes.is_empty() {
        return false;
    }
    if bytes.contains(&0) {
        return true;
    }
    content_inspector::inspect(bytes).is_binary()
}
