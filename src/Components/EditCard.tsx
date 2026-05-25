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
import { FunctionComponent } from "react";
import { ICardItemType } from "@/typing";
import { AppstoreTwoTone } from "@ant-design/icons";
import { ExpandableConfig } from "antd/es/table/interface";
import { getViewName } from "../util";

interface IEditCardDrawerProps {
  drawerProps: DrawerProps;
  data?: ICardItemType[];
}

export const EditCardDrawer: FunctionComponent<IEditCardDrawerProps> = (
  props
) => {
  const { drawerProps, data } = props;
  const columns: ProColumns<ICardItemType>[] = [
    {
      title: "场景名称",
      dataIndex: ["sceneData", "title"]
    },
    {
      title: "onPageInit"
    },
    {
      title: "onClick"
    },
    {
      title: "操作",
      valueType: "option",
      render: () => [
        <a key="view" onClick={(e) => e.stopPropagation()}>
          查看
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
              render(dom, entity, index, action, schema) {
                return <Tag color="magenta">{entity?.key}</Tag>;
              }
            },
            {
              title: "页面",
              dataIndex: "views",
              render(dom, entity, index, action, schema) {
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
              render(dom, entity, index, action, schema) {
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
      size="65%"
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
        expandable={{
          expandedRowRender
        }}
      />
    </Drawer>
  );
};

