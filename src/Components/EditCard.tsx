/*
 * @Author: jiangxin
 * @Date: 2026-05-25 15:35:00
 * @Company: orientsec.com.cn
 * @Description:
 */

import { Avatar, Button, Drawer, DrawerProps, Space, Tag, Tooltip } from "antd";
import {
  ProColumns,
  EditableProTable,
  ProDescriptions
} from "@ant-design/pro-components";
import {
  forwardRef,
  FunctionComponent,
  ForwardRefRenderFunction,
  Forw,
  useEffect,
  useMemo,
  useState,
  useImperativeHandle
} from "react";
import { IAtomicItemType, ICardItemType } from "@/typing";
import { AppstoreTwoTone } from "@ant-design/icons";
import { ExpandableConfig } from "antd/es/table/interface";
import { getViewName } from "../util";
import { invoke } from "@tauri-apps/api/core";

interface IEditCardDrawerProps {
  drawerProps?: Omit<DrawerProps, "open">;
}

export interface IEditCardDrawerRef {
  open?: (data?: ICardItemType[]) => void;
}

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

export const EditCardDrawer = forwardRef<
  IEditCardDrawerRef,
  IEditCardDrawerProps
>((props, ref) => {
  const { drawerProps } = props;
  const [show, setShow] = useState(false);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [atomic, setAtomic] = useState<IAtomicItemType[]>();
  const [dataSource, setDataSource] = useState<ICardItemType[] | undefined>();
  const { eventFlowParams, setEventFlowParams } =
    useState<Record<string, any>>();

  async function getAtomicsData() {
    try {
      const data = await invoke<IAtomicItemType[]>("get_atomics");
      setAtomic(data);
      console.log("data", data);
    } catch (error) {}
  }

  async function getEventFlow() {
    try {
      await invoke("get_scene_eventflow", { sceneId: "bodyRecognition" });
    } catch (error) {}
  }

  useEffect(() => {
    if (show) {
      getAtomicsData();
      getEventFlow();
    }
  }, [show]);

  function open(data?: ICardItemType[]) {
    setShow(true);
    setDataSource(data);
  }

  function close() {
    setShow(false);
  }

  const atomicOptions = useMemo(() => {
    if (atomic?.length) {
      return Object.fromEntries(atomic.map((m) => [m.key, { text: m.name }]));
    }
    return void 0;
  }, [atomic]);

  const columns: ProColumns<ICardItemType>[] = [
    {
      title: "场景名称",
      dataIndex: ["sceneData", "title"],
      editable: false,
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
        maxTagCount: 4, //
        maxTagPlaceholder: (omittedValues) => (
          <Tooltip
            styles={{ root: { pointerEvents: "none" } }}
            title={omittedValues.map(({ label }) => label).join(", ")}
          >
            <span>+ {omittedValues.length}...</span>
          </Tooltip>
        )
      },
      valueEnum: atomicOptions,
      width: 280
    },
    {
      title: "onClick",
      dataIndex: "onClick",
      valueType: "treeSelect",
      fieldProps: {
        mode: "tags", // 关键：设置为多选
        allowClear: true, // 可选：允许清空
        maxTagCount: 4, //
        treeCheckable: true
        // maxTagPlaceholder: (omittedValues) => (
        //   <Tooltip
        //     styles={{ root: { pointerEvents: "none" } }}
        //     title={omittedValues.map(({ label }) => label).join(", ")}
        //   >
        //     <span>+ {omittedValues.length}...</span>
        //   </Tooltip>
        // )
      },
      //   valueEnum: atomicOptions,
      //   params: { name: "aaa" },
      request: async (_, record) => {
        // 关键：只在当前行处于编辑状态时才请求
        if (!editableKeys.includes(record.key as React.Key)) {
          return [];
        }

        console.log(`正在请求 onClick 数据 - 行 ${record.key}`);

        try {
          //   const data = await invoke<IAtomicItemType[]>("get_atomics");
          return [1, 2, 3].map((item) => ({
            label: "212121",
            value: "dddd"
          }));
        } catch (error) {
          console.error("请求失败", error);
          return [];
        }
      },
      width: 280
    },
    {
      title: "操作",
      valueType: "option",
      width: 140,
      render: (text, record, _, action) => [
        <a key="editable" onClick={() => action?.startEditable?.(record.key)}>
          编辑
        </a>
      ]
    }
  ];

  useImperativeHandle(ref, () => ({
    open
  }));
  return (
    <Drawer
      title="创建"
      size="82%"
      open={show}
      destroyOnHidden
      afterOpenChange={() => {
        if (!open) {
          setDataSource(void 0);
        }
      }}
      footer={
        <Space>
          <Button>取消</Button>
          <Button type="primary">确定</Button>
        </Space>
      }
      onClose={close}
      {...drawerProps}
    >
      <EditableProTable<ICardItemType>
        rowKey="key"
        value={dataSource}
        columns={columns}
        size="middle"
        onChange={(v) => {
          setDataSource(v as any);
        }}
        editable={{
          type: "single",
          editableKeys,
          onChange: (key) => {
            console.log('fsafdsa',key)
            setEditableRowKeys(key);
          },
        }}
        expandable={{
          expandedRowRender
        }}
      />
    </Drawer>
  );
});

