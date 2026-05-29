/*
 * @Author: jiangxin
 * @Date: 2026-04-15 13:46:55
 * @Company: orientsec.com.cn
 * @Description:
 */
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod commands;
pub mod constants;
pub mod mystruct;
pub mod util {
    pub mod init;
    pub mod scanner;
    pub mod useconfig;
    pub mod git;
    pub mod atomics;
    pub mod visit;
    pub mod scene;
}

use std::sync::Mutex;

use tauri::ipc::Invoke;
use tauri::AppHandle;
use tauri::Manager;
use tauri_plugin_store::StoreBuilder;
pub use util::init;
pub use util::scanner;
pub use util::useconfig;
pub use util::git;
pub use util::atomics;
pub use util::scene;

use crate::constants::{STORE_CONFIG_NAME, STORE_KEY_PATH};

pub struct AppState {
    pub project_path: Mutex<Option<String>>,
}

fn get_handler() -> impl Fn(Invoke) -> bool {
    tauri::generate_handler![
        commands::get_all_scenes,
        commands::save_config,
        commands::check_project,
        commands::get_config,
        commands::get_atomics,
        commands::get_scene_eventflow,
        commands::get_scene_forwarding
    ]
}

fn load_initial_config(handle: &AppHandle) -> Option<String> {
    let store = StoreBuilder::new(handle, STORE_CONFIG_NAME)
        .build()
        .ok()?;

    // 2. 读取值并转换
    store.get(STORE_KEY_PATH)
        .and_then(|v| v.as_str().map(|s| s.to_string()))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            project_path: Mutex::new(None),
        })
        .setup(|app| {
            let handle = app.handle();
            let state = app.state::<AppState>();

            let Some(path) = load_initial_config(handle) else {
                return Ok(());
            };
            let Ok(mut lock) = state.project_path.lock() else {
                return Ok(());
            };

            *lock = Some(path);

            Ok(())
        })
        .invoke_handler(get_handler())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
