/*
 * @Author: jiangxin
 * @Date: 2026-04-20 16:16:41
 * @Company: orientsec.com.cn
 * @Description:
 */
import { CheckCard } from "@ant-design/pro-components";
import { Card, Tag } from "antd";
import { ICardItemType } from "../typing";
import { AppstoreOutlined, EyeOutlined } from "@ant-design/icons";

interface ISceneCardProps {
  data?: ICardItemType[];
}

export function SceneCard(props: ISceneCardProps) {
  const { data = [] } = props;
  return data.map((m) => {
    return (
      <CheckCard
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <AppstoreOutlined />
            <span style={{ marginInlineEnd: 8, marginInlineStart: 8 }}>
              {m.sceneData.title}
            </span>
          </div>
        }
        disabled={m.sceneData.disabled}
        key={m.key}
        description={
          <div>
            <Tag>{m.modifiedTime}</Tag>
          </div>
        }
        actions={[1, 2, <div>预览</div>]}
      >
      </CheckCard>
    );
  });
}

