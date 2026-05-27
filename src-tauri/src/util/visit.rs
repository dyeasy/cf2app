/*
 * @Author: jiangxin
 * @Date: 2026-05-27 13:17:34
 * @Company: orientsec.com.cn
 * @Description:
 */

use swc_ecma_ast::{ExportSpecifier, ModuleExportName, NamedExport};
use swc_ecma_visit::Visit;

use crate::mystruct::{AtomicsExportInfo, ExportItem};

impl Visit for AtomicsExportInfo {
    fn visit_named_export(&mut self, node: &NamedExport) {
        for specifier in &node.specifiers {
            let ExportSpecifier::Named(named) = specifier else {
                continue;
            };
            let Some(src) = &node.src else {
                continue;
            };

            if let Some(ModuleExportName::Ident(exported_ident)) = &named.exported {
                print!(
                    "Exported name: {}, Source: {}",
                    exported_ident.sym,
                    src.value.to_string_lossy()
                );
                self.result.push(ExportItem {
                    name: exported_ident.sym.to_string(),
                    source: src.value.to_string_lossy().into_owned()
                });
            }
        }
    }
}
