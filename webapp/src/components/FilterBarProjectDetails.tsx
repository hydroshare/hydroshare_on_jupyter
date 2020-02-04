import * as React from 'react';
import {
  Button,
  Dropdown,
  DropdownButton,
  Form,
} from 'react-bootstrap';
import { FaTrashAlt } from "react-icons/fa";
import { Col } from 'reactstrap';

import '../styles/css/FilterBarProjectDetails.css';

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

    // potato (vicky): project details seems to imply that this is for specifics of a chosen resource/project
    // why can you also create a new resource within it?
    public createNewResource =() => {
        console.log("Send message to backend to create new resource")
    }

    public handleSortByChange =(e: any) => {
        this.props.sortBy(e)
    }


    public render() {
        return (
            <div className='filterParent'>
                <Form className='filterForm'>
                    <Form.Row>
                        <Col className="filterForm-searchBox" md="8">
                            <Form.Control onChange={this.props.searchChange} placeholder="Search" />
                        </Col>
                    </Form.Row>
                </Form>
                <DropdownButton id="dropdown-variants-Success" className="filterBar-sync" variant="info"  title="Synchronize">
                    <Dropdown.Item href="#/action-1" eventKey="NAME" onSelect={this.handleSortByChange}>JupyterHub to HydroShare</Dropdown.Item>
                    <Dropdown.Item href="#/action-2" eventKey="DATE" onSelect={this.handleSortByChange}>HydroShare to JupyterHub</Dropdown.Item>
                </DropdownButton>
                <Button className="delete-button" variant="danger" onClick={this.deleteClick}><FaTrashAlt /></Button>
            </div>
        );
    }
}
