import React, { lazy, Suspense } from "react";
import { OrderedListOutlined, SmileOutlined } from "@ant-design/icons";
import { Route as ProRoute } from "@ant-design/pro-layout/lib/typings";
import { getAntdSpin } from "./util/index";
import { Switch, Route } from "react-router-dom";

const routeConfig: ProRoute = {
  path: "/",
  routes: [
    {
      path: "/",
      name: "欢迎",
      icon: <SmileOutlined />,
      component: lazy(
        () => import(/*webChunkName: Welcome*/ "./views/welcome/index")
      ),
    },
    {
      path: "/list",
      name: "列表页",
      icon: <OrderedListOutlined />,
      routes: [
        {
          path: "/list/article",
          name: "文章列表",
          icon: <OrderedListOutlined />,
          component: lazy(
            () =>
              import(/*webChunkName: ArticleList*/ "./views/article/list/index")
          ),
        },
      ],
    },
  ],
};

const generateRoutes = (routeConfig) => {
  const finalRoutes: Array<{
    path: string;
    component: any;
    exact: boolean;
  }> = [];

  const generate = (route) => {
    if (route.path && route.component) {
      finalRoutes.push({
        path: route.path,
        component: route.component,
        exact: true,
      });
    }
    if (Array.isArray(route.routes)) {
      route.routes.forEach((item) => generate(item));
    }
  };

  generate(routeConfig);
  return finalRoutes;
};

const AllRoutesComponents = (
  <Suspense fallback={getAntdSpin()}>
    <Switch>
      {generateRoutes(routeConfig).map((item) => {
        return (
          <Route
            key={item.path}
            path={item.path}
            component={item.component}
            exact={item.exact}
          />
        );
      })}
      <Route
        key="404"
        path="*"
        component={lazy(
          () => import(/*webChunkName: 404*/ "./views/404/index")
        )}
      />
    </Switch>
  </Suspense>
);

export { routeConfig, AllRoutesComponents };
