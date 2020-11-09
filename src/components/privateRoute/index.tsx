import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { useAppStore } from "../../hooks/index";

const PrivateRoute = ({ component: TargetComponent, ...rest }: RouteProps) => {
  const isAuthenticated = useAppStore().loginStore.isAuthenticated;
  return (
    <Route
      {...rest}
      render={(props) => {
        return isAuthenticated ? (
          TargetComponent && <TargetComponent {...props} />
        ) : (
          <Redirect
            push={true}
            to={{ pathname: "/login", state: { from: props.location } }}
          />
        );
      }}
    />
  );
};

export default PrivateRoute;
