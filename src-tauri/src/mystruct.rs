/*
 * @Author: jiangxin
 * @Date: 2026-05-27 13:19:25
 * @Company: orientsec.com.cn
 * @Description:
 */
use serde::{Deserialize, Serialize};
use std::{
    collections::{HashMap, HashSet},
    path::Path,
};

#[derive(Serialize, Deserialize)] // 必须实现 Serialize，Tauri 才能把它转成 JSON
pub struct MyError {
    pub code: i32,
    pub message: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SceneMetaData {
    pub key: String,
    pub actions: Vec<String>,
    pub views: Vec<String>,
    #[serde(rename = "modifiedTime")]
    pub modified_time: Option<String>,
    // #[serde(rename = "gitData")]
    // pub git_data: GitData,
    #[serde(rename = "sceneData")]
    pub scene_config: SceneConfig,
}

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct GitData {
    pub modified_time: String,      // 最后提交时间（格式化后的文本）
    pub last_commit_author: String, // 最新修改人姓名
    pub author_email: String,       // 最新修改人邮箱
}

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct SceneConfig {
    pub title: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub disabled: bool,
}

pub enum FileTarget {
    Router {
        display_path: String,
        is_action: bool,
        is_view: bool,
    },
    Config(SceneConfig),
    Ignore,
}

#[derive(serde::Serialize)]
pub struct SceneEntry {
    pub key: String,
    #[serde(flatten)] // 这会让 SceneMetaData 的字段直接平铺到这个对象里
    pub data: SceneMetaData,
}

#[derive(serde::Serialize, Debug)]
pub struct ExportItem {
    pub key: String,    // 导出项的原始名称，例如 "configQueryLogic"
    pub name: String,   // 中文名称，例如 "业务办理配置获取"
    pub source: String, // 路径，例如 "./configQueryLogic"
}

#[derive(serde::Serialize, Debug)]
pub struct AtomicsExportInfo {
    pub result: Vec<ExportItem>, // 存放所有提取出的导出项
}
#[derive(serde::Serialize, Debug)]
pub struct EventFlow {
    pub result: HashSet<String>,
    pub current_bind_variables: HashSet<String>,
}

#[derive(serde::Serialize, Debug)]
pub struct Forwarding {
    pub result: HashMap<String, Vec<String>>,
}
