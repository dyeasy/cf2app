/*
 * @Author: jiangxin
 * @Date: 2026-05-27 13:17:34
 * @Company: orientsec.com.cn
 * @Description:
 */

use swc_ecma_ast::{
    CallExpr, ClassProp, ExportSpecifier, Expr, Ident, Lit, ModuleExportName, NamedExport, Pat,
    TsLit, TsLitType, TsPropertySignature, TsType, TsTypeAliasDecl, TsTypeAnn, TsTypeElement,
    TsTypeLit, TsUnionOrIntersectionType, VarDeclarator,
};
use swc_ecma_visit::{Visit, VisitWith};

use crate::mystruct::{AtomicsExportInfo, EventFlow, ExportItem, Forwarding};

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

impl Visit for Forwarding {
    fn visit_ts_type_alias_decl(&mut self, node: &TsTypeAliasDecl) {
        let type_name = node.id.sym.to_string();
        if type_name == "ForwardingComponentsName"
            && let TsType::TsUnionOrIntersectionType(TsUnionOrIntersectionType::TsUnionType(union)) =
                &*node.type_ann
        {
            for ty in &union.types {
                let ts_type = &**ty;
                if let TsType::TsLitType(TsLitType {
                    lit: TsLit::Str(str_lit),
                    ..
                }) = ts_type
                {
                    self.components_val
                        .insert(str_lit.value.to_string_lossy().into_owned());
                    // self.result
                    //     .entry(String::from("component"))
                    //     .or_insert(Default::default())
                    //     .insert(str_lit.value.to_string_lossy().into_owned());
                }
            }
        }

        if type_name == "Forwarding"
            && let Some(type_lit) = node.type_ann.as_ts_type_lit()
            && !type_lit.members.is_empty()
        {
            let members = &type_lit.members;

            let inner_members_opt = members
                .iter()
                .find_map(|item| match item {
                    TsTypeElement::TsPropertySignature(props)
                        if let Expr::Ident(ident) = &*props.key =>
                    {
                        if ident.sym == self.scene_id {
                            return Some(props);
                        }

                        None
                    }
                    _ => None,
                })
                .and_then(|n| n.type_ann.as_ref())
                .and_then(|ann| ann.type_ann.as_ts_type_lit())
                .map(|lit| &lit.members);
            if let Some(inner_members) = inner_members_opt {
                inner_members.iter().for_each(|m| {
                    let Some(prop) = m.as_ts_property_signature() else {
                        return;
                    };

                    let Some(Ident { sym, .. }) = prop.key.as_ident() else {
                        return;
                    };
                    let key_value = sym.to_string();
                    if key_value == "component" && !self.components_val.is_empty() {
                        self.result
                            .entry(key_value)
                            .or_insert(self.components_val.to_owned());
                        return;
                    }

                    let TsTypeAnn { type_ann, .. } = &**prop.type_ann.as_ref().unwrap();

                    if key_value == "api"
                        && let Some(TsTypeLit { members, .. }) = type_ann.as_ts_type_lit()
                    {
                        let api_value = members
                            .iter()
                            .filter_map(|f| f.as_ts_property_signature())
                            .filter_map(|f| f.key.as_ident())
                            .map(|f| f.sym.to_string());
                        self.result.entry(key_value).or_default().extend(api_value);
                        return;
                    }
                });
            }
        }

        node.visit_children_with(self);
    }
}
