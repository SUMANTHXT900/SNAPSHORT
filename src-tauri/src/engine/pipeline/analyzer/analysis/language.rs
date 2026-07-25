/// Detects the programming language for a file from its name/extension.
pub fn detect_language(name: &str) -> String {
    let ext = std::path::Path::new(name)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase());
    match ext.as_deref() {
        Some("rs") => "Rust",
        Some("ts") | Some("tsx") => "TypeScript",
        Some("js") | Some("jsx") | Some("mjs") | Some("cjs") => "JavaScript",
        Some("py") => "Python",
        Some("go") => "Go",
        Some("java") => "Java",
        Some("c") | Some("h") => "C",
        Some("cpp") | Some("cc") | Some("cxx") | Some("hpp") => "C++",
        Some("cs") => "C#",
        Some("rb") => "Ruby",
        Some("php") => "PHP",
        Some("swift") => "Swift",
        Some("kt") | Some("kts") => "Kotlin",
        Some("html") => "HTML",
        Some("css") => "CSS",
        Some("scss") | Some("sass") => "Sass",
        Some("json") => "JSON",
        Some("md") | Some("markdown") => "Markdown",
        Some("toml") => "TOML",
        Some("yml") | Some("yaml") => "YAML",
        Some("sh") | Some("bash") => "Shell",
        Some("svg") => "SVG",
        Some("xml") => "XML",
        Some("sql") => "SQL",
        _ => "Plain Text",
    }
    .to_string()
}
