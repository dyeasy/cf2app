/*
 * @Author: jiangxin
 * @Date: 2026-04-15 15:53:42
 * @Company: orientsec.com.cn
 * @Description:
 */
use crate::constants::{BUSINESS_ERROR_CODE, TARGET_ATOMICS_DIR};
use crate::mystruct::{ExportItem, MyError, SceneEntry};
use crate::util::init;
use crate::{atomics, scene, useconfig, AppState};
use std::fs;
use std::path::Path;

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
pub async fn get_atomics(state: tauri::State<'_, AppState>) -> Result<Vec<ExportItem>, MyError> {
    let Some(path) = state.project_path.lock().unwrap().clone() else {
        return Err(MyError::new(BUSINESS_ERROR_CODE, "尚未选择项目路径"));
    };

    let target_dir_path = Path::new(&path)
        .join(TARGET_ATOMICS_DIR)
        .join("src/index.ts");

    fs::read_to_string(&target_dir_path)
        // 1. 先把读取文件的错误转成 MyError
        .map_err(|_| {
            MyError::new(
                BUSINESS_ERROR_CODE,
                format!("无法读取文件: {}", target_dir_path.to_string_lossy()),
            )
        })
        // 2. 成功后，打印内容并顺流进入下一个处理函数
        .and_then(|content| {
            atomics::get_atomics(&content).map_err(|msg| MyError::new(BUSINESS_ERROR_CODE, msg))
        })
}

pub async fn get_scene_eventflow(scene_id: String) -> Result<(), MyError> {
    println!("获取场景 {} 的事件流", scene_id);
    scene::get_scene_eventflow(&scene_id);
    Ok(())
}

pub async fn get_scene_forwarding(scene_id: String) -> Result<(), MyError> {
    println!("获取场景 {} 的转发配置", scene_id);
    scene::get_scene_forwarding(&scene_id);
    Ok(())
}
