use tracing_subscriber::EnvFilter;

/// Initializes the tracing subscriber for diagnostics and structured logging.
pub fn init() {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));
    tracing_subscriber::fmt().with_env_filter(filter).init();
}
