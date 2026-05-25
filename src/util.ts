/*
 * @Author: jiangxin
 * @Date: 2026-05-25 16:30:49
 * @Company: orientsec.com.cn
 * @Description:
 */

export const SCENE_VIEW_NAME = "packages/fastman2-business-scenes/";

export function getViewName(data?: string) {
  return data?.replace?.(SCENE_VIEW_NAME, "") || "";
}

