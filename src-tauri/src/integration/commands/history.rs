use serde::{Deserialize, Serialize};

/// A project entry in the unified history list.
/// Used both for projects that were merely opened and for ones that had snapshots generated.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotSummary {
    pub id: String,
    pub project_name: String,
    pub created_at: String,
    pub package_count: usize,
    #[serde(default)]
    pub project_path: String,
    #[serde(default)]
    pub has_snapshot: bool,
}
