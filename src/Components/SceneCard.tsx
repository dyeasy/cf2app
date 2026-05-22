/*
 * @Author: jiangxin
 * @Date: 2026-04-20 16:16:41
 * @Company: orientsec.com.cn
 * @Description:
 */
import { CheckCard, ProForm } from "@ant-design/pro-components";
import { Card, Tag, Form, Button } from "antd";
import { ICardItemType } from "../typing";
import { AppstoreOutlined, EyeOutlined } from "@ant-design/icons";

import style from "./scenecard.module.scss";

interface IBBB {
  name: string;
}

function BBB(props: IBBB) {
  return <div>fdasfdsa</div>;
}
interface ISceneCardProps {
  data?: ICardItemType[];
}

export function SceneCard(props: ISceneCardProps) {
  const { data = [] } = props;
  const [form] = Form.useForm();
  const handleSubmit = async (...arg: any) => {
    console.log("vvv", arg);
  };
  return (
    <ProForm
      layout="vertical"
      form={form}
      onFinish={handleSubmit}
      //   submitter={false}
    >
      <ProForm.Item name="scenelist" label="场景">
        <CheckCard.Group multiple>
          {data.map((m) => {
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
                value={m.key}
                description={
                  <div>
                    <Tag>{m.modifiedTime}</Tag>
                  </div>
                }
                actions={[1, 2, <div>预览</div>]}
              />
            );
          })}
        </CheckCard.Group>
      </ProForm.Item>
    </ProForm>
  );
}

