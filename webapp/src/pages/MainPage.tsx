
import * as React from 'react';
import ResourceList from '../components/ResourceList';
import { connect } from 'react-redux';
import { ThunkDispatch } from "redux-thunk";

import * as AppActions from '../store/actions/App';
import {
  createNewResource,
  deleteResources,
} from '../store/async-actions';
import {
  IResource,
  IRootState,
  ICreateResourceRequest,
} from '../store/types';
import SelectDirModal from '../components/modals/SelectDirModal';

const mapStateToProps = ({ resources, user }: IRootState) => {
  return {
    attemptingLogin: user.attemptingLogin,
    authenticationFailed: user.authenticationFailed,
    resources: resources.allResources,
    fetchingResources: resources.fetchingResources,
    checkingFile: user.checkingFile
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>) => {
  return {
    deleteResources: (resources: IResource[]) => dispatch(deleteResources(resources, false)),
    deleteResourcesLocally: (resources: IResource[]) => dispatch(deleteResources(resources, true)),
    viewResource: (resource: IResource) => dispatch(AppActions.viewResource(resource)),
    createResource: (newResource: ICreateResourceRequest) => dispatch(createNewResource(newResource))
  }
};

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

/**
 * Component that puts together the main page where all of the user's resources are displayed
 */
class MainPage extends React.Component<ReduxType, never>  {

  public handleViewResource = (resource: IResource) => {
    this.props.viewResource(resource);
  };

  public render() {
    return (
      <div className="page resources">
        <ResourceList
          className="tile"
          deleteResources={this.props.deleteResources}
          deleteResourcesLocally={this.props.deleteResourcesLocally}
          fetchingResources={this.props.fetchingResources}
          createResource={this.props.createResource}
          viewResource={this.handleViewResource}
          resources={this.props.resources}
        />
        {!this.props.attemptingLogin && !this.props.authenticationFailed && !this.props.checkingFile && <SelectDirModal/> }
      </div>
    )
  }

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainPage);
//