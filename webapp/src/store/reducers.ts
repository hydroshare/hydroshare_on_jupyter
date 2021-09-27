import { createReducer } from "@reduxjs/toolkit";

import * as actions from "./actions";

export type AuthState = {
  status: boolean;
};

export type ResourceId = string;

export type FSState = {
  resource_id: ResourceId;
  only_local: string[];
  only_remote: string[];
  out_of_sync: string[];
  in_sync: string[];
};

export type ResourceState = {
  [Property in keyof ResourceId]?: FSState;
};

const initialLoginState: AuthState = {
  status: false,
};

const initialFSSyncState: ResourceState = {};

export const loginStateReducer = createReducer(initialLoginState, (builder) => {
  builder.addCase(actions.login, (state) => {
    state.status = true;
  });
  builder.addCase(actions.logout, (state) => {
    state.status = false;
  });
});

export const fsStateReducer = createReducer(initialFSSyncState, (builder) => {
  builder.addCase(actions.resourceUpdate, (state, { payload }) => {
    // assumes that resource id's in payload are unique
    const processed_payload = payload.map((res) => [res.resource_id, res]);
    return Object.fromEntries(processed_payload);
  });
  builder.addCase(actions.fsUpdate, (state, { payload }) => ({
    ...state,
    [payload.resource_id]: payload,
  }));
});
