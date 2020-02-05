// TODO (Emily): in general i think adding some more comments to these files would be great -
// at a minimum let's make sure we at least have a header comment for each one just saying what the file does
import * as React from 'react';
import ResourceList from '../components/ResourceList';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import * as AppActions from '../store/actions/App';
import * as projectPageActions from '../store/actions/projectPage';
import {
  AllActionTypes,
  IJupyterProject,
  IRootState,
  SortByOptions,
  ICreateNewResource,
} from '../store/types';

const mapStateToProps = ({ projects, projectPage }: IRootState) => {
  return {
    projects: projects.allProjects,
    searchTerm: projectPage.searchTerm,
    sortByTerm: projectPage.sortBy,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AllActionTypes>) => {
  return {
    viewProject: (project: IJupyterProject) => dispatch(AppActions.viewProject(project)),
    searchBy: (searchTerm: string) => dispatch(projectPageActions.searchBy(searchTerm)),
    sortBy: (sortByTerm: SortByOptions) => dispatch(projectPageActions.sortBy(sortByTerm)),
    newProject: (newResource: ICreateNewResource) => dispatch(projectPageActions.createNewResource(newResource))
  }
};

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class ProjectsPage extends React.Component<ReduxType, never>  {

  public handleSearchChange = (event: any) => {
    this.props.searchBy(event.target.value)
  }


  public handleViewProject = (project: IJupyterProject) => {
    this.props.viewProject(project);
  }

  public render() {
    return (
      <div className="page projects">
        <h1>Welcome to CUAHSI JupyterHub!</h1>
        <p>Below is the list of resources you have saved in HydroShare and/or JupyterHub.</p>
        <ResourceList newProject={this.props.newProject} viewProject={this.handleViewProject} projects={this.props.projects} searchTerm={this.props.searchTerm} sortByTerm={this.props.sortByTerm}/>
      </div>
    )
  }

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectsPage);
