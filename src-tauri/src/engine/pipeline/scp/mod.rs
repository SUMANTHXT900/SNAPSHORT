//! Stage 5 — Snapshort Context Package (SCP) Builder.
//! Transforms an `AnalyzedProject` into a canonical `ScpDocument`.
//! Answers "How should this project be packaged?".

mod builder;
mod llm_instructions;
mod split;
mod tree;

pub use builder::ScpBuilder;
