import * as React from 'react';
import {
  Button,
  Dropdown,
  DropdownButton,
  Form,
} from 'react-bootstrap';
import { FaFileMedical, FaRegFolder, FaRegFolderOpen, FaTrashAlt } from "react-icons/fa";
import { Col } from 'reactstrap';

import '../styles/FilterBarProjectDetails.css';

interface IFilterBarProjectDetailsProps {
    allSelected: boolean
    toggleAllSelected: () => any
    sortBy: (sortBy: string) => any
    searchChange: any
}

export default class FilterBarProjectDetails extends React.Component<IFilterBarProjectDetailsProps, never> {

    constructor(props: IFilterBarProjectDetailsProps) {
      super(props);
    }
  
    public deleteClick =() => {
        console.log("Send message to backend to delete")
    }

    public createNewResource =() => {
        console.log("Send message to backend to create new resource")
    }

    public handleSortByChange =(e: any) => {
        this.props.sortBy(e)
    }


  public render() {
    // const { selectAll, sortBy } = this.props;

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
                <Dropdown.Item href="#/action-2" eventKey="TYPE" onSelect={this.handleSortByChange}>File Type</Dropdown.Item>
            </DropdownButton>
            <Button className="folder-open" variant="outline-success"><FaRegFolderOpen/></Button>
            <Button className="folder" variant="outline-success"><FaRegFolder/></Button>
            <Button className="new-resource-button" variant="outline-success" onClick={this.createNewResource}><FaFileMedical/> New Project</Button>
            <Button className="delete-button" variant="danger" onClick={this.deleteClick}><FaTrashAlt /></Button>
        </div>
    );
  }
}
