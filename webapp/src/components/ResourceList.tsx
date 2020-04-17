import {ChangeEvent} from "react";
import * as React from 'react';

import '../styles/ResourceList.scss';

import {
  IResource,
} from '../store/types';
import Loading from "./Loading";
import Modal from "./modals/Modal";
import { SortTriangleSVG } from './FilePane';

import NewResourceModal from './modals/NewResourceModal';
import { ICreateResourceRequest } from '../store/types';

interface IResourceListProps {
  className?: string
  deleteResources: (resources: IResource[]) => any
  viewResource: any
  resources: {
      [resourceId: string]: IResource
  }
  createResource: (newResource: ICreateResourceRequest) => any
}

interface IStateTypes {
  allResourcesSelected: boolean
  filterBy: string
  modal: MODAL_TYPES
  selectedResources: Set<string>
  sortAscending: boolean
  sortBy: SORT_BY_OPTIONS
}

export default class ResourceList extends React.Component<IResourceListProps, IStateTypes> {

    state = {
      allResourcesSelected: false,
      filterBy: '',
      resourceToMaybeDelete: undefined,
      modal: MODAL_TYPES.NONE,
      selectedResources: new Set<string>(),
      sortAscending: true,
      sortBy: SORT_BY_OPTIONS.TITLE,
    };

  createResource = (data: ICreateResourceRequest) => {
    this.props.createResource(data);
    this.closeModal();
  };

    deleteSelectedResource = () => {
      this.props.deleteResources(Array.from(this.state.selectedResources).map(r => this.props.resources[r]));
      this.setState({modal: MODAL_TYPES.NONE});
    };

    showConfirmResourceDeletionModal = () => this.setState({ modal: MODAL_TYPES.CONFIRM_RESOURCE_DELETION });
    showNewResourceModal = () => this.setState({ modal: MODAL_TYPES.NEW_RESOURCE });

    setSortBy = (sortBy: SORT_BY_OPTIONS) => {
      if (sortBy === this.state.sortBy) {
        // If the user clicked the header of the column we're already sorted by, toggle sorting ascending/descending
        this.setState({sortAscending: !this.state.sortAscending});
      } else {
        // Otherwise change the the column we're sorted by
        this.setState({sortBy});
      }
    };

    closeModal = () => this.setState({ modal: MODAL_TYPES.NONE });

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

