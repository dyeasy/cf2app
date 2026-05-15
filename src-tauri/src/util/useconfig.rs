use crate::AppState;
/*
 * @Author: jiangxin
 * @Date: 2026-04-17 14:44:07
 * @Company: orientsec.com.cn
 * @Description:
 */
use crate::constants::{STORE_CONFIG_NAME, STORE_KEY_PATH};
use serde_json::{json, Value};
use std::fs;
use std::path::PathBuf;
use tauri::AppHandle;
use tauri_plugin_store::{StoreBuilder, StoreExt};

pub fn save_config(
    path: String,
    handle: AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    let store = StoreBuilder::new(&handle, STORE_CONFIG_NAME)
        .build()
        .map_err(|e| format!("构建 Store 失败: {}", e))?;

    // 2. 写入数据
    // 注意：如果 store.set 报错，尝试给 path 加 json!()
    store.set(STORE_KEY_PATH, json!(path));

    // 3. 保存到磁盘
    store.save().map_err(|e| format!("写入文件失败: {}", e))?;

    let mut lock = state.project_path.lock().map_err(|_| "获取锁失败")?;
    *lock = Some(path);
    
    Ok(())
}

pub fn check_project(path: &str) -> Result<(), String> {
    let root = PathBuf::from(&path);
    let pkg_path = root.join("package.json");
    const ERROR_MSG: &str = "需选择 fastman2项目，并确保其处于根目录";

    if !pkg_path.exists() {
        return Err(ERROR_MSG.to_string());
    }

    let pkg_content = fs::read_to_string(pkg_path).map_err(|_| ERROR_MSG.to_string())?;

    let pkg_json: Value =
        serde_json::from_str(&pkg_content).map_err(|e| format!("JSON 解析失败: {}", e))?;

    let pkg_name = pkg_json["name"]
        .as_str()
        .ok_or("package.json 中缺少 name 字段")?;
    if pkg_name != "dfyj" {
        return Err(format!("当前项目{}不能被使用", pkg_name));
    }
    Ok(())
}

pub fn get_config(state: tauri::State<'_, AppState>) -> Result<Option<String>, String> {
    let lock = state.project_path.lock().map_err(|_| "内存锁获取失败")?;

    Ok(lock.clone())
}
