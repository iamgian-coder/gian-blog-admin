import React from "react";
import { Link, useHistory } from "react-router-dom";
import { Observer } from "mobx-react-lite";
import { BackTop, Menu, Dropdown } from "antd";
import ProLayout, {
  PageContainer,
  SettingDrawer,
} from "@ant-design/pro-layout";
import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { routeConfig, AllRoutesComponents } from "../config";
import { useAppStore } from "../hooks";
import Logo from "../assets/img/react.svg";
import "./style.less";

export default () => {
  const { commonStore, loginStore } = useAppStore();

  const history = useHistory();

  const onSettingsChange = (changeSetting) => {
    commonStore.setProSettings(changeSetting);
  };

  const menuItemRender = (item, dom) => (
    <Link
      to={item.path}
      onClick={(e) => {
        if (item.path === history.location.pathname) {
          e.preventDefault();
        }
      }}
    >
      {dom}
    </Link>
  );

  const getSettingDrawerContainer = () => {
    return document.getElementById("test-pro-layout");
  };

  const logout = () => {
    loginStore.logout();
    history.push("/login");
  };

  const rightContentRender = () => {
    return (
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item icon={<LogoutOutlined />} onClick={logout}>
              退出登录
            </Menu.Item>
          </Menu>
        }
      >
        <div className="dropdownMenuTrigger">
          <UserOutlined />
          <span className="userName">
            {loginStore.userStore.currentUser.nickName ||
              loginStore.userStore.currentUser.name}
          </span>
          <DownOutlined />
        </div>
      </Dropdown>
    );
  };

  const getBackTopContainer = () =>
    document.querySelectorAll(".ant-layout")[1] as HTMLElement;

  return (
    <div id="test-pro-layout" className="proLayoutOuterWrapper">
      <Observer>
        {() => (
          <>
            <ProLayout
              className="proLayout100vh"
              logo={<img alt="Logo" src={Logo} />}
              route={routeConfig}
              menuItemRender={menuItemRender}
              rightContentRender={rightContentRender}
              {...commonStore.proSettings}
            >
              <PageContainer>{AllRoutesComponents}</PageContainer>
              <BackTop target={getBackTopContainer} />
            </ProLayout>

            <SettingDrawer
              getContainer={getSettingDrawerContainer}
              onSettingChange={onSettingsChange}
              settings={commonStore.proSettings}
            />
          </>
        )}
      </Observer>
    </div>
  );
};