  toggleSingleResourceSelected = (resource: IResource) => {
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

  getFilteredSortedResources = () => Object.values(this.props.resources)
    .filter(r => r.title.toLowerCase().includes(this.state.filterBy.toLowerCase()))
    .sort((r1, r2) => {
      switch (this.state.sortBy) {
        case SORT_BY_OPTIONS.TITLE:
          if (this.state.sortAscending) {
            return r1.title.localeCompare(r2.title);
          } else {
            return r2.title.localeCompare(r1.title);
          }
        case SORT_BY_OPTIONS.LAST_MODIFIED:
          if (this.state.sortAscending) {
            return r1.lastUpdated?.diff(r2.lastUpdated)
          } else {
            return r2.lastUpdated?.diff(r1.lastUpdated)
          }
        case SORT_BY_OPTIONS.OWNER:
          if (this.state.sortAscending) {
            return r1.title.localeCompare(r2.title);
          } else {
            return r2.title.localeCompare(r1.title);
          }
        default: // Should never happen, but needed to satisfy TypeScript
          return 0;
      }
    });

  filterTextChanged = (e: ChangeEvent<HTMLInputElement>) => this.setState({filterBy: e.target.value});

  public render() {
    const {
      allResourcesSelected,
      selectedResources,
      sortAscending,
      sortBy,
    } = this.state;

    const rowElements = this.getFilteredSortedResources().map(resource => (
      <div className="table-row">
        <input
          type="checkbox"
          checked={selectedResources.has(resource.id)}
          onChange={() => this.toggleSingleResourceSelected(resource)}
        />
        <span onClick={() => this.props.viewResource(resource)} className="clickable">{resource.title}</span>
        <span>{resource.lastUpdated.format('MMMM D, YYYY')}</span>
        <span>{resource.creator || 'Unknown'}</span>
      </div>
      )
    );

    let loading;
    if (rowElements.length === 0) {
      loading = <Loading/>;
    }

    const deleteButtonClassName = selectedResources.size === 0 ? "button-disabled": "button-enabled";

    let modal;
    switch (this.state.modal) {
      case MODAL_TYPES.NEW_RESOURCE:
        modal = <NewResourceModal
          close={this.closeModal}
          createResource={this.createResource}
        />;
        break;
      case MODAL_TYPES.CONFIRM_RESOURCE_DELETION:
        const selectedResources = Array.from(this.state.selectedResources).map(r => this.props.resources[r]);
        modal = <ResourceDeleteConfirmationModal
          close={this.closeModal}
          resources={selectedResources}
          submit={this.deleteSelectedResource}
        />
    }

    const classNames = ['ResourceList', 'table'];
    if (this.props.className) {
      classNames.push(this.props.className);
    }
    const sortOrder = sortAscending ? 'sort-ascending' : 'sort-descending';
    return (
      <div className={classNames.join(' ')}>
        <div className="ResourceList-header">
          <h2>My Resources</h2>
          <p>Here is a list of your HydroShare resources. To open one, simply click on its name.</p>
          <p>A resource is a collection of files on HydroShare, a place for sharing code and water data. These files can be code (e.g. Python or R), data (e.g. .csv, .xlsx, .geojson), or any other type of file.</p>
          <p>The list below shows the resources that exist in HydroShare and in JupyterHub. Resources only in HydroShare can be synced to JupyterHub, and then you can run code and edit data. All changes should be made
             in JupyterHub and then synced to HydroShare. Think of JupyterHub as your workspace and HydroShare are your sharing or archival space. </p>
          <p>To begin, click the New Resource button to create a new resource or click on an existing resource in the list to view files in that resource.</p> 
        </div>
        <div className="actions-row">
          <input className="search" type="text" placeholder="Search" onChange={this.filterTextChanged}/>
          <button className="button-enabled" onClick={this.showNewResourceModal}><span>New Resource</span></button>
          <button
            className={deleteButtonClassName}
            disabled={selectedResources.size === 0}
            onClick={this.showConfirmResourceDeletionModal}>
            <span>Delete</span>
          </button>
        </div>
        <div className="table-header table-row">
          <span className="checkbox">
            <input type="checkbox" checked={allResourcesSelected} onChange={this.toggleAllResourcesSelected}/>
          </span>
          <button
            className={'clickable ' + (sortBy === SORT_BY_OPTIONS.TITLE ? sortOrder : '')}
            onClick={() => this.setSortBy(SORT_BY_OPTIONS.TITLE)}
          >
            Name
            {sortBy === SORT_BY_OPTIONS.TITLE && SortTriangleSVG}
          </button>
          <button
            className={'clickable ' + (sortBy === SORT_BY_OPTIONS.LAST_MODIFIED ? sortOrder : '')}
            onClick={() => this.setSortBy(SORT_BY_OPTIONS.LAST_MODIFIED)}
          >
            Last Modified on HydroShare
            {sortBy === SORT_BY_OPTIONS.LAST_MODIFIED && SortTriangleSVG}
          </button>
          <button
            className={'clickable ' + (sortBy === SORT_BY_OPTIONS.OWNER ? sortOrder : '')}
            onClick={() => this.setSortBy(SORT_BY_OPTIONS.OWNER)}
          >
            Owner
            {sortBy === SORT_BY_OPTIONS.OWNER && SortTriangleSVG}
          </button>
        </div>
        {loading}
        {rowElements}
        {modal}
        </div>
    );
  }
}

type RDCModalProps = {
  close: () => any
  resources: IResource[]
  submit: () => any
};

const ResourceDeleteConfirmationModal: React.FC<RDCModalProps> = (props: RDCModalProps) => {
  return (
    <Modal close={props.close} title="Confirm Deletion" submit={props.submit} isValid={true} submitText="Delete" isWarning={true}>
      <p>Are you sure you want to delete the following resources?</p>
      {props.resources.map(r => <p>{r.title}</p>)}
    </Modal>
  )
};

enum MODAL_TYPES {
  NONE,
  NEW_RESOURCE,
  CONFIRM_RESOURCE_DELETION,
}

enum SORT_BY_OPTIONS {
  TITLE,
  LAST_MODIFIED,
  OWNER,
}
