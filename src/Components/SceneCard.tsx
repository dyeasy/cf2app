/*
 * @Author: jiangxin
 * @Date: 2026-04-20 16:16:41
 * @Company: orientsec.com.cn
 * @Description:
 */
import { CheckCard } from "@ant-design/pro-components";
import { ICardItemType } from "../typing";

interface ISceneCardProps {
  data?: ICardItemType[];
}

export function SceneCard(props: ISceneCardProps) {
  const { data = [] } = props;
  return data.map((m) => {
    return <div>eeee</div>;
  });
}

