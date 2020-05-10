import * as React from 'react';
import Modal, {
  RadioInput,
  TextInput,
} from "./Modal";
import { NEW_FILE_OR_FOLDER_TYPES } from '../../store/types';

interface INewFileModalProps {
  close: () => any
  submit: (name: string, type: string) => any
}

interface INewFileModalState {
  name: string
  type: string
}

export default class NewFileModal extends React.Component<INewFileModalProps, INewFileModalState> {

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
        title="New File or Folder"
        isValid={this.isValid()}
        submit={this.submit}
        submitText="Create"
      >
        <TextInput title="Name" onChange={this.nameChange} value={this.state.name} pattern="^[\w,\-\.]+$"/>
        <p>File or folder name must contain only alphanumeric characters, hyphens (-) and underscores (_). Spaces are not allowed.</p>
        <RadioInput choices={Object.values(NEW_FILE_OR_FOLDER_TYPES)} onChange={this.typeChange} selected={this.state.type} title="Type"/>
      </Modal>
    );
  }
}
