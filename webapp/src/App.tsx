import * as React from 'react';

import FilterBar from './components/FilterBar';
import Header from './components/Header';
import ResourceList from './components/ResourceList';

export default class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <Header />
        <FilterBar />
        <ResourceList />
      </div>
    );
  }
}
