/*
 * @Author: jiangxin
 * @Date: 2026-04-13 16:15:22
 * @Company: orientsec.com.cn
 * @Description:
 */
use globset::{Glob, GlobSet, GlobSetBuilder};
use std::{error::Error, fs, path::Path};
pub use walkdir::WalkDir;

use crate::mystruct::{FileTarget, SceneConfig}; // 如果外面也要用 WalkDir，可以 pub use

pub fn create_global_matcher(patterns: &[&str]) -> Result<GlobSet, Box<dyn Error>> {
    let mut builder = GlobSetBuilder::new();
    for g in patterns {
        builder.add(Glob::new(g)?);
    }
    Ok(builder.build()?)
}

pub fn get_target_files<P: AsRef<Path>>(
    url: P,
) -> impl Iterator<Item = walkdir::Result<walkdir::DirEntry>> {
    const EXCLUSION_LIST: [&str; 4] = ["README.md", "__tests__", ".DS_Store", "component"];
    WalkDir::new(url)
        .min_depth(1)
        .max_depth(3)
        .into_iter()
        .filter_entry(|f| {
            let file_name = f.file_name().to_string_lossy();
            if EXCLUSION_LIST.contains(&file_name.as_ref()) {
                return false;
            }
            if f.depth() == 1 {
                // 第一层只允许文件夹进入
                return f.file_type().is_dir();
            }
            true
        })
}

pub fn get_target_files_from_scene<'a, P: AsRef<Path>>(
    url: P,
    matcher: &'a GlobSet,
) -> impl Iterator<Item = walkdir::Result<walkdir::DirEntry>> + 'a {
    const EXCLUDE_DIRS: [&str; 6] = [
        "node_modules",
        "dist",
        ".git",
        "__tests__",
        "component",
        "assets",
    ];
    let root_path = url.as_ref().to_path_buf();
    WalkDir::new(url)
        .min_depth(1)
        .max_depth(4)
        .into_iter()
        .filter_entry(move |f| {
            let file_name = f.file_name().to_string_lossy();
            if f.file_type().is_dir() {
                // 如果在黑名单里，直接剪枝（不进去）
                if EXCLUDE_DIRS.contains(&file_name.as_ref()) {
                    return false;
                }
            }
            true // 其余的所有目录和文件都放行，让 WalkDir 正常往下走
        })
        .filter_map(|res| res.ok())
        .filter(move |entry| {
            // 如果是文件夹（比如 actions, views 本身），一律不要！
            if entry.file_type().is_dir() {
                return false;
            }

            // 如果是文件，计算相对路径丢给 Glob 匹配
            if let Ok(rel_path) = entry.path().strip_prefix(&root_path) {
                return matcher.is_match(rel_path);
            }

            false
        })
        .map(Ok) // 把剩下的都包装成 Ok，保持和 WalkDir 的输出类型一致
}

pub fn read_scene_config<P: AsRef<Path>>(path: P) -> Result<SceneConfig, Box<dyn Error>> {
    let content = fs::read_to_string(path)?;
    Ok(serde_json::from_str(&content)?)
}

pub fn file_target_type<P: AsRef<Path>>(
    path: P,
    base_path: &str,
    matcher_router: &GlobSet,
    matcher_config: &GlobSet,
) -> FileTarget {
    let path_ref = path.as_ref();
    if matcher_router.is_match(path_ref) {
        let display_path = path_ref
            .strip_prefix(base_path)
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_default();
        let file_name = path_ref
            .file_name()
            .map(|f| f.to_string_lossy())
            .unwrap_or_default();

        const ACTIONS_KEY: &str = "actions";
        const VIEWS_KEY: &str = "views";

        return FileTarget::Router {
            display_path,
            is_action: file_name.contains(ACTIONS_KEY)
                || path_ref
                    .parent()
                    .map_or(false, |f| f.ends_with(ACTIONS_KEY)),
            is_view: file_name.contains(VIEWS_KEY)
                || path_ref.parent().map_or(false, |f| f.ends_with(VIEWS_KEY)),
        };
    }

    if matcher_config.is_match(path_ref) {
        return match read_scene_config(path_ref) {
            Ok(config) => FileTarget::Config(config),
            Err(e) => {
                eprintln!("❌ 解析配置文件失败 {:?}: {}", path_ref, e);
                FileTarget::Ignore
            }
        };
    }
    FileTarget::Ignore
}