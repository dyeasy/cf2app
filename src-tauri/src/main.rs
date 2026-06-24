/*
 * @Author: jiangxin
 * @Date: 2026-04-15 13:46:55
 * @Company: orientsec.com.cn
 * @Description: 
 */
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
fn main() {
    cf2app_lib::run()
}
