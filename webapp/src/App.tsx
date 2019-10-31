
import * as React from 'react';
import './styles/App.scss';
import Table from './components/table';

export type initState = {
    hello: string;
}

function App() {
    return (
      <div className="App">
        <h1>Put something cool here!</h1>
        <Table></Table>
      </div>
    );
  }
  
  export default App;