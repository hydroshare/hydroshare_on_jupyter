import * as React from 'react';
import { Component } from 'react'; // let's also import Component
import { StringLiteral } from '@babel/types';


type Row = {
    name: string;
    status: string;
}
// the clock's state has one field: The current time, based upon the
// JavaScript class Date
type tableState = {
  rows: Row[]
}

// Clock has no properties, but the current state is of type ClockState
// The generic parameters in the Component typing allow to pass props
// and state. Since we don't have props, we pass an empty object.
export default class Table extends Component<{}, tableState> {

  // The tick function sets the current state. TypeScript will let us know
  // which ones we are allowed to set.
  setUpTable() {
    this.setState({
      ...this.state,
      rows: [
        {
        name: 'Resource Foo',
        status: 'Complete',
        }],
    });
  }

  // Before the component mounts, we initialise our state
  componentWillMount() {
    this.setUpTable();
  }


  // render will know everything!
  render() {
    const rows = <div> {this.state.rows.map(element => (
      <p>The resource {element.name} has status {element.status}</p>
    ))}</div>
    return <div>{rows}</div>
  }
}
