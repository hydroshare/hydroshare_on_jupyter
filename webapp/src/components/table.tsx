import * as React from 'react';
import { Component } from 'react'; // let's also import Component
import { connect } from "react-redux";
import Toggle from './toggle';
import TableState from '../redux/reducers';
import { ToggleRowsAction, toggleRows } from "../redux/actions";
import { Dispatch, bindActionCreators } from "redux";

type Row = {
    name: string;
    status: string;
}

type tableState = {
  rows: Row[]
}

const mapStateToProps = (state: TableState) => ({
  showRows: state.showRows
});

const mapDispatchToProps = (dispatch: Dispatch<ToggleRowsAction>) =>
  bindActionCreators({ toggleRows }, dispatch);

type tableProps = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;


export class Table extends Component<tableProps, tableState> {

  constructor(props: any){    
    super(props);    
    this.state = { rows: [
      {
      name: 'Resource Foo',
      status: 'Complete',
      }],
    };
  }

  // render will know everything!
  render() {
    const rows = <div> {this.state.rows.map(element => (
      <p>The resource {element.name} has status {element.status}</p>
    ))}</div>
    return <div>
      <Toggle />
      {rows}
      {this.props.showRows && rows}</div>
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Table);