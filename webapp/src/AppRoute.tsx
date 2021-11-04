import React from "react";
import { Route, RouteProps } from "react-router-dom";
import { useAppSelector } from "./store/hooks";

export const AppRoute: React.FC<RouteProps> = (props) => {
  // holds user login state
  const loginState = useAppSelector(({ login }) => login.status);
  const { children, ...rest } = props;

  return loginState ? <Route {...rest}>{children}</Route> : null;
};
