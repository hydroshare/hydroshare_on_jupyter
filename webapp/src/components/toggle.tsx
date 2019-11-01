import * as React from "react";
import { connect } from "react-redux";
import { Component } from 'react'
import { ToggleRowsAction, toggleRows } from "../redux/actions";
import { Dispatch, bindActionCreators } from "redux";

export class Toggle extends Component<{}, ToggleProps> {
    render () {
        return <div>
            <button onClick={toggleRows}>Toggle</button>
        </div>
    };
}

/* const mapStateToProps = (state: AppState) => ({
  messageVisibility: state.showRows
});*/

const mapDispatchToProps = (dispatch: Dispatch<ToggleRowsAction>) =>
  bindActionCreators({ toggleRows }, dispatch);

type ToggleProps = //ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

export default connect(
  // mapStateToProps,
  mapDispatchToProps
)(Toggle);
