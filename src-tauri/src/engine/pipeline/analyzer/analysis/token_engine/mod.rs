//! Token Estimation Engine.
//! Uses a universal fast heuristic for all estimates.

pub mod fast;

/// A token estimation strategy.
pub trait TokenEstimator: Send + Sync {
    fn name(&self) -> &'static str;
    fn estimate(&self, text: &str) -> u64;
}

/// Registry of available estimation strategies.
pub fn estimators() -> Vec<Box<dyn TokenEstimator>> {
    vec![Box::new(fast::FastEstimator::default())]
}

/// Default estimate used for live UI updates (fast strategy).
pub fn estimate_tokens(text: &str) -> u64 {
    fast::FastEstimator::default().estimate(text)
}
