import * as React from 'react';
// import ContextMenu from 'react-context-menu';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/css/ResourceList.css';

import {
  IJupyterResource,
  SortByOptions,
} from '../store/types';

import {
  Button
} from 'react-bootstrap';

import NewResourceModal from './NewResourceModal';
import { ICreateResourceRequest } from '../store/types';

import { FaFileMedical} from "react-icons/fa";

import MaterialTable, {MTableToolbar} from 'material-table';

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

  public viewResource(resource: ITableResourceInfo | undefined) {
    if (resource) {
      this.props.viewResource(this.props.resources[resource.Id]);
    }
  }

  public render() {
    const { resources } = this.props;
    // const viewProject = () => this.props.viewProject(project);
    return (
      <div>
      <MaterialTable
        title={"My Resources"}
        columns={[
          { title: 'Name', field: 'Name'},
          // { title: 'Status', field: 'Status'},
          { title: 'Resource Location', field: 'Location'}
        ]}
        data={this.convertToTableStructure(resources)}
        actions={[
          {
            icon: 'delete',
            tooltip: 'Delete resource',
            position: 'row',
            onClick: (event, rowData) => alert("You deleted " + rowData)
          }
        ]}
        options={{
          selection: true,
          sorting: true,
          search: true,
          actionsColumnIndex: -1,
          maxBodyHeight: 500,
          headerStyle: {backgroundColor: '#ededed', fontSize: 16},
          paging: false,
        }}
        components={{
          Toolbar: props => (
            <div className="resource-toolbar">
              <MTableToolbar className="MTtoolbar" {...props} />
              <Button className="new-resource-button" variant="light" onClick={this.handleOpenModal}><FaFileMedical/> New Resource</Button>
            </div>
          )}}
        onRowClick={((evt, selectedRow) => this.viewResource( selectedRow ))}
      />
      <NewResourceModal
              show={this.state.showModal}
              onHide={this.handleCloseModal}
              newResource={this.props.newResource}
            />
            </div>
    );
  }
}
