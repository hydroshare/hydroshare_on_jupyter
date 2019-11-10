import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';

<<<<<<< HEAD

import * as ProjectDetailsPageActions from '../store/actions/ProjectDetailsPage';

import FilterBarProjectDetails from '../components/FilterBarProjectDetails';
=======
import FilterBarProjectDetails from '../components/FilterBarProjectDetails';

>>>>>>> search
import FileList from '../components/FileList';

import * as projectDetailsPageActions from '../store/actions/projectDetailsPage';

import {
  AllActionTypes,
  IFileOrFolder,
  IJupyterProject,
  IRootState,
} from '../store/types';

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
<<<<<<< HEAD
    allSelected: projectDetailsPage.allSelected,
    selectedFilesAndFolders: projectDetailsPage.selectedFilesAndFolders,
=======
>>>>>>> search
    searchTerm: projects.searchTerm
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AllActionTypes>) => {
  return {
<<<<<<< HEAD
    toggleSelectedAll: (project: IJupyterProject) => dispatch(ProjectDetailsPageActions.toggleIsSelectedAll(project)),
    toggleSelectedOne: (item: IFileOrFolder, isSelected: boolean) => dispatch(ProjectDetailsPageActions.toggleIsSelectedOne(item)),
=======
>>>>>>> search
    searchProjectBy: (searchTerm: string) => dispatch(projectDetailsPageActions.searchProjectBy(searchTerm))
  }
};

type PropsType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class ProjectDetailsPage extends React.Component<PropsType, never> {

  public handleSearchChange = (event: any) => {
    console.log(event.target.value)
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

    const toggleAllSelected = () => this.props.toggleSelectedAll(this.props.project);

    return (
      <div className="page project-details">
        <FilterBarProjectDetails allSelected={this.props.allSelected}
          toggleAllSelected={toggleAllSelected} searchChange={this.handleSearchChange}/>
        <FileList
          files={this.props.project.files}
          onFileOrFolderSelected={this.props.toggleSelectedOne}
          selectedFilesAndFolders={this.props.selectedFilesAndFolders}
          searchTerm={this.props.searchTerm}
        />
      </div>
    )
  }

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectDetailsPage);
