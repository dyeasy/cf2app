/*
 * @Author: jiangxin
 * @Date: 2026-05-25 15:35:00
 * @Company: orientsec.com.cn
 * @Description:
 */

import { Avatar, Button, Drawer, DrawerProps, Space, Tag } from "antd";
import {
  ProColumns,
  EditableProTable,
  ProDescriptions
} from "@ant-design/pro-components";
import { FunctionComponent, useEffect, useState } from "react";
import { ICardItemType } from "@/typing";
import { AppstoreTwoTone } from "@ant-design/icons";
import { ExpandableConfig } from "antd/es/table/interface";
import { getViewName } from "../util";
import { invoke } from "@tauri-apps/api/core";

interface IEditCardDrawerProps {
  drawerProps: DrawerProps;
  data?: ICardItemType[];
}

export const EditCardDrawer: FunctionComponent<IEditCardDrawerProps> = (
  props
) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const { drawerProps, data } = props;

  async function getAtomicsData() {
    try {
      const data = await invoke("get_atomics");
    } catch (error) {}
  }

  useEffect(() => {
    if (!!drawerProps.open) {
      getAtomicsData();
    }
  }, [drawerProps.open]);

  const columns: ProColumns<ICardItemType>[] = [
    {
      title: "场景名称",
      dataIndex: ["sceneData", "title"],
      editable: false,
      width: 100,
      ellipsis: true,
      fixed: "left"
    },
    {
      title: "onPageInit",
      dataIndex: "onPageInit",
      valueType: "select",
      fieldProps: {
        mode: "multiple", // 关键：设置为多选
        allowClear: true, // 可选：允许清空
        maxTagCount: 2 //
      },
      request() {
        return Promise.resolve([
          {
            label: "fdf",
            value: "d"
          },
          {
            label: "aaa",
            value: "dddd"
          }
        ]);
      }
      //   width: 200
    },
    {
      title: "onClick",
      dataIndex: "onClick",
      valueType: "select",
      width: 200
    },
    {
      title: "操作",
      valueType: "option",
      render: (text, record, _, action) => [
        <a key="editable" onClick={() => action?.startEditable?.(record.key)}>
          编辑
        </a>
      ]
    }
  ];

  const expandedRowRender: ExpandableConfig<ICardItemType>["expandedRowRender"] =
    function (record) {
      return (
        <ProDescriptions<ICardItemType>
          column={2}
          title="详情"
          dataSource={record}
          layout="vertical"
          columns={[
            {
              title: "文件夹",
              dataIndex: "key",
              valueType: "text",
              span: 2,
              render(_, entity) {
                return <Tag color="magenta">{entity?.key}</Tag>;
              }
            },
            {
              title: "页面",
              dataIndex: "views",
              render(_, entity) {
                return (
                  <div>
                    {entity.views?.map((m) => (
                      <div>{getViewName(m)}</div>
                    ))}
                  </div>
                );
              }
            },
            {
              title: "逻辑",
              dataIndex: "actions",
              render(_, entity) {
                return (
                  <div>
                    {entity.actions?.map((m) => (
                      <div>{getViewName(m)}</div>
                    ))}
                  </div>
                );
              }
            }
          ]}
        ></ProDescriptions>
      );
    };
  return (
    <Drawer
      title="创建"
      size="82%"
      footer={
        <Space>
          <Button>取消</Button>
          <Button type="primary">确定</Button>
        </Space>
      }
      {...drawerProps}
    >
      <EditableProTable<ICardItemType>
        rowKey="key"
        value={data}
        columns={columns}
        size="middle"
        editable={{
          type: "single",
          editableKeys,
          onChange: setEditableRowKeys
        }}
        expandable={{
          expandedRowRender
        }}
      />
    </Drawer>
  );
};

