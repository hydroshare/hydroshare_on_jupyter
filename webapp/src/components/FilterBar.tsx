import * as React from 'react';
import {
  Button,
  Dropdown,
  DropdownButton,
  Form,
} from 'react-bootstrap';
import { FaFileMedical, FaRegFolder, FaRegFolderOpen, FaTrashAlt } from "react-icons/fa";
import { Col } from 'reactstrap';

import '../styles/FilterBar.css';
import NewProjectModal from './NewProjectModal';
import { ICreateNewResource } from '../store/types';

interface IPropTypes {
  allSelected: boolean
  toggleAllSelected: () => any
  searchChange: () => any
  sortBy: (sortBy: string) => any
  newProject: (newResource: ICreateNewResource) => any
}

interface IStateTypes {
  showModal: boolean
}

export default class FilterBar extends React.Component<IPropTypes, IStateTypes> {
  constructor(props: IPropTypes) {
    super(props);
    this.state = {
      showModal: false
    };

    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  public deleteClick =() => {
    console.log("Send message to backend to delete")
  }

  public handleSortByChange =(e: any) => {
    this.props.sortBy(e)
  }

  public handleOpenModal () {
    this.setState({ showModal: true });
  }

  public handleCloseModal () {
    this.setState({ showModal: false });
  }

  public render() {
    return (
        <div className='filterParent'>
            <Form className='filterForm'>
                <Form.Row>
                    <Col className="filterForm-checkbox" md="4">
                        <Form.Check
                            type={'checkbox'}
                            id={`select-all-checkbox`}
                            className='selectAll-checkbox'
                            label={`Select All`}
                            checked={this.props.allSelected}
                            onChange={this.props.toggleAllSelected}
                        />
                    </Col>
                    <Col className="filterForm-searchBox" md="8">
                        <Form.Control onChange={this.props.searchChange} placeholder="Search" />
                    </Col>
                </Form.Row>
            </Form>
            <DropdownButton id="dropdown-basic-button" className="filter-sortBy" variant="info"  title="Sort by">
                <Dropdown.Item href="#/action-1" eventKey="NAME" onSelect={this.handleSortByChange}>Name</Dropdown.Item>
                <Dropdown.Item href="#/action-2" eventKey="DATE" onSelect={this.handleSortByChange}>Last Modified</Dropdown.Item>
                <Dropdown.Item href="#/action-2" eventKey="AUTHOR" onSelect={this.handleSortByChange}>Author</Dropdown.Item>
                <Dropdown.Item href="#/action-2" eventKey="STATUS" onSelect={this.handleSortByChange}>Status</Dropdown.Item>
            </DropdownButton>
            <Button className="folder-open" variant="outline-success"><FaRegFolderOpen/></Button>
            <Button className="folder" variant="outline-success"><FaRegFolder/></Button>
            <Button className="new-resource-button" variant="outline-success" onClick={this.handleOpenModal}><FaFileMedical/> New Project</Button>
            <Button className="delete-button" variant="danger" onClick={this.deleteClick}><FaTrashAlt /></Button>

            <NewProjectModal
              show={this.state.showModal}
              onHide={this.handleCloseModal}
              newProject={this.props.newProject}
            />
        </div>
    );
  }
}
