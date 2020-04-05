// TODO (Emily): in general i think adding some more comments to these files would be great -
// at a minimum let's make sure we at least have a header comment for each one just saying what the file does
import * as React from 'react';
import ResourceList from '../components/ResourceList';
import { connect } from 'react-redux';
import { ThunkDispatch } from "redux-thunk";

import * as AppActions from '../store/actions/App';
import * as MainPageActions from "../store/actions/MainPage";
import * as resourcePageActions from '../store/actions/ResourcePage';
import {
  IJupyterResource,
  IRootState,
  SortByOptions,
  ICreateResourceRequest,
} from '../store/types';

const mapStateToProps = ({ resources, mainPage }: IRootState) => {
  return {
    allResourcesSelected: mainPage.allResourcesSelected,
    resources: resources.allResources,
    searchTerm: mainPage.searchTerm,
    selectedResources: mainPage.selectedResources,
    sortByTerm: mainPage.sortBy,
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>) => {
  return {
    viewResource: (resource: IJupyterResource) => dispatch(AppActions.viewResource(resource)),
    searchBy: (searchTerm: string) => dispatch(resourcePageActions.searchBy(searchTerm)),
    toggleAllResourcesSelected: () => dispatch(MainPageActions.toggleAllResourcesSelected()),
    toggleSingleResourceSelected: (r: IJupyterResource) => dispatch(MainPageActions.toggleSingleResourceSelected(r)),
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
          allResourcesSelected={this.props.allResourcesSelected}
          className="tile"
          newResource={this.props.newResource}
          viewResource={this.handleViewResource}
          resources={this.props.resources}
          searchTerm={this.props.searchTerm}
          selectedResources={this.props.selectedResources}
          sortByTerm={this.props.sortByTerm}
          toggleAllResourcesSelected={this.props.toggleAllResourcesSelected}
          toggleSingleResourceSelected={this.props.toggleSingleResourceSelected}
        />
      </div>
    )
  }

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainPage);
