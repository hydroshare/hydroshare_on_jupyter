import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom'

import * as ProjectDetailsPageActions from '../store/actions/ProjectDetailsPage';

import FilterBar from '../components/FilterBar';
import FileList from '../components/FileList';

import {
  AllActionTypes, IFileOrFolder,
  IRootState,
} from '../store/types';

const mapStateToProps = ({ projects }: IRootState) => {

  // This try...catch is necessary because otherwise connected-react-router will crash the page on navigate back
  let projectId;
  try {
    // @ts-ignore
    projectId = useParams().projectId;
  } catch {
    return null;
  }
  return {
    // @ts-ignore
    project: projects.allProjects[projectId],
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AllActionTypes>) => {
  return {
    allSelected: () => dispatch(ProjectDetailsPageActions.toggleAllSelected()),
    toggleOneSelected: (item: IFileOrFolder, isSelected: boolean) => dispatch(ProjectDetailsPageActions.toggleFileOrFolderSelected(item)),
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

    return (
      <div className="page project-details">
        <FilterBar />
        <FileList
          files={this.props.project.files}
          onFileOrFolderSelected={this.props.toggleOneSelected}
        />
      </div>
    )
  }

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectDetailsPage);
