import { createReducer } from "@reduxjs/toolkit";

import * as actions from "./actions";
import { AuthState, ResourceState } from "./sync-api/types";

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
