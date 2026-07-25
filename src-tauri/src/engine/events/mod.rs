use serde::{Deserialize, Serialize};

/// Progress stages emitted during generation.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
pub enum Stage {
    #[default]
    Scanning,
    Analyzing,
    BuildingScp,
    Rendering,
    WritingOutput,
    Completed,
    Cancelled,
    Failed,
}

/// Structured events published by the engine to the frontend.
/// The engine never updates the UI directly; it only emits these.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ProgressEvent {
    pub stage: Stage,
    pub current_file: Option<String>,
    pub files_processed: usize,
    pub total_files: usize,
    pub percentage: f32,
    pub elapsed_ms: u64,
    pub estimated_remaining_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatisticsEvent {
    pub estimated_tokens: u64,
    pub estimated_lines: usize,
    pub files_included: usize,
    pub files_ignored: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WarningEvent {
    pub kind: String,
    pub path: Option<String>,
    pub message: String,
}

/// Discriminated union of all engine events.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum EngineEvent {
    Progress(ProgressEvent),
    Statistics(StatisticsEvent),
    Warning(WarningEvent),
}

pub const EVENT_PROGRESS: &str = "snapshort://progress";
pub const EVENT_STATISTICS: &str = "snapshort://statistics";
pub const EVENT_WARNING: &str = "snapshort://warning";

impl EngineEvent {
    pub fn progress_event_name() -> &'static str {
        EVENT_PROGRESS
    }
    pub fn statistics_event_name() -> &'static str {
        EVENT_STATISTICS
    }
    pub fn warning_event_name() -> &'static str {
        EVENT_WARNING
    }
}
