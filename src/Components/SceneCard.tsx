/*
 * @Author: jiangxin
 * @Date: 2026-04-20 16:16:41
 * @Company: orientsec.com.cn
 * @Description:
 */
import {
  CheckCard,
  ProForm,
  CheckCardGroupProps,
  DrawerForm
} from "@ant-design/pro-components";
import { Card, Tag, Form, Button, FloatButton } from "antd";
import { ICardItemType } from "../typing";
import {
  AppstoreOutlined,
  ClearOutlined,
  CustomerServiceOutlined,
  EyeOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons";

import style from "./scenecard.module.scss";
import { useState } from "react";
interface ISceneCardProps {
  data?: ICardItemType[];
}

export function SceneCard(props: ISceneCardProps) {
  const [selectCard, setSelectCard] = useState<string[]>();
  const [open, setOpen] = useState(false);
  const { data = [] } = props;
  const onChange: CheckCardGroupProps["onChange"] = function (value) {
    setSelectCard(value as string[]);
  };
  return (
    <>
      <CheckCard.Group multiple onChange={onChange} value={selectCard}>
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
      <DrawerForm
        open={open}
        drawerProps={{
          onClose() {
            setOpen(false);
          }
        }}
      />
      <FloatButton.Group shape="circle" open={true}>
        <FloatButton
          icon={<ClearOutlined />}
          disabled={!selectCard?.length}
          tooltip="清空先中的场景"
          onClick={() => setSelectCard([])}
        />
        <FloatButton
          badge={{ count: selectCard?.length, overflowCount: 999 }}
          onClick={!!selectCard?.length ? () => setOpen(true) : void 0}
        />
      </FloatButton.Group>
    </>
  );
}

