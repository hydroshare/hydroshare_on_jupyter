import * as React from 'react';
import {
  Button,
  Form,
} from 'react-bootstrap';
import { FaRegFolder, FaTrashAlt } from "react-icons/fa";
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
                <Button className="new-folder-button" variant="outline-light" onClick={this.createNewResource}><FaRegFolder/>Sync</Button>
                <Button className="delete-button" variant="danger" onClick={this.deleteClick}><FaTrashAlt /></Button>
            </div>
        );
    }
}
