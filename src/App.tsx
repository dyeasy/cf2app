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
import { Button, Layout, Result, Space, Statistic } from "antd";
import { PageContainer, ProLayout } from "@ant-design/pro-components";
import "./App.css";
import { LikeOutlined } from "@ant-design/icons";
import { ICardItemType } from "./typing";

const { Header, Footer, Sider, Content } = Layout;

function App() {
  const [config, setConfig] = useState<any>();
  const [cardData, setCardData] = useState<ICardItemType[] | undefined>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getConfig();
  }, []);

  async function getConfig() {
    try {
      const config = await invoke("get_config");
      console.log("configconfig0000", config, typeof config);
      setConfig(config);
      if (!!config) {
        invoke("get_all_scenes")
          .then((res) => {
            const _res = res as ICardItemType[] | undefined;
            if (!!_res?.length) {
              setCardData(_res);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } catch (error) {
      console.error("Failed to get config:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProLayout className="container">
      <PageContainer content="场景1" loading={loading}>
        {/* <Result
            status="404"
            style={{
              height: "100%",
              background: "#fff"
            }}
            title="Hello World"
            subTitle="Sorry, you are not authorized to access this page."
          /> */}
        {!!config ? <SceneCard /> : <SetProjectTarget />}
      </PageContainer>
    </ProLayout>
  );
}

export default App;

