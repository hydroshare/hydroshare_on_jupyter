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
  projectDetailsPageReducer,
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
        projectPage: projectsPageReducer,
        mainPage: mainPageReducer,
        projects: projectDetailsPageReducer,
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
