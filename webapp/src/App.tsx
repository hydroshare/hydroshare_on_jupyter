import * as React from 'react';

import FileList from './components/FileList';
import FilterBar from './components/FilterBar';
import Header from './components/Header';

export default class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <Header />
        <FilterBar />
        <FileList />
      </div>
    );
  }
}
