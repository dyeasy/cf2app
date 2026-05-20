use chrono::{DateTime, Local};

/*
 * @Author: jiangxin
 * @Date: 2026-04-15 14:16:04
 * @Company: orientsec.com.cn
 * @Description:
 */
use crate::{constants::TARGET_SCENE_DIR, scanner};
use std::{collections::HashMap, path::Path};

pub fn run_init_logic(
    path: &str,
) -> Result<HashMap<String, scanner::SceneMetaData>, Box<dyn std::error::Error>> {
    // let target_scene_dir_name = "fastman2-business-scenes";
    // let base_path = "/Users/jiangxin/dfzq/dfyj-h5-v2/packages";
    let base_path = path;

    let target_dir_path = Path::new(base_path).join(TARGET_SCENE_DIR);

    if !target_dir_path.exists() {
        return Err(format!("目标目录不存在: {:?}", target_dir_path).into());
    }

    let matcher_router = scanner::create_global_matcher(&[
        "**/actions/*.ts",
        "**/actions.ts",
        "**/views/*.tsx",
        "**/views.tsx",
    ])?;

    let matcher_scene_config = scanner::create_global_matcher(&["**/scene.json"])?;

    let mut all_scene: HashMap<String, scanner::SceneMetaData> = HashMap::new();

    let iter = scanner::get_target_files(&target_dir_path);

    for entry in iter {
        match entry {
            Ok(entry) => {
                let path = entry.path();

                let rel_path = path.strip_prefix(&target_dir_path)?;

                let Some(scene_id) = rel_path
                    .components()
                    .next()
                    .and_then(|f| f.as_os_str().to_str())
                else {
                    continue;
                };

                let folder_time = path
                    .metadata()
                    .ok()
                    .and_then(|meta| meta.modified().ok())
                    .map(|sys_time| {
                        let datetime: DateTime<Local> = sys_time.into();
                        datetime.format("%Y-%m-%d %H:%M:%S").to_string()
                    });

                let metadata =
                    all_scene
                        .entry(scene_id.to_string())
                        .or_insert(scanner::SceneMetaData {
                            key: scene_id.to_string(),
                            actions: Vec::new(),
                            views: Vec::new(),
                            modified_time: folder_time,
                            scene_config: scanner::SceneConfig {
                                title: String::new(),
                                ..Default::default()
                            },
                        });
                let target = scanner::file_target_type(
                    path,
                    &base_path,
                    &matcher_router,
                    &matcher_scene_config,
                );

                match target {
                    scanner::FileTarget::Router {
                        display_path,
                        is_action,
                        is_view,
                    } => {
                        if is_action {
                            metadata.actions.push(display_path);
                        } else if is_view {
                            metadata.views.push(display_path);
                        }
                    }
                    scanner::FileTarget::Config(config) => {
                        metadata.scene_config = config;
                        // println!("✅ 成功加载配置: {:?}", metadata.scene_config.title);
                    }
                    scanner::FileTarget::Ignore => {}
                }
            }
            Err(e) => println!("Error: {:?}", e),
        }
    }
    // println!("{:#?}", all_scene);
    Ok(all_scene)
}
