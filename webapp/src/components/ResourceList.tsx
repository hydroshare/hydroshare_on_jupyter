import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Form} from 'react-bootstrap';
import ContextMenu from 'react-context-menu';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/ResourceList.css';

import {
  AllActionTypes,
  IJupyterProject,
  IRootState,
} from '../store/types';

const mapStateToProps = ({ projects, projectPage }: IRootState) => {
  return {
    projectsList: Object.values(projects.allProjects),
    searchTerm: projectPage.searchTerm,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AllActionTypes>) => {
  return {
  }
};

interface IResourceListProps {
  viewProject: any
}

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & IResourceListProps;
class ResourceList extends React.Component<ReduxType, never> {

    constructor(props: ReduxType) {
      super(props);
    }
  
    public deleteClick =() => {
        console.log("Send message to backend to delete")
    }

    public createNewResource =() => {
        console.log("Send message to backend to create new resource")
    }

    public handleSortByChange = (e: any) => {
        console.log("Sort by" + e.value)
    }

    public goToFiles = (e: any) => {
      console.log("go to file")
    }
  /*public createResourcesList = () => {
    for resource in this.props.resources {

    }
  }*/

  public render() {
    const { projectsList, searchTerm } = this.props;
    console.log(searchTerm)
    return (
        <div className='resourcesParent'>
            {projectsList.map((project: IJupyterProject, i: number) => {
              const {
                name,
                hydroShareResource,
              } = project;
              const hydroShareInfoElems = [];
              if (hydroShareResource) {
                hydroShareInfoElems.push(<div className='resource-status'>{hydroShareResource.status}</div>);
              }
              const viewProject = () => this.props.viewProject(project);
              
              if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
                return (
                  <div key={i} className='resourcesLine' id={i+'-menu'} onClick={viewProject}>
                    <Form className='checkbox-form'>
                      <Form.Check
                        type='checkbox'
                        id={`default-checkbox`}
                      />
                    </Form>
                    <div className='resource-name'>{name}</div>
                    {/*<div className='resource-author'>{resource.author}</div>*/}
                    {/*<div className='resource-lastModified'>{project.lastModified}</div>*/}
                    {hydroShareInfoElems}
                    <ContextMenu contextId={i+'-menu'} items={[{label: 'Rename'}, {label: 'Delete'}, {label: 'Publish to Hydroshare'}, , {label: 'Locate in Hydroshare'}]} />
                    </div>)
              }
              return;
            })}
        </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourceList);
