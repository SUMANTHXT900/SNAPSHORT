//! Internal snapshot history and comparison baselines.
//! Uses the OS-standard application data directory. Operates entirely
//! behind the scenes and never touches exported snapshot files.

#[allow(dead_code)]
pub mod store;

#[allow(unused_imports)]
pub use store::SnapshotStore;
