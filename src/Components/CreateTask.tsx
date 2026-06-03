/*
 * @Author: jiangxin
 * @Date: 2026-05-25 15:35:00
 * @Company: orientsec.com.cn
 * @Description:
 */

import {
  Avatar,
  Badge,
  Button,
  Drawer,
  DrawerProps,
  Space,
  Tag,
  Tooltip
} from "antd";
import {
  ProColumns,
  EditableProTable,
  ProDescriptions,
  DrawerForm,
  ProForm,
  ProFormList,
  ProFormText,
  ProCard,
  ProFormSelect,
  ProFormTreeSelect,
  ProFormDependency
} from "@ant-design/pro-components";
import {
  forwardRef,
  FunctionComponent,
  ForwardRefRenderFunction,
  Forw,
  useEffect,
  useMemo,
  useState,
  useImperativeHandle,
  cloneElement
} from "react";
import { IAtomicItemType, ICardItemType } from "@/typing";
import { AppstoreTwoTone } from "@ant-design/icons";
import { ExpandableConfig } from "antd/es/table/interface";
import { getViewName } from "../util";
import { invoke } from "@tauri-apps/api/core";
import style from "./createtask.module.scss";

interface ICreateTaskDrawerProps {
  drawerProps?: Omit<DrawerProps, "open">;
}

export interface ICreateTaskDrawerRef {
  open?: (data?: ICardItemType[]) => void;
}

const DynamicEventFlowTreeSelect = ({
  sceneId,
  name
}: {
  sceneId: string;
  name: string;
}) => {
  const [options, setOptions] = useState([]);

  const loadData = async () => {
    if (!sceneId) return;
    try {
      console.log("哈只");
      const data = await invoke("get_scene_eventflow", { sceneId });
      //   setOptions(data || []);
    } catch (e) {}
  };

  return (
    <ProFormTreeSelect
      label="onClick"
      name={name}
      options={options}
      fieldProps={{
        onPopupVisibleChange(open) {},
        onOpenChange: (open) => open && loadData()
      }}
    />
  );
};

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

export const CreateTaskDrawer = forwardRef<
  ICreateTaskDrawerRef,
  ICreateTaskDrawerProps
>((props, ref) => {
  const { drawerProps } = props;
  const [show, setShow] = useState(false);
  const [atomic, setAtomic] = useState<IAtomicItemType[]>();
  const [dataSource, setDataSource] = useState<ICardItemType[] | undefined>();

  async function getAtomicsData() {
    try {
      const data = await invoke<IAtomicItemType[]>("get_atomics");
      setAtomic(data);
      console.log("data", data);
    } catch (error) {}
  }

//   async function getEventFlow() {
//     try {
//       await invoke("get_scene_eventflow", { sceneId: "bodyRecognition" });
//     } catch (error) {}
//   }

  useEffect(() => {
    if (show) {
      getAtomicsData();
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

  useImperativeHandle(ref, () => ({
    open
  }));
  return (
    <DrawerForm
      title="创建任务"
      width="82%"
      open={show}
      drawerProps={{ destroyOnHidden: true, onClose: close }}
      grid={true}
    >
      <ProFormList<ICardItemType>
        creatorButtonProps={false}
        name="task"
        className={style.scenelist}
        initialValue={dataSource}
        copyIconProps={false}
        min={1}
        itemRender={({ listDom, action }, { record }) => {
          return (
            <Badge.Ribbon text={record?.sceneData?.title} placement="start">
              <ProCard extra={action} size="small">
                {listDom}
              </ProCard>
            </Badge.Ribbon>
          );
        }}
      >
        <ProFormSelect
          label="onPageInit"
          name="onPageInit"
          valueEnum={atomicOptions}
          mode="multiple"
        />
        <ProFormDependency name={["key"]}>
          {({ key }) => {
            return <DynamicEventFlowTreeSelect sceneId={key} name="onClick" />;
          }}
        </ProFormDependency>
      </ProFormList>
    </DrawerForm>
  );
});

