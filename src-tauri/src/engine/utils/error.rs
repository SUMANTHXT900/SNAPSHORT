/// Engine error type. Skeleton only.
#[derive(Debug)]
pub enum EngineError {
    Io(std::io::Error),
}

impl From<std::io::Error> for EngineError {
    fn from(e: std::io::Error) -> Self {
        EngineError::Io(e)
    }
}
