//! Default application configuration values.
//! The configuration system uses JSON and remains human-readable.

pub const DEFAULT_OUTPUT_FORMAT: &str = "markdown";
pub const DEFAULT_SNAPSHOT_MODE: &str = "full";
pub const DEFAULT_SPLIT_MODE: &str = "lines";
pub const DEFAULT_LINE_THRESHOLD: usize = 1_000;
pub const DEFAULT_RESPECT_GITIGNORE: bool = true;
pub const DEFAULT_EXCLUDE_NODE_MODULES: bool = true;
pub const DEFAULT_INCLUDE_HIDDEN: bool = false;
pub const DEFAULT_INCLUDE_BINARY: bool = false;
