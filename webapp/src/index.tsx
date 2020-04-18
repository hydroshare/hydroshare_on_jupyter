import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import './styles/App.scss';

import { ConnectedRouter } from 'connected-react-router';
import {
  Route,
  Switch,
} from 'react-router';
import store, { history } from './store';

import Header from './components/Header';
import MainPage from './pages/MainPage';
import NotificationBanner from "./components/NotificationBanner";
import ResourcePage from './pages/ResourcePage';

// @ts-ignore
const URL_PREFIX = window.FRONTEND_URL || '';

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Header />
      <NotificationBanner/>
      <Switch>
        <Route exact={true} path={`${URL_PREFIX}/`}>
          <MainPage />
        </Route>
        <Route path={`${URL_PREFIX}/resources/:resourceId`}>
          <ResourcePage />
        </Route>
      </Switch>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root') as HTMLElement
);
