import * as React from 'react';
import Modal, {
  TextInput,
} from "./Modal";

interface INewFileModalProps {
  close: () => any
  submit: (name: string) => any
}

interface INewFileModalState {
  name: string
}

export default class NewFileModal extends React.Component<INewFileModalProps, INewFileModalState> {

  state = {
    name: '',
  };

  nameChange = (name: string) => this.setState({name});

  isValid = (): boolean => {
    return !!this.state.name;
  };

  submit = () => this.props.submit(this.state.name);

  render() {
    return (
      <Modal
        close={this.props.close}
        title="New File or Folder"
        isValid={this.isValid()}
        submit={this.submit}>
        <TextInput title="File Name" onChange={this.nameChange} value={this.state.name}/>
      </Modal>
    );
  }
}
