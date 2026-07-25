use crate::engine::events::{EngineEvent, ProgressEvent};
use tauri::Emitter;

/// Forwards engine events to the frontend over Tauri's event channel.
pub struct EventEmitter {
    app: tauri::AppHandle,
}

impl EventEmitter {
    pub fn new(app: tauri::AppHandle) -> Self {
        Self { app }
    }

    pub fn emit_progress(&self, event: ProgressEvent) {
        let _ = self.app.emit(EngineEvent::progress_event_name(), event);
    }

    pub fn emit_statistics(&self, event: crate::engine::events::StatisticsEvent) {
        let _ = self.app.emit(EngineEvent::statistics_event_name(), event);
    }

    pub fn emit_warning(&self, event: crate::engine::events::WarningEvent) {
        let _ = self.app.emit(EngineEvent::warning_event_name(), event);
    }
}
