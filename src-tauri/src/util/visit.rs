/*
 * @Author: jiangxin
 * @Date: 2026-05-27 13:17:34
 * @Company: orientsec.com.cn
 * @Description:
 */

use swc_ecma_ast::{
    CallExpr, ExportSpecifier, Expr, ModuleExportName, NamedExport, Pat, VarDeclarator,
};
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

fn is_act_event_flow_bind(expr: &Expr) -> bool {
    expr.as_call()
        .and_then(|call| call.callee.as_expr())
        .and_then(|callee| callee.as_member())
        .map(|member| {
            let obj_ok = member
                .obj
                .as_ident()
                .map_or(false, |id| id.sym == "actEventFlow");
            let prop_ok = member
                .prop
                .as_ident()
                .map_or(false, |id: &swc_ecma_ast::IdentName| id.sym == "bind");
            obj_ok && prop_ok
        })
        .unwrap_or(false)
}

impl Visit for EventFlow {
    fn visit_var_declarator(&mut self, node: &VarDeclarator) {
        // println!("访问变量声明: {:?}", node.name);
        let Pat::Ident(ident) = &node.name else {
            return;
        };
        let var_name = ident.sym.to_string();
        let Some(init) = &node.init else {
            return;
        };

        let is_bind = init
            .as_call()
            .and_then(|call| call.callee.as_expr())
            .and_then(|callee| callee.as_member())
            .map(|member| {
                let obj_ok = member
                    .obj
                    .as_ident()
                    .map_or(false, |id| id.sym == "actEventFlow");
                let prop_ok = member
                    .prop
                    .as_ident()
                    .map_or(false, |id: &swc_ecma_ast::IdentName| id.sym == "bind");
                obj_ok && prop_ok
            })
            .unwrap_or(false);

        if is_bind {
            println!("找到 actEventFlow.bind 调用: {}", var_name);
            // self.result.push(var_name);
        }
    }
    fn visit_call_expr(&mut self, node: &CallExpr) {}
}
