use super::TokenEstimator;

/// Fast, lightweight approximation (~4 chars/token).
/// Suitable for live UI updates while the user is selecting files.
#[derive(Default)]
pub struct FastEstimator;

impl TokenEstimator for FastEstimator {
    fn name(&self) -> &'static str {
        "fast"
    }

    fn estimate(&self, text: &str) -> u64 {
        if text.is_empty() {
            return 0;
        }
        // ~4 characters per token is a reasonable approximation for English code
        (text.chars().count() as f64 / 4.0).ceil() as u64
    }
}
