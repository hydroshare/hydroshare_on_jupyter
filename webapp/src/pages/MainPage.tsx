// TODO (Emily): in general i think adding some more comments to these files would be great -
// at a minimum let's make sure we at least have a header comment for each one just saying what the file does
import * as React from 'react';
import ResourceList from '../components/ResourceList';
import { connect } from 'react-redux';
import { ThunkDispatch } from "redux-thunk";

import * as AppActions from '../store/actions/App';
import * as resourcePageActions from '../store/actions/ResourcePage';
import {
  IJupyterResource,
  IRootState,
  ICreateResourceRequest,
} from '../store/types';

const mapStateToProps = ({ resources }: IRootState) => {
  return {
    resources: resources.allResources,
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>) => {
  return {
    viewResource: (resource: IJupyterResource) => dispatch(AppActions.viewResource(resource)),
    newResource: (newResource: ICreateResourceRequest) => dispatch(resourcePageActions.createNewResource(newResource))
  }
};

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class MainPage extends React.Component<ReduxType, never>  {

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
        />
      </div>
    )
  }

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainPage);
