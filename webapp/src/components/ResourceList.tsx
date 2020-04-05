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
  className?: string
  viewResource: any
  resources: {
      [resourceId: string]: IJupyterResource
  }
  newResource: (newResource: ICreateResourceRequest) => any
}

interface ITableResourceInfo {
  Name: string,
  // Status: string,
  Id: string,
  Location: string,
}

interface IStateTypes {
  allResourcesSelected: boolean
  filterBy: string
  selectedResources: Set<string>
  showModal: boolean
  sortBy?: SortByOptions
}

export default class ResourceList extends React.Component<IResourceListProps, IStateTypes> {

    state = {
      allResourcesSelected: false,
      filterBy: '',
      selectedResources: new Set<string>(),
      showModal: false
    };

    openModal = () => {
      this.setState({ showModal: true });
    };

    closeModal = () => {
      this.setState({ showModal: false });
    };

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

  toggleAllResourcesSelected = () => {
    let selectedResources;
    if (this.state.allResourcesSelected) {
      selectedResources = new Set<string>();
    } else {
      selectedResources = new Set(Object.keys(this.props.resources));
    }
    this.setState({
      allResourcesSelected: !this.state.allResourcesSelected,
      selectedResources,
    });
  };

  toggleSingleResourceSelected = (resource: IJupyterResource) => {
    let selectedResources = new Set(this.state.selectedResources);
    if (selectedResources.has(resource.id)) {
      selectedResources.delete(resource.id);
    } else {
      selectedResources.add(resource.id);
    }
    this.setState({
      allResourcesSelected: selectedResources.size === Object.keys(this.props.resources).length,
      selectedResources,
    });
  };

  public render() {
    const {
      resources,
    } = this.props;

    const {
      allResourcesSelected,
      selectedResources,
    } = this.state;

    const rowElements = Object.values(resources).map(resource => (
      <div className="table-row">
        <input
          type="checkbox"
          checked={selectedResources.has(resource.id)}
          onChange={() => this.toggleSingleResourceSelected(resource)}
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
          <button onClick={this.openModal}><span>New Resource</span></button>
          <button disabled={selectedResources.size === 0}><span>Delete</span></button>
        </div>
        <div className="table-header table-row">
          <span className="checkbox">
            <input type="checkbox" checked={allResourcesSelected} onChange={this.toggleAllResourcesSelected}/>
          </span>
          <span>Name</span>
          <span>Owner</span>
          <span>Size</span>
          <span>Last Modified</span>
        </div>
        {rowElements}
        <NewResourceModal
          show={this.state.showModal}
          onHide={this.closeModal}
          newResource={this.props.newResource}
        />
        </div>
    );
  }
}
