import * as React from 'react';
import { connect } from 'react-redux';
import { IRootState } from '../store';

import { Dispatch } from 'redux';
import * as actions from '../store/redux/actions';
import { FilterActions } from '../store/redux/types';

import {Button} from 'react-bootstrap';

import '../styles/FilterBar.css';

const mapStateToProps = ({ filter }: IRootState) => {
  const { selectAll, sortBy } = filter;
  return { selectAll, sortBy };
}

const mapDispatcherToProps = (dispatch: Dispatch<FilterActions>) => {
  return {
    selectAll: () => dispatch(actions.selectAll())
  }
}

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;

interface IState {
  inputText: string
}

class FilterBar extends React.Component<ReduxType, IState> {
  public state: IState = {
    inputText: ''
  }

  /*public onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({inputText: e.target.value});
  }

  public onAddClick = () => {
    this.props.addItem(this.state.inputText);
    this.setState({inputText: ''});
  }*/

  public render() {
    // const { selectAll, sortBy } = this.props;

    return (
      <div className='filterParent'>
          <Button>Delete</Button>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatcherToProps)(FilterBar);
