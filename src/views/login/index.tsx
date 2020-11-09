import React from "react";
import { useHistory } from "react-router-dom";
import { Input, Button, Form, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Observer } from "mobx-react-lite";
import { useAppStore } from "../../hooks/index";
import "./style.less";

const LoginPage = () => {
  const { loginStore } = useAppStore();

  const history = useHistory();

  const login = (values) => {
    loginStore.authenticate(values).then((v) => {
      if (v) {
        const { state }: any = history.location;
        let replaceTo = { pathname: "/" };
        state && state.from ? (replaceTo = state.from) : void 0;
        history.replace(replaceTo);
        message.success("登录成功");
      } else {
        message.error("登录失败");
      }
    });
  };

  return (
    <div className="loginPage">
      <Observer>
        {() => (
          <div
            className={`cute ${
              loginStore.isShowingGreeting
                ? "showGreeting"
                : loginStore.isShowingBlindfold
                ? "showBlindfold"
                : ""
            }`}
          />
        )}
      </Observer>

      <Form className="loginForm" onFinish={login}>
        <Form.Item
          name="userName"
          rules={[{ required: true, message: "请输入用户名" }]}
        >
          <Input
            autoComplete="off"
            size="large"
            prefix={<UserOutlined />}
            placeholder="请输入用户名"
            onFocus={loginStore.onNameFocus}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "请输入密码" }]}
        >
          <Input.Password
            size="large"
            placeholder="请输入密码"
            prefix={<LockOutlined />}
            onFocus={loginStore.onPwdFocus}
          />
        </Form.Item>
        <Form.Item>
          <Observer>
            {() => (
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                className="loginFormButton"
                loading={loginStore.isAuthenticating}
                autoFocus={true}
              >
                登录
              </Button>
            )}
          </Observer>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;
