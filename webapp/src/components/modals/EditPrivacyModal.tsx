import * as React from 'react';
import Modal from "./Modal";

import '../../styles/EditPrivacyModal.scss';


interface IEditPrivacyModalProps {
  close: () => any
  submit: () => any
}

export default class EditPrivacyModal extends React.Component<IEditPrivacyModalProps, never> {

  isValid = (): boolean => {
    return true;
  };

  submit = () => this.props.submit();

  render() {
    return (
      <Modal
        close={this.props.close}
        title="Edit Privacy"
        isValid={this.isValid()}
        submit={this.submit}
        submitText="Edit privacy"
      >
        <p className= "edit-privacy-text">You will be redirected to the HydroShare page for this resource. You will need to click "Manage who has access" and find the "Sharing Status" section of the access settings.</p>
      </Modal>
    );
  }
}
