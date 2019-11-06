import { combineReducers, createStore } from 'redux';

import {
  filterReducer,
  mainPageReducer,
  projectsReducer,
  userReducer,
} from './reducer';
import {
  IRootState,
} from './types';

const store = createStore<IRootState, any, any, any>(
    combineReducers({
        filter: filterReducer,
        mainPage: mainPageReducer,
        projects: projectsReducer,
        user: userReducer,
    }));

export default store;
