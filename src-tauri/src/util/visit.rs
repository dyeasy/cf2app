/*
 * @Author: jiangxin
 * @Date: 2026-05-27 13:17:34
 * @Company: orientsec.com.cn
 * @Description:
 */

use swc_ecma_ast::{ExportSpecifier, ModuleExportName, NamedExport, VarDeclarator};
use swc_ecma_visit::Visit;

use crate::mystruct::{AtomicsExportInfo, EventFlow, ExportItem};

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
                let exported_name = exported_ident.sym.to_string();
                self.result.push(ExportItem {
                    key: exported_name.clone(),
                    name: exported_name.clone(),
                    source: src.value.to_string_lossy().into_owned(),
                });
            }
        }
    }
}

impl Visit for EventFlow {
    fn visit_var_declarator(&mut self, node: &VarDeclarator) {
    }
}
