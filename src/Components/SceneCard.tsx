/*
 * @Author: jiangxin
 * @Date: 2026-04-20 16:16:41
 * @Company: orientsec.com.cn
 * @Description:
 */
import { useRef, useState } from "react";
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
  notification,
  Badge,
  BorderBeam
} from "antd";
import { ICardItemType } from "../typing";
import {
  AppstoreTwoTone,
  ClearOutlined,
  EditOutlined,
  EllipsisOutlined,
  PlusOutlined,
  SettingOutlined,
  ShoppingCartOutlined
} from "@ant-design/icons";
import { CreateTaskDrawer, ICreateTaskDrawerRef } from "./CreateTask";
import style from "./scenecard.module.scss";
import { invoke } from "@tauri-apps/api/core";
interface ISceneCardProps {}

export function SceneCard(props: ISceneCardProps) {
  const [selectCard, setSelectCard] = useState<ICardItemType[]>();
  const createTaskDrawerInstance = useRef<ICreateTaskDrawerRef>(null);

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
      valueType: "option",
      listSlot: "actions",
      render: (text, record, index) => [
        <Button
          type="link"
          onClick={(e) => {
            e.stopPropagation();
            setSelectCard((v = []) => {
              return [...v, record];
            });
          }}
        >
          添加
        </Button>
      ]
    }
  ];

  return (
    <>
      <ProList<ICardItemType>
        rowKey="key"
        pagination={false}
        toolbar={{
          menu: {
            //   activeKey,
            items: [
              {
                key: "tab1",
                label: (
                  <span>
                    全部场景
                    <Badge count />
                  </span>
                )
              }
            ],
            onChange(key) {
              // setActiveKey(key);
            }
          },
          search: {
            onSearch: (value: string) => {
              console.log("value", value);
            }
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
        search={false}
      />
      <FloatButton.Group
        className={style.groupbutton}
        shape="circle"
        open={true}
        style={{ right: 10 }}
      >
        <FloatButton
          icon={<ClearOutlined />}
          disabled={!selectCard?.length}
          tooltip="清空选中场景"
          onClick={() => setSelectCard([])}
        />
        <BorderBeam
          color={[
            { color: "#2f54eb", percent: 0 },
            { color: "#722ed1", percent: 44 },
            { color: "#ff85c0", percent: 100 }
          ]}
          style={{ opacity: !!selectCard?.length ? 1 : 0 }}
        >
          <FloatButton
            icon={<ShoppingCartOutlined />}
            badge={{
              count: selectCard?.length,
              overflowCount: 999,
              className: style.badgezindex
            }}
            onClick={
              !!selectCard?.length
                ? () => createTaskDrawerInstance.current?.open?.(selectCard)
                : void 0
            }
          />
        </BorderBeam>
      </FloatButton.Group>
      <CreateTaskDrawer ref={createTaskDrawerInstance} />
    </>
  );
}

