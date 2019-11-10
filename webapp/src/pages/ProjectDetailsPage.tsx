import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';


import * as ProjectDetailsPageActions from '../store/actions/ProjectDetailsPage';

import FilterBar from '../components/FilterBar';
import FileList from '../components/FileList';

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
    allSelected: projectDetailsPage.allSelected,
    selectedFilesAndFolders: projectDetailsPage.selectedFilesAndFolders,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AllActionTypes>) => {
  return {
    toggleSelectedAll: (project: IJupyterProject) => dispatch(ProjectDetailsPageActions.toggleIsSelectedAll(project)),
    toggleSelectedOne: (item: IFileOrFolder, isSelected: boolean) => dispatch(ProjectDetailsPageActions.toggleIsSelectedOne(item)),
  }
};

type PropsType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class ProjectDetailsPage extends React.Component<PropsType, never> {

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
        <FilterBar
          allSelected={this.props.allSelected}
          toggleAllSelected={toggleAllSelected}
        />
        <FileList
          files={this.props.project.files}
          onFileOrFolderSelected={this.props.toggleSelectedOne}
          selectedFilesAndFolders={this.props.selectedFilesAndFolders}
        />
      </div>
    )
  }

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectDetailsPage);
