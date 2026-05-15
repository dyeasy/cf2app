/*
 * @Author: jiangxin
 * @Date: 2026-04-16 16:12:20
 * @Company: orientsec.com.cn
 * @Description:
 */

import { Button, Input, Result, Space, Typography, notification } from "antd";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import style from "./setprojecttarget.module.scss";
import { useState } from "react";
import { FolderFilled, InfoCircleOutlined } from "@ant-design/icons";
import { BaseStepsProps } from "antd/es/steps";

export function SetProjectTarget() {
  const [projectPath, setProjectPath] = useState<string>("");
  const [api, contextHolder] = notification.useNotification();
  const [issuccess, setIssuccess] = useState<boolean>(false);
  async function selectDirectory() {
    try {
      setIssuccess(true);
      const selected = await open({
        directory: true,
        multiple: false, // 不允许多选
        title: "请选择你的项目根目录", // 对话框顶部的文案
        defaultPath: "~" // 默认打开家目录
      });
      if (!!selected) {
        setProjectPath(selected);
        await invoke("check_project", { path: selected });
        await invoke("save_config", { path: selected });
      }
    } catch (error: any) {
      setIssuccess(false);
      api.error({
        title: "提示",
        description: Reflect.has(error, "message")
          ? error.message
          : String(error),
        placement: "bottomRight"
      });
    }
  }
  return (
    <>
      <Result
        status="404"
        className={style.setprojecttarget}
        extra={
          <Space.Compact style={{ width: "50%" }}>
            <Input placeholder="请选择项目" readOnly value={projectPath} />
            <Button
              type="primary"
              icon={<FolderFilled />}
              onClick={selectDirectory}
            />
          </Space.Compact>
        }
      >
        {/* <Typography.Text>
          <InfoCircleOutlined style={{ marginRight: "10px" }} />
          必须选择 <Typography.Text code>fastman2</Typography.Text>
        </Typography.Text> */}
      </Result>
      {contextHolder}
    </>
  );
}

