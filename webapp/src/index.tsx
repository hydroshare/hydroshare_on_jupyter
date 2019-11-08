import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './styles/App.css';

import registerServiceWorker from './registerServiceWorker';
import store, { history } from './store';

import Header from './components/Header';
import FilterBar from './components/FilterBar';
import ResourceList from './components/ResourceList';
import FileList from './components/FileList';
import {ConnectedRouter} from 'connected-react-router';
import {Route} from 'react-router';


ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      {/*<Switch>*/}
        <Route path="/">
          <Header />
        </Route>
        <Route path="/">
        <FilterBar />
        </Route>
        <Route exact={true} path="/">
          <ResourceList />
        </Route>
        <Route path="/">
          <FileList />
        </Route>
      {/*</Switch>*/}
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
