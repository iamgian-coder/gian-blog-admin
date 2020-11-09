import React, { ErrorInfo, Suspense, lazy } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { configure } from "mobx";
import { ConfigProvider } from "antd";
import zhCN from "antd/lib/locale/zh_CN";
import PrivateRoute from "./components/privateRoute/index";
import { getAntdSpin } from "./util/index";

configure({
  enforceActions: "observed",
});

const LoginView = lazy(
  () => import(/*webpackChunkName:"Login"*/ "./views/login/index")
);

const LayoutView = lazy(
  () => import(/*webpackChunkName:"Layout"*/ "./layout/index")
);

const ErrorView = lazy(
  () => import(/*webpackChunkName:"Error"*/ "./views/error/index")
);

interface IErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class App extends React.PureComponent<any, IErrorBoundaryState> {
  state = {
    error: null,
    errorInfo: null,
    hasError: false,
  };

  clearState() {
    this.setState({ error: null, errorInfo: null, hasError: false });
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ hasError: true, error, errorInfo });
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    return (
      <ConfigProvider locale={zhCN}>
        <BrowserRouter>
          <Suspense fallback={getAntdSpin()}>
            {hasError ? (
              <ErrorView
                errorObj={{
                  error,
                  errorInfo,
                  clearErrorState: this.clearState.bind(this),
                }}
              />
            ) : (
              <Switch>
                <Route exact path="/login" component={LoginView} />
                <PrivateRoute path="/" component={LayoutView} />
              </Switch>
            )}
          </Suspense>
        </BrowserRouter>
      </ConfigProvider>
    );
  }
}

export default App;
