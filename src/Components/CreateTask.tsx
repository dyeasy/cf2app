/*
 * @Author: jiangxin
 * @Date: 2026-05-25 15:35:00
 * @Company: orientsec.com.cn
 * @Description:
 */

import {
  Badge,
  Card,
  Col,
  DrawerProps,
  Row,
  Space,
  Tag,
  Tree,
  TreeSelect
} from "antd";
import {
  ProDescriptions,
  DrawerForm,
  ProForm,
  ProCard,
  ProFormSelect,
  ProFormTreeSelect,
  ProFormList
} from "@ant-design/pro-components";
import {
  forwardRef,
  FunctionComponent,
  useEffect,
  useMemo,
  useState,
  useImperativeHandle
} from "react";
import { IAtomicItemType, ICardItemType } from "@/typing";
import { ExpandableConfig } from "antd/es/table/interface";
import { getTreeData, getViewName } from "../util";
import { invoke } from "@tauri-apps/api/core";
import style from "./createtask.module.scss";

interface ICreateTaskDrawerProps {
  drawerProps?: Omit<DrawerProps, "open">;
}

export interface ICreateTaskDrawerRef {
  open?: (data?: ICardItemType[]) => void;
}

const DynamicEventFlowTreeSelect: FunctionComponent<{
  sceneId: string;
  name: string;
}> = (props) => {
  const { sceneId, name } = props;
  const loadData = async () => {
    if (!sceneId) return;
    try {
      console.log("哈只");
      const data = await invoke("get_scene_eventflow", { sceneId });
      console.log("datadatadatadata-", data);

      //   setOptions(data || []);
    } catch (e) {}
  };

  return (
    <ProFormTreeSelect
      label="onClick"
      name={name}
      params={{ sceneId }}
      request={async () => {
        console.log(sceneId, "fdafdsa", "DynamicEventFlowTreeSelect");
        const data = await invoke("get_scene_eventflow", { sceneId });
        console.log("datadatadatadata-", data);
        return [];
      }}
      fieldProps={{
        // onOpenChange: (open) => open && loadData(),
        treeCheckable: true
        //   treeData: [
        //     {
        //       title: "Node1",
        //       value: "0-0",
        //       key: "0-0",
        //       children: [
        //         {
        //           title: "Child Node1",
        //           value: "0-0-0",
        //           key: "0-0-0"
        //         }
        //       ]
        //     },
        //     {
        //       title: "Node2",
        //       value: "0-1",
        //       key: "0-1",
        //       children: [
        //         {
        //           title: "Child Node3",
        //           value: "0-1-0",
        //           key: "0-1-0"
        //         },
        //         {
        //           title: "Child Node4",
        //           value: "0-1-1",
        //           key: "0-1-1"
        //         },
        //         {
        //           title: "Child Node5",
        //           value: "0-1-2",
        //           key: "0-1-2"
        //         }
        //       ]
        //     }
        //   ]
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
      {dataSource?.map?.((m, index) => {
        return (
          <ProFormList<ICardItemType>
            name={`task_${index}`}
            key={m.key}
            initialValue={[m]}
            creatorButtonProps={false}
            itemRender={({ listDom, action }, { record }) => {
              return (
                <Badge.Ribbon text={record?.sceneData?.title} placement="start">
                  <ProCard extra={action} size="small">
                    <Row>
                      <Col span={10} offset={1}>
                        <ProDescriptions<ICardItemType>
                          column={2}
                          title="详情"
                          dataSource={m}
                          layout="vertical"
                          columns={[
                            {
                              label: "文件夹",
                              dataIndex: "key",
                              span: 2,
                              render(_, entity) {
                                return <Tag color="magenta">{entity.key}</Tag>;
                              }
                            },
                            {
                              label: "views",
                              dataIndex: "views",
                              render(dom, entity, index, action, schema) {
                                console.log("entityentityentity", entity);
                                getTreeData(entity.key, entity.views);
                                return (
                                  <Tree.DirectoryTree
                                    defaultExpandAll
                                    treeData={[
                                      {
                                        title: "views",
                                        key: "0-0"
                                        // children: entity.views?.map?.((v) => {
                                        //     console.log('vvv',v)
                                        //   return {
                                        //     title: getViewName(v),
                                        //     key: "0-0-0",
                                        //     isLeaf: true
                                        //   };
                                        // })
                                      }
                                    ]}
                                  />
                                );
                              }
                            },
                            {
                              label: "actions"
                            }
                          ]}
                        />
                      </Col>
                      <Col span={10} offset={1}>
                        {listDom}
                      </Col>
                    </Row>
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
            <ProFormTreeSelect
              label="onClick"
              name="onClick"
              fieldProps={{
                treeCheckable: true,
                treeNodeLabelProp: "label",
                tagRender(...arg){
                    console.log('sss',...arg);
                    
                    return <div>fdafdsa</div>
                }
              }}
              request={async () => {
                try {
                  const { ts, tsx } = await invoke<{
                    ts: string[];
                    tsx: string[];
                  }>("get_scene_eventflow", {
                    sceneId: m.key
                  });

                  const eventflow = [...ts, ...tsx];
                  return eventflow?.map?.((e) => {
                    return {
                      title: e,
                      value: e,
                      children: atomic?.map?.((a, index) => {
                        return {
                          title: a.name,
                          value: `${e}_${a.key}`,
                          label: `${e}:${a.name}`
                        };
                      })
                    };
                  });
                } catch (error) {
                  throw error;
                }
              }}
            />
          </ProFormList>
        );
      })}
    </DrawerForm>
  );
});

