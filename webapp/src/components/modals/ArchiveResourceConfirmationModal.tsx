import * as React from 'react';
import Modal from "./Modal";

import '../../styles/ArchiveResourceConfirmationModal.scss';

import {IResource} from '../../store/types';

type IArchiveModalProps = {
    close: () => any
    resources: IResource[]
    submit: () => any
};
  
export default class ArchiveResourceConfirmationModal extends React.Component<IArchiveModalProps, never> {
    render() {
        return (
            <Modal close={this.props.close} title="Archive Resource" submit={this.props.submit} isValid={true} submitText="Archive" isConfirm={true}>
            <p className="archive-header">Are you sure you want to archive the following resources?</p>
            {this.props.resources.map(r => <p className="archive-resource-list">{r.title}</p>)}
            <p>This will delete a resource from your workspace but save it in HydroShare. </p>
            <p>Please manually transfer from your workspace any remaining files you'd like to save to HydroShare before archiving.</p>
            </Modal>
        )
    }
};