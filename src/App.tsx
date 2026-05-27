/*
 * @Author: jiangxin
 * @Date: 2026-04-15 13:46:55
 * @Company: orientsec.com.cn
 * @Description:
 */
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SetProjectTarget } from "./Components/SetProjectTarget";
import { SceneCard } from "./Components/SceneCard";
import { Descriptions, notification } from "antd";
import { PageContainer, ProLayout } from "@ant-design/pro-components";
import "./App.css";

function App() {
  const [projectPath, setProjectPath] = useState<string>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getConfig();
  }, []);

  async function getConfig() {
    try {
      const path = await invoke<string>("get_config");
      setProjectPath(path);
    } catch (error) {
      console.log(error);

      if (!!error && typeof error === "object" && "message" in error) {
        notification.error({
          message: "Error",
          description: error.message as string
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProLayout className="container">
      <PageContainer
        fixedHeader
        header={{
          title: "CF2"
        }}
        content={
          <Descriptions size="small" column={2}>
            <Descriptions.Item label="项目">{projectPath}</Descriptions.Item>
          </Descriptions>
        }
        loading={loading}
      >
        {!!projectPath ? <SceneCard/> : <SetProjectTarget />}
      </PageContainer>
    </ProLayout>
  );
}

export default App;

