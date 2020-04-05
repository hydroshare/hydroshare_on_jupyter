// TODO (Emily): in general i think adding some more comments to these files would be great -
// at a minimum let's make sure we at least have a header comment for each one just saying what the file does
import * as React from 'react';
import ResourceList from '../components/ResourceList';
import { connect } from 'react-redux';
import {
  AnyAction,
  Dispatch,
} from 'redux';

import * as AppActions from '../store/actions/App';
import * as resourcePageActions from '../store/actions/ResourcePage';
import {
  IJupyterResource,
  IRootState,
  SortByOptions,
  ICreateResourceRequest,
} from '../store/types';

const mapStateToProps = ({ resources, mainPage }: IRootState) => {
  return {
    resources: resources.allResources,
    searchTerm: mainPage.searchTerm,
    sortByTerm: mainPage.sortBy,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  return {
    viewResource: (resource: IJupyterResource) => dispatch(AppActions.viewResource(resource)),
    searchBy: (searchTerm: string) => dispatch(resourcePageActions.searchBy(searchTerm)),
    sortBy: (sortByTerm: SortByOptions) => dispatch(resourcePageActions.sortBy(sortByTerm)),
    newResource: (newResource: ICreateResourceRequest) => dispatch(resourcePageActions.createNewResource(newResource))
  }
};

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class MainPage extends React.Component<ReduxType, never>  {

  public handleSearchChange = (event: any) => {
    this.props.searchBy(event.target.value)
  };


  public handleViewResource = (resource: IJupyterResource) => {
    this.props.viewResource(resource);
  };

  public render() {
    return (
      <div className="page resources">
        <ResourceList
          className="tile"
          newResource={this.props.newResource}
          viewResource={this.handleViewResource}
          resources={this.props.resources}
          searchTerm={this.props.searchTerm}
          sortByTerm={this.props.sortByTerm}
        />
      </div>
    )
  }

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainPage);
