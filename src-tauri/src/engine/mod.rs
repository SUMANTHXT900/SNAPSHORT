//! Snapshot Engine — all core business logic, independent of the frontend.
//! Layers: models -> pipeline (scanner/analyzer/scp/renderer/writer)
//!        + storage (snapshot history) + events (progress emission).

pub mod config;
pub mod events;
pub mod logging;
pub mod models;
pub mod pipeline;
pub mod storage;
pub mod utils;
