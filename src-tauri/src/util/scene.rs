/*
 * @Author: jiangxin
 * @Date: 2026-05-29 10:14:52
 * @Company: orientsec.com.cn
 * @Description:
 */

use anyhow::Result;
use std::path::Path;
use swc_common::GLOBALS;

use crate::{
    constants::TARGET_SCENE_DIR,
    scanner::{self, create_global_matcher},
    AppState,
};

pub fn get_scene_eventflow(scene_id: &str, state: tauri::State<'_, AppState>) -> Result<()> {
    let path = state
        .project_path
        .lock()
        .map_err(|e| anyhow::anyhow!("获取锁失败: {}", e))?
        .clone()
        .ok_or_else(|| anyhow::anyhow!("项目路径未设置"))?;

    let target_dir_path = Path::new(&path).join(TARGET_SCENE_DIR).join(scene_id);
    let matcher_router = create_global_matcher(&[
        "**/actions/*.ts",
        "**/actions.ts",
        "**/views/*.tsx",
        "**/views.tsx",
    ])
    .map_err(|e| anyhow::anyhow!("获取锁失败: {}", e))?;

    let iter = scanner::get_target_files_from_scene(&target_dir_path, &matcher_router);

    for entry in iter {
        match entry {
            Ok(entry) => {
                let path = entry.path();
                let extension_str = path.extension().and_then(|ext| ext.to_str());
                match extension_str {
                    Some("ts") => println!("这是一个 TypeScript 文件"),
                    Some("tsx") => println!("这是一个 TSX 文件"),
                    _ => println!("未知文件类型"),
                }
            }
            Err(e) => {
                println!("遍历文件时出错: {}", e);
            }
        }
    }
    Ok(())
}

pub fn get_scene_forwarding(
    scene_id: &str,
    state: tauri::State<'_, AppState>,
) -> Result<Vec<String>, String> {
    println!("获取场景 {} 的转发配置", scene_id);
    Ok(Vec::new())
}
