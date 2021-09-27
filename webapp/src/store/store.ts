import { configureStore } from "@reduxjs/toolkit";
import { fsStateReducer, loginStateReducer } from "./reducers";
import { syncApi } from "./sync-api";

const reducers = {
  // value: valueReducer,
  login: loginStateReducer,
  fsState: fsStateReducer,
  [syncApi.reducerPath]: syncApi.reducer,
  // [jupyterApi.reducerPath]: jupyterApi.reducer,
};

const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(syncApi.middleware);
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
