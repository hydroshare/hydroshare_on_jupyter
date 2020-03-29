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
import thunk from 'redux-thunk';

import {
  mainPageReducer,
  notificationsReducer,
  resourcesReducer,
  resourcePageReducer,
  userDataReducer,
} from './reducer';
import {
  IRootState,
} from './types';

export const history = createBrowserHistory();

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore<IRootState, any, any, any>(
    combineReducers({
        mainPage: mainPageReducer,
        notifications: notificationsReducer,
        resources: resourcesReducer,
        resourcePage: resourcePageReducer,
        router: connectRouter(history),
        user: userDataReducer,
    }),
    undefined,
    composeEnhancers(
      applyMiddleware(
        routerMiddleware(history),
          thunk,
      ),
    ),
  );

export default store;
