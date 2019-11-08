import {
  connectRouter, routerMiddleware,
} from 'connected-react-router';
import {
  createBrowserHistory,
} from 'history';
import {
  applyMiddleware,
  compose,
  combineReducers,
  createStore,
} from 'redux';

import {
  filterReducer,
  mainPageReducer,
  projectsReducer,
  userReducer,
} from './reducer';
import {
  IRootState,
} from './types';

export const history = createBrowserHistory();

const store = createStore<IRootState, any, any, any>(
    combineReducers({
        filter: filterReducer,
        mainPage: mainPageReducer,
        projects: projectsReducer,
        router: connectRouter(history),
        user: userReducer,
    }),
    {},
    compose(
      applyMiddleware(
        routerMiddleware(history),
      ),
    ),
  );

export default store;
