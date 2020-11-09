import React, { ErrorInfo } from "react";
import { Link } from "react-router-dom";
import { Result } from "antd";

const ErrorView = (props: {
  errorObj: {
    error: Error | null;
    errorInfo: ErrorInfo | null;
    clearErrorState: Function;
  };
}) => {
  const { error, errorInfo, clearErrorState } = props.errorObj;

  return (
    <Result
      status="error"
      title="渲染过程中捕获到了错误"
      subTitle="请查看下面的详细信息"
      extra={[
        <Link
          to="/"
          onClick={() => {
            clearErrorState();
          }}
        >
          清除错误并返回首页
        </Link>,
      ]}
    >
      <details open={true}>
        <summary>组件栈</summary>
        <pre>{errorInfo && errorInfo.componentStack}</pre>
      </details>
      <details open={false}>
        <summary>调用栈</summary>
        <pre>{error && error.stack}</pre>
      </details>
    </Result>
  );
};

export default ErrorView;
