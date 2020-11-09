import React, { CSSProperties } from "react";
import { Spin } from "antd";

const regIsEmpty = /^\s*$/;

const getAntdSpin = ({
  tip = "正在加载...",
  wrapperStyleObj = {} as CSSProperties,
} = {}) => {
  const wrapperStyle: CSSProperties = {
    display: "flex",
    position: "absolute",
    zIndex: 10,
    top: "50%",
    left: "50%",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    transform: "translate(-50%,-50%)",
  };
  Object.assign(wrapperStyle, wrapperStyleObj);
  return (
    <div style={wrapperStyle}>
      <Spin tip={tip} size="large" />
    </div>
  );
};

const throttle = (
  fn: Function,
  delay: number = 200,
  oThis: Object | undefined = undefined
) => {
  if (typeof fn !== "function") {
    return fn;
  }
  const _this = oThis;
  let lastInvoke = 0,
    timer;
  const invokeFn = (...args) => {
    lastInvoke = Date.now();
    fn.apply(_this, args);
  };
  return (...args) => {
    clearTimeout(timer);
    const elapsed = Date.now() - lastInvoke;
    if (elapsed >= delay) {
      invokeFn(...args);
    } else {
      timer = setTimeout(() => {
        invokeFn(...args);
      }, delay - elapsed);
    }
  };
};

export { regIsEmpty, getAntdSpin, throttle };
