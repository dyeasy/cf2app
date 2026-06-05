/*
 * @Author: jiangxin
 * @Date: 2026-05-27 13:17:34
 * @Company: orientsec.com.cn
 * @Description:
 */

use swc_ecma_ast::{
    CallExpr, ClassProp, ExportSpecifier, Expr, Lit, ModuleExportName, NamedExport, Pat,
    VarDeclarator,
};
use swc_ecma_visit::{Visit, VisitWith};

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
    fn visit_class_prop(&mut self, node: &ClassProp) {
        self.current_bind_variables.clear();
        node.visit_children_with(self);
    }
    // 2. 针对普通类方法的兼容，同样开启纵向搜索
    fn visit_class_method(&mut self, node: &swc_ecma_ast::ClassMethod) {
        self.current_bind_variables.clear();
        node.visit_children_with(self);
    }
    fn visit_var_declarator(&mut self, node: &VarDeclarator) {
        node.visit_children_with(self);
        let Pat::Ident(ident) = &node.name else {
            return;
        };
        let var_name = ident.sym.to_string();
        let Some(init) = &node.init else {
            return;
        };

        if is_act_event_flow_bind(init) {
            self.current_bind_variables.insert(var_name);
        }
    }
    fn visit_call_expr(&mut self, node: &CallExpr) {
        node.visit_children_with(self);
        let Some(ident) = &node.callee.as_expr().and_then(|e| e.as_ident()) else {
            return;
        };

        let func_name = ident.sym.to_string();
        if self.current_bind_variables.contains(&func_name) {
            if let Some(Expr::Lit(Lit::Str(str_lit))) = &node.args.first().map(|arg| &*arg.expr) {
                let arg = str_lit.value.as_str().unwrap().to_string();
                self.result.insert(arg);
            }
        }
    }
}
