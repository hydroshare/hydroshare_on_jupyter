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
  viewResource: any
  searchTerm: string
  resources: {
      [resourceId: string]: IJupyterResource
  }
  sortByTerm: SortByOptions | undefined
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
    const { resources } = this.props;
    return (
      <div>
        {Object.values(resources).map(res => (<p key={res.id} onClick={() => this.props.viewResource(res)}>{res.title}</p>))}
        <NewResourceModal
          show={this.state.showModal}
          onHide={this.handleCloseModal}
          newResource={this.props.newResource}
        />
        </div>
    );
  }
}
