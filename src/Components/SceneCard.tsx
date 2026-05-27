/*
 * @Author: jiangxin
 * @Date: 2026-04-20 16:16:41
 * @Company: orientsec.com.cn
 * @Description:
 */
import { useState } from "react";
import { ProList } from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";
import {
  Card,
  Tag,
  Form,
  Button,
  FloatButton,
  Space,
  Avatar,
  Drawer,
  notification
} from "antd";
import { ICardItemType } from "../typing";
import { AppstoreTwoTone, ClearOutlined } from "@ant-design/icons";
import { EditCardDrawer } from "./EditCard";
import style from "./scenecard.module.scss";
import { invoke } from "@tauri-apps/api/core";
interface ISceneCardProps {
  //   data?: ICardItemType[];
}

export function SceneCard(props: ISceneCardProps) {
  const [selectCard, setSelectCard] = useState<ICardItemType[]>();
  const [open, setOpen] = useState(false);
  //   const { data: dataSource = [] } = props;

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
        rowSelection={{
          selectedRowKeys: selectCard?.map((m) => m.key),
          onChange(selectedRowKeys, selectedRows, info) {
            setSelectCard(selectedRows);
          }
        }}
        grid={{ gutter: 12, column: 3 }}
        columns={columns}
        headerTitle="场景"
        request={async () => {
          try {
            const data = await invoke<ICardItemType[]>("get_all_scenes");
            return {
              data,
              success: true
            };
          } catch (error) {
            if (!!error && typeof error === "object" && "message" in error) {
              notification.error({
                message: "Error",
                description: error.message as string
              });
            }
            throw error;
          }
        }}
        // dataSource={dataSource}
        tableAlertRender={false}
        className={style.scenecard}
        search={{
          filterType: "query"
        }}
      />
      <FloatButton.Group shape="circle" open={true} style={{ right: 10 }}>
        <FloatButton
          icon={<ClearOutlined />}
          disabled={!selectCard?.length}
          tooltip="清空选中场景"
          onClick={() => setSelectCard([])}
        />
        <FloatButton
          badge={{ count: selectCard?.length, overflowCount: 999 }}
          onClick={!!selectCard?.length ? () => setOpen(true) : void 0}
        />
      </FloatButton.Group>
      <EditCardDrawer
        data={selectCard}
        drawerProps={{
          open,
          onClose() {
            setOpen(false);
          }
        }}
      />
    </>
  );
}

