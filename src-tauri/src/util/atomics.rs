/*
 * @Author: jiangxin
 * @Date: 2026-05-25 16:53:22
 * @Company: orientsec.com.cn
 * @Description:
 */
use std::{fs, rc::Rc};
use swc_common::{sync::Lrc, SourceMap};
use swc_ecma_ast::*;
use swc_ecma_visit::{Visit, VisitWith};

use crate::mystruct::AtomicsExportInfo;

// use crate::commands::AtomicsExportInfo;

#[derive(Default)]
pub struct ExportExtractor {
    pub results: Vec<AtomicsExportInfo>,
}

impl Visit for ExportExtractor {
    // fn visit_export_na
    // fn visit_export_named_declaration(&mut self, node: &ExportNamedSpecifier) {
    //     if let (Some(ModuleExportName::Ident(exported_ident)), Some(src)) = (&node.exported, &node.src) {
    //         // self.exports.push(ExportItem {
    //         //     name: exported_ident.sym.to_string(),
    //         //     source: src.value.to_string(),
    //         // });
    //     }
    // }
}

pub fn get_atomics() -> Vec<AtomicsExportInfo> {
    let cm: Lrc<SourceMap> = Default::default();
    Vec::new()
}
