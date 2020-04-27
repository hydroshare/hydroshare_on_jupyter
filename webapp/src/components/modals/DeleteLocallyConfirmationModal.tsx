import * as React from 'react';
import Modal from "./Modal";

import {IResource} from '../../store/types';

type IDeleteModalProps = {
    close: () => any
    resources: IResource[] | undefined
    submit: () => any
};
  
export default class DeleteLocallyConfirmationModal extends React.Component<IDeleteModalProps, never> {
    render() {
        return (
            <Modal close={this.props.close} title="Remove from workspace" submit={this.props.submit} isValid={true} submitText="Remove" isWarning={true}>
            <p className="body-header">Are you sure you want to remove the following resources from your workspace?</p>
            {this.props.resources!.map(r => <p className="list-resources">{r.title}</p>)}
            <p>This will delete a resource from your workspace but leave the HydroShare version intact. </p>
            <p>Please manually transfer from your workspace any remaining files you'd like to save to HydroShare before removing.</p>
            </Modal>
        )
    }
};