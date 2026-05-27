/*
 * @Author: jiangxin
 * @Date: 2026-05-25 16:53:22
 * @Company: orientsec.com.cn
 * @Description:
 */
use swc_common::{sync::Lrc, FilePathMapping, Globals, SourceMap, GLOBALS};
use swc_ecma_parser::{Lexer, Parser, Syntax, TsSyntax};
use swc_ecma_visit::VisitWith;

use crate::mystruct::{AtomicsExportInfo, ExportItem};

pub fn get_atomics(code: &str) -> Result<Vec<ExportItem>, String> {
    let globals = Globals::new();

    GLOBALS.set(&globals, || {
        let cm: Lrc<SourceMap> = Lrc::new(SourceMap::new(FilePathMapping::empty()));
        let fm = cm.new_source_file(
            swc_common::FileName::Custom("index.ts".into()).into(),
            code.to_string(),
        );

        let lexer = Lexer::new(
            Syntax::Typescript(TsSyntax {
                tsx: false,
                ..Default::default()
            }),
            Default::default(),
            (&*fm).into(), // 🎯 关键：让输入流带上正确的 SourceMap 坐标范围
            None,
        );

        let mut parser = Parser::new_from(lexer);

        // 6. 解析 Module
        let module = match parser.parse_module() {
            Ok(m) => m,
            Err(e) => {
                return Err(format!("解析 TS 文件失败: {:?}", e));
            }
        };

        // 7. 顺理成章地执行遍历
        let mut visitor = AtomicsExportInfo { result: vec![] };
        module.visit_with(&mut visitor);

        Ok(visitor.result)
    })
}
