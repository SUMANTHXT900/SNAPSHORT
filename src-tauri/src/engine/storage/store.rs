use std::path::PathBuf;

/// Manages internally stored snapshots for comparison / Changes Snapshot
/// baselines. Storage location follows the OS application data directory.
pub struct SnapshotStore {
    root: PathBuf,
}

impl SnapshotStore {
    pub fn new(app_data_dir: PathBuf) -> Self {
        Self {
            root: app_data_dir.join("snapshots"),
        }
    }

    pub fn project_dir(&self, project_name: &str) -> PathBuf {
        self.root.join(sanitize(project_name))
    }

    pub fn ensure(&self, project_name: &str) -> std::io::Result<PathBuf> {
        let dir = self.project_dir(project_name);
        std::fs::create_dir_all(&dir)?;
        Ok(dir)
    }
}

fn sanitize(name: &str) -> String {
    name.chars()
        .map(|c| {
            if c.is_alphanumeric() || c == '-' || c == '_' {
                c
            } else {
                '_'
            }
        })
        .collect()
}
