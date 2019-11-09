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
  projectsPageReducer,
  mainPageReducer,
  projectsReducer,
  userReducer,
} from './reducer';
import {
  IRootState,
} from './types';

export const history = createBrowserHistory();

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore<IRootState, any, any, any>(
    combineReducers({
        filter: projectsPageReducer,
        mainPage: mainPageReducer,
        projects: projectsReducer,
        router: connectRouter(history),
        user: userReducer,
    }),
    {},
    composeEnhancers(
      applyMiddleware(
        routerMiddleware(history),
      ),
    ),
  );

export default store;
