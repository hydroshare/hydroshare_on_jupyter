import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from "redux-thunk";
import { push } from 'connected-react-router';

import '../styles/css/ResourcePage.css';

import FilterBarResource from '../components/FilterBarResource';
import FileList from '../components/FileList';

import * as resourcePageActions from '../store/actions/ResourcePage';
import {
  IFileOrFolder,
  IJupyterResource,
  IRootState,
  SortByOptions,
} from '../store/types';
import ResourceMetadataDisplay from '../components/ResourceMetadataDisplay';

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
    toggleSelectedOneLocal: (item: IFileOrFolder, isSelected: boolean) => dispatch(resourcePageActions.toggleIsSelectedOneLocal(item)),
    openFile: (resource: IJupyterResource, file: IFileOrFolder) => dispatch(resourcePageActions.openFileInJupyterHub(resource, file)),
    toggleSelectedOneHydroShare: (item: IFileOrFolder, isSelected: boolean) => dispatch(resourcePageActions.toggleIsSelectedOneHydroShare(item)),
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
    if (!this.props.resource) {
      return (
        <div className="page resource-details">
          <div className="no-resource">
            <h1>No resource found</h1>
            <p>You do not have a resource with the ID specified.</p>
          </div>
        </div>
      );
    }

    const toggleAllLocalSelected = () => this.props.toggleSelectedAllLocal(this.props.resource!);
    const toggleAllHydroShareSelected = () => this.props.toggleSelectedAllHydroShare(this.props.resource!);
    

    const {
      hydroShareResource,
    } = this.props.resource;
    const openFile = (file: IFileOrFolder) => this.props.openFile(this.props.resource!, file);
    const hydroShareFiles = hydroShareResource ? (
        <FileList
            allSelected={this.props.allHydroShareSelected}
            files={hydroShareResource.files}
            selectedFilesAndFolders={this.props.selectedHydroShareFilesAndFolders}
            searchTerm={this.props.searchTerm}
            sortBy={this.props.sortByTerm}
            toggleAllSelected={toggleAllHydroShareSelected}
            hydroShare={true}
        />
    ) : null;

    const fileListContainerClasses = 'file-lists ' + (hydroShareResource ? 'split' : 'single');

    return (
      <div className="page resource-details">
        {/*<a className="go-back" onClick={this.props.goBackToResources}>&lt; Back to resources</a>*/}
        <ResourceMetadataDisplay resource={this.props.resource} />
        <FilterBarResource allSelected={this.props.allJupyterSelected}
                           toggleAllSelected={toggleAllLocalSelected} searchChange={this.handleSearchChange} sortBy={this.props.sortBy}/>
        <div className={fileListContainerClasses}>
          <FileList
            allSelected={this.props.allJupyterSelected}
            toggleAllSelected={toggleAllLocalSelected}
            files={this.props.resource.files}
            onFileOrFolderSelected={openFile}
            selectedFilesAndFolders={this.props.selectedLocalFilesAndFolders}
            sortBy={this.props.sortByTerm}
            searchTerm={this.props.searchTerm}
            hydroShare={false}
          />
          {hydroShareFiles}
        </div>
      </div>
    )
  }

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourcePage);
