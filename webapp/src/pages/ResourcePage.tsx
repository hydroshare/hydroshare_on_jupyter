import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from "redux-thunk";
import { push } from 'connected-react-router';

import '../styles/ResourcePage.scss';

import FileManager from "../components/FileManager";
import ResourceMetadata from '../components/ResourceMetadata';

import * as resourcePageActions from '../store/actions/ResourcePage';
import * as resourcesActions from '../store/actions/resources';
import {
  copyFileOrFolder,
  moveFileOrFolder,
} from '../store/async-actions';
import {
  IFile,
  IFolder,
  IJupyterResource,
  IRootState,
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
    getFilesIfNeeded: (resource: IJupyterResource) => dispatch(resourcesActions.getFilesIfNeeded(resource)),
    openFile: (resource: IJupyterResource, file: IFile | IFolder) => dispatch(resourcePageActions.openFileInJupyterHub(resource, file)),
    copyFileOrFolder: (resource: IJupyterResource, file: IFile, destination: IFolder) => dispatch(copyFileOrFolder(resource, file, destination)),
    moveFileOrFolder: (resource: IJupyterResource, file: IFile, destination: IFolder) => dispatch(moveFileOrFolder(resource, file, destination)),
    goBackToResources: () => dispatch(push('/')),
  }
};

type PropsType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class ResourcePage extends React.Component<PropsType, never> {

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

    this.props.getFilesIfNeeded(resource);

    // const toggleAllLocalSelected = () => this.props.toggleSelectedAllLocal(resource!);
    // const toggleAllHydroShareSelected = () => this.props.toggleSelectedAllHydroShare(resource!);

    const copyFileOrFolder = (f: IFile | IFolder, dest: IFolder) => {
      this.props.copyFileOrFolder(resource, f, dest);
    };

    const moveFileOrFolder = (f: IFile | IFolder, dest: IFolder) => {
      this.props.moveFileOrFolder(resource, f, dest);
    };

    const openFile = (file: IFile) => this.props.openFile(resource, file);

    return (
      <div className="page resource-details">
        {/*<a className="go-back" onClick={this.props.goBackToResources}>&lt; Back to resources</a>*/}
        <ResourceMetadata resource={resource} />
        <FileManager
          hydroShareResourceRootDir={resource.hydroShareResource.files}
          jupyterHubResourceRootDir={resource.jupyterHubFiles}
          openFile={openFile}
          copyFileOrFolder={copyFileOrFolder}
          moveFileOrFolder={moveFileOrFolder}
        />
      </div>
    )
  }

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourcePage);
