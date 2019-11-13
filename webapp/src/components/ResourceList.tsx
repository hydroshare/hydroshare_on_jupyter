import * as React from 'react';
import { Form} from 'react-bootstrap';
import ContextMenu from 'react-context-menu';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/ResourceList.css';

import {
  IJupyterProject, SortByOptions,
} from '../store/types';


interface IResourceListProps {
  viewProject: any
  searchTerm: string
  projects: IJupyterProject[]
  sortByTerm: SortByOptions | undefined
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

  public render() {
    const { projects, searchTerm, sortByTerm } = this.props;
    switch (sortByTerm) {
      case SortByOptions.Name:
        projects.sort((a, b) => (a.name > b.name) ? 1 : -1)
        break;
      case SortByOptions.Date:
        projects.sort((a, b) => {
          const dateA = a.hydroShareResource ? a.hydroShareResource.lastModified : ''
          const dateB = b.hydroShareResource ? b.hydroShareResource.lastModified : ''
    
          if (dateA < dateB) {
            return -1;
          } else if (dateA > dateB) {
              return 1;
          } else {
              return 0;
          }
        })
        break;
      case SortByOptions.Author:
        projects.sort((a, b) => {
          const authorA = a.hydroShareResource ? a.hydroShareResource.author : ''
          const authorB = b.hydroShareResource ? b.hydroShareResource.author : ''
    
          if (authorA < authorB) {
            return -1;
          } else if (authorA > authorB) {
              return 1;
          } else {
              return 0;
          }
        })
        break;
      case SortByOptions.Status:
        projects.sort((a, b) => {
          const statusA = a.hydroShareResource ? a.hydroShareResource.status : ''
          const statusB = b.hydroShareResource ? b.hydroShareResource.status : ''
    
          if (statusA < statusB) {
            return -1;
          } else if (statusA > statusB) {
              return 1;
          } else {
              return 0;
          }
        })
        break;
      default:
        break;
    }

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
