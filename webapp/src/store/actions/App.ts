import { push } from "connected-react-router";
import { AnyAction } from "redux";
import { ThunkAction, ThunkDispatch } from "redux-thunk";

import { getResources, getUserInfo, viewUserProfile } from "../async-actions";
import { IResource } from "../types";

// @ts-ignore
const URL_PREFIX = window.FRONTEND_URL || "";

export function loadInitData(): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    dispatch(getResources());
    dispatch(getUserInfo());
  };
}

export function displayUserProfile(): ThunkAction<
  Promise<void>,
  {},
  {},
  AnyAction
> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    dispatch(viewUserProfile());
  };
}

export function viewResource(resource: IResource) {
  // Just reroute using react-router-dom
  return push(URL_PREFIX + "/resources/" + resource.id);
}

export function goHome() {
  // Just reroute using react-router-dom
  return push(URL_PREFIX + "/");
}
