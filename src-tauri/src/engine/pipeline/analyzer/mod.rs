//! Stage 2 — Project Analyzer.
//! Enriches a `RawProject` with analysis data using parallel file processing.
//! Answers "What do we know about each file?".

pub mod analysis;
pub mod analyzer;

pub use analyzer::{Analyzer, AnalyzerConfig};
