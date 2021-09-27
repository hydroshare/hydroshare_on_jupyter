import React from "react";
import { Route, RouteProps } from "react-router-dom";
import { useAppSelector } from "./store/hooks";

export const AppRoute: React.FC<RouteProps> = (props) => {
  // holds user login state
  const loginState = useAppSelector(({ login }) => login.status);

  return loginState ? <Route {...props} /> : null;
};
