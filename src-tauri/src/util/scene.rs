/*
 * @Author: jiangxin
 * @Date: 2026-05-29 10:14:52
 * @Company: orientsec.com.cn
 * @Description:
 */

use anyhow::Result;
use std::{fs, path::Path, rc::Rc};
use swc_common::{sync::Lrc, FilePathMapping, Globals, SourceMap, GLOBALS};
use swc_ecma_parser::{Lexer, Parser, Syntax, TsSyntax};
use swc_ecma_visit::VisitWith;

use crate::{
    constants::TARGET_SCENE_DIR,
    mystruct::EventFlow,
    scanner::{self, create_global_matcher},
    AppState,
};

fn create_swc_ecma_parser(code: &str, isTsx: bool) -> Result<Vec<String>, anyhow::Error> {
    let globals = Globals::new();
    GLOBALS.set(&globals, || {
        let cm: Lrc<SourceMap> = Lrc::new(SourceMap::new(FilePathMapping::empty()));
        let fm = cm.new_source_file(
            swc_common::FileName::Custom("index.ts".into()).into(),
            code.to_string(),
        );

        let lexer = Lexer::new(
            Syntax::Typescript(TsSyntax {
                tsx: isTsx,
                ..Default::default()
            }),
            Default::default(),
            (&*fm).into(), // 🎯 关键：让输入流带上正确的 SourceMap 坐标范围
            None,
        );

        let mut parser = Parser::new_from(lexer);

        // 6. 解析 Module
        let module = parser
            .parse_module()
            .map_err(|e| anyhow::anyhow!("解析 TS/TSX 文件失败: {:?}", e))?;

        // 7. 顺理成章地执行遍历
        let mut visitor = EventFlow { result: vec![] };
        module.visit_with(&mut visitor);

        Ok(visitor.result)
    })
}

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
                println!("找到文件: {}", path.display());
                let extension_str = path.extension().and_then(|ext| ext.to_str());
                match extension_str {
                    Some("ts") => {
                        let code = fs::read_to_string(&path)
                            .map_err(|e| anyhow::anyhow!("读取文件失败: {}", e))?;
                        create_swc_ecma_parser(&code, false)
                            .map_err(|e| anyhow::anyhow!("解析 TS 文件失败: {}", e))?;
                        // println!("这是一个 TypeScript 文件{}", code);
                    }
                    Some("tsx") => {
                        let code = fs::read_to_string(&path)
                            .map_err(|e| anyhow::anyhow!("读取文件失败: {}", e))?;
                        create_swc_ecma_parser(&code, true)
                            .map_err(|e| anyhow::anyhow!("解析 TSX 文件失败: {}", e))?;
                        // println!("这是一个 TSX 文件{}", code);
                    }
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
