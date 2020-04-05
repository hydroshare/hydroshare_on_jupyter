import * as React from 'react';
// import ContextMenu from 'react-context-menu';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/ResourceList.scss';

import {
  IJupyterResource,
  SortByOptions,
} from '../store/types';

import NewResourceModal from './NewResourceModal';
import { ICreateResourceRequest } from '../store/types';

interface IResourceListProps {
  allResourcesSelected: boolean
  className?: string
  viewResource: any
  searchTerm: string
  resources: {
      [resourceId: string]: IJupyterResource
  }
  selectedResources: Set<string>
  sortByTerm: SortByOptions | undefined
  toggleAllResourcesSelected: () => any
  toggleSingleResourceSelected: (res: IJupyterResource) => any
  newResource: (newResource: ICreateResourceRequest) => any
}

interface ITableResourceInfo {
  Name: string,
  // Status: string,
  Id: string,
  Location: string,
}

interface IStateTypes {
  showModal: boolean
}

export default class ResourceList extends React.Component<IResourceListProps, IStateTypes> {

    constructor(props: IResourceListProps) {
      super(props);

      this.state = {
        showModal: false
      }

      this.handleOpenModal = this.handleOpenModal.bind(this);
      this.handleCloseModal = this.handleCloseModal.bind(this);
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

    // TODO (Emily): figure out what this file is doing
    public goToFiles = (e: any) => {
      console.log("go to file")
    }

    public handleOpenModal () {
      this.setState({ showModal: true });
    }

    public handleCloseModal () {
      this.setState({ showModal: false });
    }

  public convertToTableStructure(resources: {[resourceId: string]: IJupyterResource}): ITableResourceInfo[] {
    const tableList: ITableResourceInfo[] = [];
    Object.values(resources).map((resource: IJupyterResource, i: number) => {
        const locations = ['HydroShare'];
        const {
          id,
          // hydroShareResource,
          localCopyExists,
          title,
        } = resource;
        if (localCopyExists) {
            locations.push('JupyterHub');
        }
        let locationString;
        if (locations.length > 1) {
            const lastLocation = locations.splice(locations.length - 1, 1);
            locationString = locations.join(', ') + ' & ' + lastLocation;
        } else {
            locationString = locations[0];
        }
        tableList.push({
          Name: title,
          // Status: hydroShareResource.status,
          Location: locationString,
          Id: id,
        })
    });
    return tableList;
  }

  public render() {
    const {
      allResourcesSelected,
      resources,
      selectedResources,
      toggleAllResourcesSelected,
    } = this.props;

    const rowElements = Object.values(resources).map(resource => (
      <div className="table-row">
        <input
          type="checkbox"
          checked={selectedResources.has(resource.id)}
          onChange={() => this.props.toggleSingleResourceSelected(resource)}
        />
        <span onClick={() => this.props.viewResource(resource)}>{resource.title}</span>
        <span>{resource.hydroShareResource.author || 'Unknown'}</span>
        <span>Unknown</span>
        <span>Unknown</span>
      </div>
      )
    );

    const classNames = ['ResourceList', 'table'];
    if (this.props.className) {
      classNames.push(this.props.className);
    }
    return (
      <div className={classNames.join(' ')}>
        <div className="ResourceList-header">
          <h2>My Resources</h2>
          <span>Here is a list of your HydroShare resources. To open one, simply click on it.</span>
        </div>
        <div className="input-row">
          <input type="text" placeholder="Search"/>
          <button onClick={this.handleOpenModal}><span>New Resource</span></button>
          <button disabled={selectedResources.size === 0}><span>Delete</span></button>
        </div>
        <div className="table-header table-row">
          <span className="checkbox">
            <input type="checkbox" checked={allResourcesSelected} onChange={toggleAllResourcesSelected}/>
          </span>
          <span>Name</span>
          <span>Owner</span>
          <span>Size</span>
          <span>Last Modified</span>
        </div>
        {rowElements}
        <NewResourceModal
          show={this.state.showModal}
          onHide={this.handleCloseModal}
          newResource={this.props.newResource}
        />
        </div>
    );
  }
}
