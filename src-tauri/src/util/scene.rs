/*
 * @Author: jiangxin
 * @Date: 2026-05-29 10:14:52
 * @Company: orientsec.com.cn
 * @Description:
 */

use anyhow::Result;
use std::path::Path;
use swc_common::GLOBALS;

use crate::{constants::TARGET_SCENE_DIR, scanner::create_global_matcher, AppState};

pub fn get_scene_eventflow(scene_id: &str, state: tauri::State<'_, AppState>) -> Result<()> {
    let path = state
        .project_path
        .lock()
        .map_err(|e| anyhow::anyhow!("获取锁失败: {}", e))?
        .clone()
        .ok_or_else(|| anyhow::anyhow!("项目路径未设置"))?;

    let target_dir_path = Path::new(&path).join(TARGET_SCENE_DIR);
    println!("目标目录路径: {:?}", target_dir_path);
    let matcher_router = create_global_matcher(&[
        "**/actions/*.ts",
        "**/actions.ts",
        "**/views/*.tsx",
        "**/views.tsx",
    ])
    .map_err(|e| anyhow::anyhow!("获取锁失败: {}", e))?;
    Ok(())
}

pub fn get_scene_forwarding(
    scene_id: &str,
    state: tauri::State<'_, AppState>,
) -> Result<Vec<String>, String> {
    println!("获取场景 {} 的转发配置", scene_id);
    Ok(Vec::new())
}
