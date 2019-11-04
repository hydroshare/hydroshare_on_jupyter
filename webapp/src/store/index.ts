import { combineReducers, createStore } from 'redux';
import {
  demoReducer,
  filterReducer,
  userReducer,
} from './reducer';
import {
  IDemoState,
  IFilterState,
  IUserState,
} from './types';

export interface IRootState {
    demo: IDemoState
    filter: IFilterState
    user: IUserState
}

const store = createStore<IRootState, any, any, any>(
    combineReducers({
        demo: demoReducer,
        filter: filterReducer,
        user: userReducer,
    }));

export default store;