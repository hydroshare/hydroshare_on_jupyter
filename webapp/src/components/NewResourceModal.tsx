import * as React from 'react';
import {
  Button,
  Form,
} from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { ICreateResourceRequest } from '../store/types';

import '../styles/css/NewResourceModal.css';

interface INewResourceModalProps {
    show: boolean
    onHide: () => any
    newResource: (newResource: ICreateResourceRequest) => any
}

interface INewResourceModalState {
    formValidated: boolean
}

export default class NewResourceModal extends React.Component<INewResourceModalProps, INewResourceModalState> {

    constructor(props: INewResourceModalProps) {
      super(props);
      this.state = {
        formValidated: false,
      }
    }

    // TODO (emily): remove some deletes somewhere
    public deleteClick =() => {
        console.log("Send message to backend to delete")
    }

    public createNewResource =(event: any) => {
        const form = event.target
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.setState({
            formValidated: true
        })
        this.props.newResource({
            name: form.elements.formBasicName.value,
            privacy: form.elements.formBasicPrivacy.value
        })
        this.props.onHide()
    }

    public cancelNewResource = () => {
        this.props.onHide()
    }


    public render() {

        // TODO (emily): change note if we can actually rename stuff
        return (
            <Modal
                {...this.props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered = {true}
                >
                <Modal.Header closeButton={true}>
                    <Modal.Title id="contained-modal-title-vcenter">
                    Create new resource
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate={false} validated={this.state.formValidated} onSubmit={this.createNewResource}>
                        <Form.Group controlId="formBasicName">
                            <Form.Label>Name of resource</Form.Label>
                            <Form.Text className="text-muted">
                                Note: You will not be able to rename your resource once created.
                            </Form.Text>
                            <Form.Control required={true} type="name" placeholder="Resource name" />
                            <Form.Control.Feedback type="invalid">
                                Please choose a resource name.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="formBasicPrivacy">
                            <Form.Label>Privacy</Form.Label>
                            <Form.Control as="select">
                                <option>Private</option>
                                <option>Public</option>
                            </Form.Control>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Create new resource
                        </Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.cancelNewResource}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
