//! Native folder-selection dialog wrappers.
//! Tauri-specific OS integration is isolated here so commands and the engine
//! never touch dialog APIs directly.

use tauri_plugin_dialog::DialogExt;

/// Opens the native folder picker and returns the selected path (or None).
pub async fn pick_folder(app: &tauri::AppHandle) -> Option<String> {
    let dialog = app.dialog().file();
    // Skeleton: full async selection wired in via tauri-plugin-dialog later.
    let _ = dialog;
    None
}
