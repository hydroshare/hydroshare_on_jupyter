import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

import '../styles/css/ProjectDetailsPage.css';

import * as ProjectDetailsPageActions from '../store/actions/ProjectDetailsPage';

import FilterBarProjectDetails from '../components/FilterBarProjectDetails';
import FileList from '../components/FileList';

import * as projectDetailsPageActions from '../store/actions/ProjectDetailsPage';

import {
  IFileOrFolder,
  IJupyterProject,
  IRootState,
  SortByOptions,
} from '../store/types';
import ProjectInfo from '../components/ProjectInfo';
import { ThunkDispatch } from "redux-thunk";

// @ts-ignore the "error" that router does not exist on IRootState
const mapStateToProps = ({ projects, projectDetailsPage, router }: IRootState) => {
  // Extract the project ID from the URL
  const regexMatch = router.location.pathname.split('/').pop().match(/^\w+/);
  let projectId;
  if (regexMatch) {
    projectId = regexMatch.pop();
  }
  return {
    project: projects.allProjects[projectId],
    allJupyterSelected: projectDetailsPage.allJupyterSelected,
    allHydroShareSelected: projectDetailsPage.allHydroShareSelected,
    selectedLocalFilesAndFolders: projectDetailsPage.selectedLocalFilesAndFolders,
    selectedHydroShareFilesAndFolders: projectDetailsPage.selectedHydroShareFilesAndFolders,
    searchTerm: projectDetailsPage.searchTerm,
    sortByTerm: projectDetailsPage.sortBy
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>) => {
  return {
    getFilesIfNeeded: (project: IJupyterProject) => dispatch(ProjectDetailsPageActions.getFilesIfNeeded(project)),
    toggleSelectedAllLocal: (project: IJupyterProject) => dispatch(ProjectDetailsPageActions.toggleIsSelectedAllLocal(project)),
    toggleSelectedAllHydroShare: (project: IJupyterProject) => dispatch(ProjectDetailsPageActions.toggleIsSelectedAllHydroShare(project)),
    toggleSelectedOneLocal: (item: IFileOrFolder, isSelected: boolean) => dispatch(ProjectDetailsPageActions.toggleIsSelectedOneLocal(item)),
    toggleSelectedOneHydroShare: (item: IFileOrFolder, isSelected: boolean) => dispatch(ProjectDetailsPageActions.toggleIsSelectedOneHydroShare(item)),
    searchProjectBy: (searchTerm: string) => dispatch(projectDetailsPageActions.searchProjectBy(searchTerm)),
    sortBy: (sortByTerm: SortByOptions) => dispatch(projectDetailsPageActions.sortBy(sortByTerm)),
    goBackToProjects: () => dispatch(push('/')),
  }
};

type PropsType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class ProjectDetailsPage extends React.Component<PropsType, never> {

  public componentDidMount = (): void => {
    this.props.getFilesIfNeeded(this.props.project);
  };

  public handleSearchChange = (event: any) => {
    this.props.searchProjectBy(event.target.value)
  }

  public render() {
    if (!this.props.project) {
      return (
        <div className="page project-details">
          <div className="no-project">
            <h1>No project found</h1>
            <p>You do not have a project with the ID specified.</p>
          </div>
        </div>
      );
    }

    const toggleAllLocalSelected = () => this.props.toggleSelectedAllLocal(this.props.project);
    const toggleAllHydroShareSelected = () => this.props.toggleSelectedAllHydroShare(this.props.project);

    const {
      hydroShareResource,
    } = this.props.project;
    const hydroShareFiles = hydroShareResource ? (
        <FileList
            allSelected={this.props.allHydroShareSelected}
            files={hydroShareResource.files}
            onFileOrFolderSelected={this.props.toggleSelectedOneHydroShare}
            selectedFilesAndFolders={this.props.selectedHydroShareFilesAndFolders}
            searchTerm={this.props.searchTerm}
            sortBy={this.props.sortByTerm}
            toggleAllSelected={toggleAllHydroShareSelected}
            hydroShare={true}
        />
    ) : null;

    const fileListContainerClasses = 'file-lists ' + (hydroShareResource ? 'split' : 'single');

    return (
      <div className="page project-details">
        <a className="go-back" onClick={this.props.goBackToProjects}>&lt; Back to projects</a>
        <ProjectInfo project={this.props.project} />
        <FilterBarProjectDetails allSelected={this.props.allJupyterSelected}
          toggleAllSelected={toggleAllLocalSelected} searchChange={this.handleSearchChange} sortBy={this.props.sortBy}/>
        <div className={fileListContainerClasses}>
          <FileList
            allSelected={this.props.allJupyterSelected}
            toggleAllSelected={toggleAllLocalSelected}
            files={this.props.project.files}
            onFileOrFolderSelected={this.props.toggleSelectedOneLocal}
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
)(ProjectDetailsPage);
