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
  projectsPageReducer,
  mainPageReducer,
  projectsReducer,
  projectsDetailsPageReducer,
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
        projects: projectsReducer,
        projectDetailsPage: projectsDetailsPageReducer,
        router: connectRouter(history),
        user: userReducer,
    }),
    {},
    composeEnhancers(
      applyMiddleware(
        routerMiddleware(history),
          thunk,
      ),
    ),
  );

export default store;
