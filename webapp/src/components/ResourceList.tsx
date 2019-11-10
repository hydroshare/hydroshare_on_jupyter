import * as React from 'react';
import { Form} from 'react-bootstrap';
import ContextMenu from 'react-context-menu';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/ResourceList.css';

import {
  IJupyterProject,
} from '../store/types';


interface IResourceListProps {
  viewProject: any
  searchTerm: string
  projects: IJupyterProject[]
}

export default class ResourceList extends React.Component<IResourceListProps, never> {

    constructor(props: IResourceListProps) {
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
    const { projects, searchTerm } = this.props;
    console.log(searchTerm)
    return (
        <div className='resourcesParent'>
            {projects.map((project: IJupyterProject, i: number) => {
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
