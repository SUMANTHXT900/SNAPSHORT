use crate::engine::models::scp_document::ScpFileBlock;

/// Splits file blocks into packages by a line threshold AND a token threshold.
/// File-integrity rule: a file exceeding the threshold is moved wholly to the
/// next part rather than being split across packages.
///
/// If both thresholds are zero, everything goes into a single package.
pub fn split_files(
    files: impl Iterator<Item = ScpFileBlock>,
    threshold_lines: usize,
    threshold_tokens: u64,
    threshold_chars: usize,
) -> Vec<Vec<ScpFileBlock>> {
    let line_limit = if threshold_lines == 0 {
        usize::MAX
    } else {
        threshold_lines
    };
    let token_limit = if threshold_tokens == 0 {
        u64::MAX
    } else {
        threshold_tokens
    };
    let char_limit = if threshold_chars == 0 {
        usize::MAX
    } else {
        threshold_chars
    };

    let mut packages: Vec<Vec<ScpFileBlock>> = Vec::new();
    let mut current: Vec<ScpFileBlock> = Vec::new();
    let mut current_lines = 0usize;
    let mut current_tokens = 0u64;
    let mut current_chars = 0usize;

    for file in files {
        let file_would_exceed_lines =
            current_lines > 0 && current_lines + file.line_count > line_limit;

        let file_tokens = file.estimated_tokens;
        let file_would_exceed_tokens =
            current_tokens > 0 && current_tokens + file_tokens > token_limit;

        let file_chars = file.char_count;
        let file_would_exceed_chars = current_chars > 0 && current_chars + file_chars > char_limit;

        if file_would_exceed_lines || file_would_exceed_tokens || file_would_exceed_chars {
            packages.push(std::mem::take(&mut current));
            current_lines = 0;
            current_tokens = 0;
            current_chars = 0;
        }

        current_lines += file.line_count;
        current_tokens += file_tokens;
        current_chars += file_chars;
        current.push(file);
    }

    if !current.is_empty() || packages.is_empty() {
        packages.push(current);
    }

    packages
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_file(path: &str, lines: usize, chars: usize, size: u64, tokens: u64) -> ScpFileBlock {
        ScpFileBlock {
            path: path.into(),
            name: path.into(),
            language: "Rust".into(),
            size_bytes: size,
            line_count: lines,
            char_count: chars,
            estimated_tokens: tokens,
            status: "Included".into(),
        }
    }

    #[test]
    fn single_file_stays_in_one_package() {
        let files = vec![make_file("a.rs", 10, 50, 100, 25)];
        let packages = split_files(files.into_iter(), 100, 0, 0);
        assert_eq!(packages.len(), 1);
        assert_eq!(packages[0].len(), 1);
    }

    #[test]
    fn splits_at_line_threshold() {
        let files: Vec<_> = (0..3)
            .map(|i| make_file(&format!("{}.rs", i), 600, 2000, 100, 150))
            .collect();
        let packages = split_files(files.into_iter(), 1000, 0, 0);
        assert!(
            packages.len() >= 2,
            "should split after ~600 + 600 exceeds 1000"
        );
    }

    #[test]
    fn splits_at_token_threshold() {
        let files: Vec<_> = (0..3)
            .map(|i| make_file(&format!("{}.rs", i), 10, 10000, 100, 5_000))
            .collect();
        let packages = split_files(files.into_iter(), 0, 8_000, 0);
        // Each file has 5000 tokens. Package 1: file0 (5000). File1 would push to 10000 > 8000 → new package. Etc.
        assert!(packages.len() >= 2);
    }

    #[test]
    fn large_file_moves_entirely_to_next_package() {
        let files = vec![
            make_file("small.rs", 200, 1000, 100, 50),
            make_file("huge.rs", 2000, 10000, 100, 500),
            make_file("another.rs", 100, 500, 50, 25),
        ];
        let packages = split_files(files.into_iter(), 1000, 0, 0);
        assert_eq!(packages.len(), 3);
        assert_eq!(packages[0][0].name, "small.rs");
        assert_eq!(packages[1][0].name, "huge.rs");
        assert_eq!(packages[2][0].name, "another.rs");
    }
}
