import * as React from 'react';
import Modal, {
} from "./Modal";
import { NEW_FILE_OR_FOLDER_TYPES } from '../../store/types';

interface IUploadFileModalProps {
  close: () => any
  submit: (name: string, type: string) => any
  onFileChange: (file: any) => any
}

interface IUploadFileModalState {
  name: string
  type: string
}

/**
 * Modal to prompt user to upload a file to their workspace
 */
export default class UploadFileModal extends React.Component<IUploadFileModalProps, IUploadFileModalState> {

  state = {
    name: '',
    type: NEW_FILE_OR_FOLDER_TYPES.FOLDER,
  };

  nameChange = (name: string) => this.setState({name});

  typeChange = (type: string) => this.setState({type});

  isValid = (): boolean => {
    return /^[\w,\-.]+$/.test(this.state.name);
  };

  submit = () => this.props.submit(this.state.name, this.state.type);

  render() {
    return (
      <Modal
        close={this.props.close}
        title="Upload file"
        isValid={true}
        submit={this.submit}
        submitText="Upload"
      >
        <input type="file" onChange={this.props.onFileChange} />
      </Modal>
    );
  }
}
