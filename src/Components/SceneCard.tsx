/*
 * @Author: jiangxin
 * @Date: 2026-04-20 16:16:41
 * @Company: orientsec.com.cn
 * @Description:
 */
import { ProList } from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";
import { Card, Tag, Form, Button, FloatButton, Space, Avatar } from "antd";
import { ICardItemType } from "../typing";
import { AppstoreTwoTone, ClearOutlined } from "@ant-design/icons";

import style from "./scenecard.module.scss";
import { useState } from "react";
interface ISceneCardProps {
  data?: ICardItemType[];
}

export function SceneCard(props: ISceneCardProps) {
  //   const [selectCard, setSelectCard] = useState<string[]>();
  const [open, setOpen] = useState(false);
  const { data: dataSource = [] } = props;
  //   const onChange: CheckCardGroupProps["onChange"] = function (value) {
  //     setSelectCard(value as string[]);
  //   };

  const columns: ProColumns<ICardItemType>[] = [
    {
      title: "图标",
      search: false,
      render() {
        return (
          <Avatar
            style={{ marginInlineEnd: 10 }}
            icon={<AppstoreTwoTone />}
            size="small"
          />
        );
      },
      listSlot: "avatar"
    },
    {
      title: "场景名称",
      dataIndex: ["sceneData", "title"],
      listSlot: "title"
    },
    {
      title: "操作",
      listSlot: "actions",
      render: () => [
        <a key="view" onClick={(e) => e.stopPropagation()}>
          查看
        </a>
      ]
    }
  ];
  return (
    <>
      <ProList<ICardItemType>
        rowKey="key"
        pagination={false}
        rowSelection={{}}
        grid={{ gutter: 12, column: 3 }}
        columns={columns}
        headerTitle="场景"
        dataSource={dataSource}
        tableAlertOptionRender={false}
        tableAlertRender={({ selectedRows, onCleanSelected }) => {
          return (
            <FloatButton.Group shape="circle" open={true} style={{ right: 10 }}>
              <FloatButton
                icon={<ClearOutlined />}
                disabled={!selectedRows?.length}
                tooltip="清空先中的场景"
                onClick={onCleanSelected}
              />
              <FloatButton
                badge={{ count: selectedRows?.length, overflowCount: 999 }}
                onClick={!!selectedRows?.length ? () => setOpen(true) : void 0}
              />
            </FloatButton.Group>
          );
        }}
        className={style.scenecard}
        search={{
          filterType: "query"
        }}
      />
      {/*
      <DrawerForm
        open={open}
        drawerProps={{
          onClose() {
            setOpen(false);
          }
        }}
      />*/}
    </>
  );
}

