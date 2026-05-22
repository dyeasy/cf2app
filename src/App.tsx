/*
 * @Author: jiangxin
 * @Date: 2026-04-15 13:46:55
 * @Company: orientsec.com.cn
 * @Description:
 */
import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { SetProjectTarget } from "./Components/SetProjectTarget";
import { SceneCard } from "./Components/SceneCard";
import {
  Button,
  Descriptions,
  Layout,
  Result,
  Space,
  Statistic,
  notification
} from "antd";
import { PageContainer, ProLayout } from "@ant-design/pro-components";
import "./App.css";
import { LikeOutlined } from "@ant-design/icons";
import { ICardItemType } from "./typing";

const { Header, Footer, Sider, Content } = Layout;

function App() {
  const [projectPath, setProjectPath] = useState<string>();
  const [cardData, setCardData] = useState<ICardItemType[] | undefined>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getConfig();
  }, []);

  async function getConfig() {
    try {
      const path = await invoke<string>("get_config");

      setProjectPath(path);
      if (!!path) {
        await invoke("get_all_scenes")
          .then((res) => {
            const _res = res as ICardItemType[] | undefined;
            if (!!_res?.length) {
              setCardData(_res);
            }
          })
          .catch((err) => {
            throw err;
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } catch (error) {
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
        {/* <Result
            status="404"
            style={{
              height: "100%",
              background: "#fff"
            }}
          </Descriptions>
        }
        loading={loading}
      >
        {/* <Result
            status="404"
            style={{
              height: "100%",
              background: "#fff"
            }}
            title="Hello World"
            subTitle="Sorry, you are not authorized to access this page."
          /> */}
        {!!projectPath ? <SceneCard data={cardData} /> : <SetProjectTarget />}
      </PageContainer>
    </ProLayout>
  );
}

export default App;

