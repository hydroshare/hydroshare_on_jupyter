import { createAction } from "@reduxjs/toolkit";
import { FSState } from "./reducers";

export const login = createAction<undefined>("LOGIN");
export const logout = createAction<undefined>("LOGOUT");

export const resourceUpdate = createAction<FSState[]>("RESOURCE_UPDATE");
export const fsUpdate = createAction<FSState>("FS_UPDATE");

// TODO: delete below. Leaving for example sake
export const incrementer = createAction<undefined>("INCREMENT");
export const decrementer = createAction<undefined>("DECREMENT");
export const incrementByAmount = createAction<number>("INCREMENT_BY_AMOUNT");
