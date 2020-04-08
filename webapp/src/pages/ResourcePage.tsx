import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from "redux-thunk";
import { push } from 'connected-react-router';

import '../styles/ResourcePage.scss';

import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import FileManager from "../components/FileManager";
import NewFileModal from "../components/NewFileModal";
import ResourceMetadata from '../components/ResourceMetadata';

import * as resourcePageActions from '../store/actions/ResourcePage';
import * as resourcesActions from '../store/actions/resources';
import {
  createNewFile,
  copyFileOrFolder,
  deleteResourceFilesOrFolders,
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
    createNewFile: (resource: IJupyterResource, filename: string) => dispatch(createNewFile(resource, filename)),
    deleteResourceFilesOrFolders: (resource: IJupyterResource, paths: string[]) => dispatch(deleteResourceFilesOrFolders(resource, paths)),
    getFilesIfNeeded: (resource: IJupyterResource) => dispatch(resourcesActions.getFilesIfNeeded(resource)),
    openFile: (resource: IJupyterResource, file: IFile | IFolder) => dispatch(resourcePageActions.openFileInJupyterHub(resource, file)),
    copyFileOrFolder: (resource: IJupyterResource, file: IFile, destination: IFolder) => dispatch(copyFileOrFolder(resource, file, destination)),
    moveFileOrFolder: (resource: IJupyterResource, file: IFile, destination: IFolder) => dispatch(moveFileOrFolder(resource, file, destination)),
    goBackToResources: () => dispatch(push('/')),
  }
};

type PropsType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

type StateType = {
  filesOrFoldersToConfirmDeleting: string[] | undefined
  modal: MODAL_TYPES,
};

class ResourcePage extends React.Component<PropsType, StateType> {

  state: StateType = {
    filesOrFoldersToConfirmDeleting: undefined,
    modal: MODAL_TYPES.NONE,
  };

  displayModal = (type: MODAL_TYPES) => this.setState({modal: type});

  displayDeleteConfirmationModal = (paths: string[]) => this.setState({
    modal: MODAL_TYPES.DELETE,
    filesOrFoldersToConfirmDeleting: paths,
  });

  doDeleteSelectedFiles = () => {
    this.props.deleteResourceFilesOrFolders(this.props.resource!, this.state.filesOrFoldersToConfirmDeleting!);
    this.setState({
      filesOrFoldersToConfirmDeleting: undefined,
      modal: MODAL_TYPES.NONE,
    });
  };

  hideModal = () => this.setState({modal: MODAL_TYPES.NONE});

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

    const createNewFile = (filename: string) => {
      this.props.createNewFile(resource, filename);
      this.setState({modal: MODAL_TYPES.NONE});
    };

    const openFile = (file: IFile) => this.props.openFile(resource, file);

    let modal;

    switch (this.state.modal) {
      case MODAL_TYPES.NEW:
        modal = <NewFileModal close={this.hideModal} submit={createNewFile}/>;
        break;
      case MODAL_TYPES.DELETE:
        modal = <DeleteConfirmationModal
          close={this.hideModal}
          submit={this.doDeleteSelectedFiles}
          paths={this.state.filesOrFoldersToConfirmDeleting!}
        />;
        break;
    }

    return (
      <div className="page resource-details">
        <ResourceMetadata resource={resource} />
        <FileManager
          hydroShareResourceRootDir={resource.hydroShareResource.files}
          jupyterHubResourceRootDir={resource.jupyterHubFiles}
          openFile={openFile}
          copyFileOrFolder={copyFileOrFolder}
          moveFileOrFolder={moveFileOrFolder}
          promptCreateNewFileOrFolder={() => this.displayModal(MODAL_TYPES.NEW)}
          promptDeleteFilesOrFolders={this.displayDeleteConfirmationModal}
          resourceId={resource.id}
        />
        {modal}
      </div>
    )
  }

}

enum MODAL_TYPES {
  NONE,
  NEW,
  DELETE,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourcePage);
