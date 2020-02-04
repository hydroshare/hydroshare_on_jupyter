import * as React from 'react';
import {
  Button,
  Form,
} from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { ICreateNewResource } from '../store/types';

import '../styles/css/NewProjectModal.css';

interface INewProjectModalProps {
    show: boolean
    onHide: () => any
    newProject: (newResource: ICreateNewResource) => any
}

interface INewProjectModalState {
    formValidated: boolean
}

export default class NewProjectModal extends React.Component<INewProjectModalProps, INewProjectModalState> {

    constructor(props: INewProjectModalProps) {
      super(props);
      this.state = {
        formValidated: false,
      }
    }

    // potato (vicky): it seems like you have a lot of files with these same 3 functions - why?
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
        this.props.newProject({
            name: form.elements.formBasicName.value,
            privacy: form.elements.formBasicPrivacy.value
        })
        this.props.onHide()
    }

    public cancelNewResource = () => {
        this.props.onHide()
    }


    public render() {

        // potato (vicky): is it true you can't rename a project once it is created?
        return (
            <Modal
                {...this.props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered = {true}
                >
                <Modal.Header closeButton={true}>
                    <Modal.Title id="contained-modal-title-vcenter">
                    Create new project
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate={false} validated={this.state.formValidated} onSubmit={this.createNewResource}>
                        <Form.Group controlId="formBasicName">
                            <Form.Label>Name of project</Form.Label>
                            <Form.Text className="text-muted">
                                Note: You will not be able to rename your project once created.
                            </Form.Text>
                            <Form.Control required={true} type="name" placeholder="Project name" />
                            <Form.Control.Feedback type="invalid">
                                Please choose a project name.
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
                            Create new project
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
