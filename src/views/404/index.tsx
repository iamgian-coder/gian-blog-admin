import React from "react";
import { Link } from "react-router-dom";
import { Result } from "antd";

const NotFound = () => {
  return (
    <Result
      style={{ padding: "0 32px" }}
      status="404"
      title="404"
      subTitle="访问的页面不存在"
      extra={<Link to="/">返回首页</Link>}
    />
  );
};

export default NotFound;
