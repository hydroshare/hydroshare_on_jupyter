import { combineReducers, createStore } from 'redux';
import {
  filterReducer,
  userReducer,
  resourceListReducer,
} from './reducer';
import {
  IRootState,
} from './types';

const store = createStore<IRootState, any, any, any>(
    combineReducers({
        resourceList: resourceListReducer,
        filter: filterReducer,
        user: userReducer,
    }));

export default store;