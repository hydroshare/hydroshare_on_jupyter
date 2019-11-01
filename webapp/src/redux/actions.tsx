/* This file contains all of the Redux actions. */


// const API_URL = window.WEBSOCKET_SERVER_URL;

import { ActionTypes, BaseAction } from "./reducers";

export interface ToggleRowsAction extends BaseAction {
  type: ActionTypes.TOGGLE_ROWS;
}

export function toggleRows(): ToggleRowsAction {
  console.log("button pressed")
  return {
    type: ActionTypes.TOGGLE_ROWS
  };
}
