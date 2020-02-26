import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/css/App.css';

import { ConnectedRouter } from 'connected-react-router';
import {
  Route,
  Switch,
} from 'react-router';
import registerServiceWorker from './registerServiceWorker';
import store, { history } from './store';

import Header from './components/Header';
import MainPage from './pages/MainPage';
import ResourcePage from './pages/ResourcePage';


ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Header />
      <Switch>
        <Route exact={true} path="/">
          <MainPage />
        </Route>
        <Route path="/resources/:resourceId">
          <ResourcePage />
        </Route>
      </Switch>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
