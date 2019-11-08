import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import * as FilterBarActions from '../store/actions/FilterBar';

import FilterBar from '../components/FilterBar';
import FileList from '../components/FileList';

import {
  AllActionTypes,
  IRootState,
} from '../store/types';

const mapStateToProps = ({ }: IRootState) => ({

});

const mapDispatchToProps = (dispatch: Dispatch<AllActionTypes>) => {
  return {
    selectAll: () => dispatch(FilterBarActions.selectAll())
  }
};

type PropsType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class ProjectDetailsPage extends React.Component<PropsType, never> {

  public render() {
    return (
      <div className="page project-details">
        <FilterBar />
        <FileList />
      </div>
    )
  }

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectDetailsPage);
