/*
 * @Author: jiangxin
 * @Date: 2026-04-20 16:16:41
 * @Company: orientsec.com.cn
 * @Description:
 */
import { CheckCard } from "@ant-design/pro-components";
import { Card } from "antd";
import { ICardItemType } from "../typing";
import { EyeOutlined } from "@ant-design/icons";

interface ISceneCardProps {
  data?: ICardItemType[];
}

export function SceneCard(props: ISceneCardProps) {
  const { data = [] } = props;
  return data.map((m) => {
    return (
      <CheckCard
        title={m.sceneData.title}
        key={m.key}
        actions={[<EyeOutlined />]}
      >
        {/* <Card.Meta
          title={m.sceneData.title}
          description={m.sceneData.description}
        /> */}
      </CheckCard>
    );
  });
}

