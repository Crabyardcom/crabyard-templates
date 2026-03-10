// TAURIKIT:MOD_AUTH
mod commands;
mod error;
mod models;
mod state;

use std::sync::Mutex;

use tauri::Manager;
use tauri::menu::{MenuBuilder, SubmenuBuilder, PredefinedMenuItem};
use state::AppState;

fn build_menu(app: &tauri::App) -> tauri::Result<tauri::menu::Menu<tauri::Wry>> {
    let file_menu = SubmenuBuilder::new(app, "File")
        .close_window()
        .separator()
        .quit()
        .build()?;

    let edit_menu = SubmenuBuilder::new(app, "Edit")
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .separator()
        .select_all()
        .build()?;

    let window_menu = SubmenuBuilder::new(app, "Window")
        .minimize()
        .item(&PredefinedMenuItem::maximize(app, None)?)
        .separator()
        .close_window()
        .build()?;

    MenuBuilder::new(app)
        .item(&file_menu)
        .item(&edit_menu)
        .item(&window_menu)
        .build()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(debug_assertions)]
    let _ = dotenvy::dotenv();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .on_page_load(|webview, payload| {
            if payload.event() == tauri::webview::PageLoadEvent::Finished
                && webview.label() == "main"
            {
                if let Some(w) = webview.get_webview_window("main") {
                    let _ = w.show();
                }
                if let Some(s) = webview.get_webview_window("splash") {
                    let _ = s.close();
                }
            }
        })
        .setup(|app| {
            app.manage(Mutex::new(AppState::default()));

            let menu = build_menu(app)?;
            app.set_menu(menu)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // TAURIKIT:COMMANDS
            commands::settings::get_settings,
            commands::settings::set_settings,
            commands::settings::select_workspace_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
