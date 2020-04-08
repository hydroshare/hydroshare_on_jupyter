// SPIFFY (Emily) we shouldn't need this anymore. Kyle can you confirm?
import * as React from 'react';
import {
  Button,
} from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';

interface IOpenFileModalProps {
    show: boolean
    onHide: () => any
}

interface IOpenFileModalState {
    formValidated: boolean
}

export default class OpenFileModal extends React.Component<IOpenFileModalProps, IOpenFileModalState> {

    constructor(props: IOpenFileModalProps) {
      super(props);
      this.state = {
        formValidated: false,
      }
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
        
        this.props.onHide()
    }

    public cancelNewResource = () => {
        this.props.onHide()
    }


    public render() {

        return (
            <Modal
                {...this.props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered = {true}
                >
                <Modal.Header closeButton={true}>
                    <Modal.Title id="contained-modal-title-vcenter">
                    Create new file
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Thanks for creating a file, this button isn't functional yet.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.cancelNewResource}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
