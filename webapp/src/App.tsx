
import * as React from 'react';
import './styles/App.scss';
import Table from './components/table';
import { createStore } from "redux";
import { initialState, rootReducer } from "./redux/reducers";

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