import { combineReducers, createStore } from 'redux';
import {
  filterReducer,
  userReducer,
} from './reducer';
import {
  IRootState,
} from './types';

const store = createStore<IRootState, any, any, any>(
    combineReducers({
        filter: filterReducer,
        user: userReducer,
    }));

export default store;