#![allow(dead_code)]
mod engine;
mod integration;

use tauri::Manager;

use integration::commands::generate::generate_snapshot;
use integration::commands::scan::scan_project;
use integration::commands::snapshot::{SnapshotRequest, SnapshotResult};
use integration::settings::{load_settings, save_settings, AppSettings};

struct ScanState {
    pub cancel_token: std::sync::Arc<std::sync::atomic::AtomicBool>,
}

#[tauri::command]
fn scan_project_command(
    state: tauri::State<ScanState>,
    project_path: String,
    respect_gitignore: Option<bool>,
    exclude_node_modules: Option<bool>,
    include_hidden: Option<bool>,
    include_binary: Option<bool>,
    global_excludes: Option<Vec<String>>,
) -> Result<integration::commands::scan::AnalyzedProjectOutput, String> {
    state
        .cancel_token
        .store(false, std::sync::atomic::Ordering::Relaxed);
    let config = integration::commands::scan::ScanConfig {
        respect_gitignore: respect_gitignore.unwrap_or(true),
        exclude_node_modules: exclude_node_modules.unwrap_or(true),
        include_hidden: include_hidden.unwrap_or(false),
        include_binary: include_binary.unwrap_or(false),
        global_excludes: global_excludes.unwrap_or_default(),
    };
    let ap = scan_project(&project_path, &config, Some(state.cancel_token.clone()))?;
    Ok(integration::commands::scan::AnalyzedProjectOutput::from(ap))
}

#[tauri::command]
fn cancel_scan(state: tauri::State<ScanState>) {
    state
        .cancel_token
        .store(true, std::sync::atomic::Ordering::Relaxed);
}

#[tauri::command]
fn generate_snapshot_command(
    app: tauri::AppHandle,
    request: SnapshotRequest,
) -> Result<SnapshotResult, String> {
    generate_snapshot(&app, request)
}

#[tauri::command]
fn load_settings_command(app: tauri::AppHandle) -> AppSettings {
    let path = app
        .path()
        .app_config_dir()
        .map(|p| p.join("settings.json"))
        .unwrap_or_default();
    load_settings(&path)
}

#[tauri::command]
fn save_settings_command(app: tauri::AppHandle, settings: AppSettings) -> Result<(), String> {
    let path = app
        .path()
        .app_config_dir()
        .map(|p| p.join("settings.json"))
        .unwrap_or_default();
    save_settings(&path, &settings).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    engine::logging::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            app.manage(ScanState {
                cancel_token: std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false)),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            scan_project_command,
            cancel_scan,
            generate_snapshot_command,
            load_settings_command,
            save_settings_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Snapshort");
}
