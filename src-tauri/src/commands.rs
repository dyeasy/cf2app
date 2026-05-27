/*
 * @Author: jiangxin
 * @Date: 2026-04-15 15:53:42
 * @Company: orientsec.com.cn
 * @Description:
 */
use crate::constants::BUSINESS_ERROR_CODE;
use crate::mystruct::{MyError, SceneEntry};
use crate::util::init;
use crate::{atomics, useconfig, AppState};

impl MyError {
    fn new(code: i32, message: impl Into<String>) -> Self {
        Self {
            code,
            message: message.into(),
        }
    }
}

#[tauri::command]
pub async fn get_all_scenes(state: tauri::State<'_, AppState>) -> Result<Vec<SceneEntry>, MyError> {
    let Some(path) = state.project_path.lock().unwrap().clone() else {
        return Err(MyError::new(BUSINESS_ERROR_CODE, "尚未选择项目路径"));
    };

    // 调用 util 里的逻辑，并将错误转为 String 返回给前端
    let map = init::run_init_logic(&path)
        .map_err(|msg| MyError::new(BUSINESS_ERROR_CODE, msg.to_string()))?;

    // 将 HashMap 转换为 Vec
    let list = map
        .into_iter()
        .map(|(key, data)| SceneEntry { key, data })
        .collect();

    Ok(list)
}

#[tauri::command]
pub async fn save_config(
    path: String,
    handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<(), MyError> {
    // 调用 util 里的逻辑，并将错误转为 String 返回给前端
    useconfig::save_config(path, handle, state)
        .map_err(|msg| MyError::new(BUSINESS_ERROR_CODE, msg))
}

#[tauri::command]
pub async fn check_project(path: String) -> Result<(), MyError> {
    // 1. 执行校验，如果有错通过 ? 弹出
    useconfig::check_project(&path).map_err(|msg| MyError::new(BUSINESS_ERROR_CODE, msg))?;

    // 2. 只有上面成功了，才会执行到这一行，返回 Ok
    Ok(())
}

#[tauri::command]
pub async fn get_config(state: tauri::State<'_, AppState>) -> Result<Option<String>, String> {
    useconfig::get_config(state)
}

#[tauri::command]
pub async fn get_atomics() -> Result<Vec<String>, MyError> {
    atomics::get_atomics();
    Ok(vec!["Atomic1".to_string(), "Atomic2".to_string()])
}
