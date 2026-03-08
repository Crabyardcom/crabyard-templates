mod auth;
mod commands;
mod error;
mod models;
mod state;

use std::sync::Mutex;

use tauri::Manager;
use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Load .env file in development so env vars like GITHUB_CLIENT_ID are available
    #[cfg(debug_assertions)]
    let _ = dotenvy::dotenv();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            app.manage(Mutex::new(AppState::default()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::auth::login,
            commands::auth::poll_auth,
            commands::auth::logout,
            commands::auth::get_auth_status,
            commands::auth::restore_auth,
            commands::settings::get_settings,
            commands::settings::set_settings,
            commands::settings::select_workspace_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
