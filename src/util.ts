/*
 * @Author: jiangxin
 * @Date: 2026-05-25 16:30:49
 * @Company: orientsec.com.cn
 * @Description:
 */
import { groupBy } from "es-toolkit";
import { Children } from "react";
export const SCENE_VIEW_NAME = "packages/fastman2-business-scenes";

export function getViewName(data?: string) {
  return data?.replace?.(SCENE_VIEW_NAME, "") || "";
}

export function getTreeData(key: string, data?: string[]) {
  const grouped = groupBy(data ?? [], (item) => {
    const router = item?.replace?.(`${SCENE_VIEW_NAME}/${key}/`, "");
    const aaaa = router.split("/").filter(Boolean);
    return aaaa[0];
  });

  return Object.entries(grouped).map(([key, value], index) => {
    return {
      titile: key,
      key: `${key}-${index}`,
      Children: [
        {
          title: "ddddd"
        }
      ]
    };
  });
}

