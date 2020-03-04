import * as React from 'react';
import {
  // Button,
  Dropdown,
  DropdownButton,
  Form,
} from 'react-bootstrap';
// import { FaTrashAlt } from "react-icons/fa";
import { Col } from 'reactstrap';

import '../styles/FilterBarResource.scss';

interface IFilterBarResourceProps {
    allSelected: boolean
    toggleAllSelected: () => any
    sortBy: (sortBy: string) => any
    searchChange: any
}

export default class FilterBarResource extends React.Component<IFilterBarResourceProps, never> {

    constructor(props: IFilterBarResourceProps) {
      super(props);
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
                {/* /<Button className="delete-button" variant="danger" onClick={this.deleteClick}><FaTrashAlt /></Button> */}
            </div>
        );
    }
}
