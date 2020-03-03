import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from "redux-thunk";
import { push } from 'connected-react-router';

import '../styles/ResourcePage.scss';

import FileManager from "../components/FileManager";
import ResourceMetadataDisplay from '../components/ResourceMetadataDisplay';

import * as resourcePageActions from '../store/actions/ResourcePage';
import {
  transferFromJupyterHubToHydroShare,
} from '../store/async-actions';
import {
  IFile,
  IFolder,
  IJupyterResource,
  IRootState,
  SortByOptions,
} from '../store/types';

const mapStateToProps = ({ resources, resourcePage, router }: IRootState) => {
  // Extract the resource ID from the URL
  // @ts-ignore object possibly undefined
  const regexMatch = router.location.pathname.split('/').pop().match(/^\w+/);
  let resourceForPage;
  if (regexMatch) {
    const resourceId = regexMatch.pop();
    if (resourceId) {
      resourceForPage = resources.allResources[resourceId]
    } else {
      return;
    }
  }
  return {
    resource: resourceForPage,
    allJupyterSelected: resourcePage.allJupyterSelected,
    allHydroShareSelected: resourcePage.allHydroShareSelected,
    selectedLocalFilesAndFolders: resourcePage.selectedLocalFilesAndFolders,
    selectedHydroShareFilesAndFolders: resourcePage.selectedHydroShareFilesAndFolders,
    searchTerm: resourcePage.searchTerm,
    sortByTerm: resourcePage.sortBy
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>) => {
  return {
    getFilesIfNeeded: (resource: IJupyterResource) => dispatch(resourcePageActions.getFilesIfNeeded(resource)),
    toggleSelectedAllLocal: (resource: IJupyterResource) => dispatch(resourcePageActions.toggleIsSelectedAllLocal(resource)),
    toggleSelectedAllHydroShare: (resource: IJupyterResource) => dispatch(resourcePageActions.toggleIsSelectedAllHydroShare(resource)),
    toggleSelectedOneLocal: (item: IFile | IFolder, isSelected: boolean) => dispatch(resourcePageActions.toggleIsSelectedOneLocal(item)),
    openFile: (resource: IJupyterResource, file: IFile | IFolder) => dispatch(resourcePageActions.openFileInJupyterHub(resource, file)),
    toggleSelectedOneHydroShare: (item: IFile | IFolder, isSelected: boolean) => dispatch(resourcePageActions.toggleIsSelectedOneHydroShare(item)),
    transferFileFromJupyterHubToHydroShare: (resource: IJupyterResource, file: IFile, destination: IFolder) => dispatch(transferFromJupyterHubToHydroShare(resource, file, destination)),
    searchResourceBy: (searchTerm: string) => dispatch(resourcePageActions.searchResourceBy(searchTerm)),
    sortBy: (sortByTerm: SortByOptions) => dispatch(resourcePageActions.sortBy(sortByTerm)),
    goBackToResources: () => dispatch(push('/')),
  }
};

type PropsType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class ResourcePage extends React.Component<PropsType, never> {

  public componentDidMount = (): void => {
    if (this.props.resource) {
      this.props.getFilesIfNeeded(this.props.resource);
    }
  };

  public handleSearchChange = (event: any) => {
    this.props.searchResourceBy(event.target.value)
  }

  public render() {
    const {
      resource,
    } = this.props;

    if (!resource) {
      return (
        <div className="page resource-details">
          <div className="no-resource">
            <h1>No resource found</h1>
            <p>You do not have a resource with the ID specified.</p>
          </div>
        </div>
      );
    }

    // const toggleAllLocalSelected = () => this.props.toggleSelectedAllLocal(resource!);
    // const toggleAllHydroShareSelected = () => this.props.toggleSelectedAllHydroShare(resource!);

    const transferFileFromJupyterHubToHydroShare = (f: IFile | IFolder, dest: IFolder) => {
      this.props.transferFileFromJupyterHubToHydroShare(resource, f, dest);
    };

    return (
      <div className="page resource-details">
        {/*<a className="go-back" onClick={this.props.goBackToResources}>&lt; Back to resources</a>*/}
        <ResourceMetadataDisplay resource={resource} />
        <FileManager
          hydroShareResourceRootDir={resource.hydroShareResource.files}
          jupyterHubResourceRootDir={resource.jupyterHubFiles}
          transferFileFromJupyterHubToHydroShare={transferFileFromJupyterHubToHydroShare}
        />
      </div>
    )
  }

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourcePage);
