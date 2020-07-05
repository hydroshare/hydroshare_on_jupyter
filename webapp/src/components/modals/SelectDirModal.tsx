import * as React from 'react';
import Modal, {
} from "./Modal";
import { NEW_FILE_OR_FOLDER_TYPES, IRootState } from '../../store/types';
import { ThunkDispatch } from 'redux-thunk';
import { connect } from 'react-redux';
import { uploadNewDir } from '../../store/async-actions';

const mapStateToProps = ({ directory }: IRootState) => {
  return {
    dirResponse: directory.dirResponse
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>) => {
  return {
    uploadNewDir: (dirPath: string, choice: string) => dispatch(uploadNewDir(dirPath, choice))
  }
};

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & IUploadFileModalProps;


interface IUploadFileModalProps {
  /*
  close: () => any
  submit: (name: string, type: string) => any
  onFileChange: (file: any) => any
  */
}

interface IUploadFileModalState {
  dirPath: string,
  choice: string,
}

/**
 * Modal to prompt user to select a directory to download their hydroshare data into their workspace
 */

class SelectDirModal extends React.Component<ReduxType, IUploadFileModalState> {

  state = {
    dirPath: '',
    choice: 'Yes'
  };

  submit = () => {
    this.props.uploadNewDir(this.state.dirPath, this.state.choice);

  }//this.props.submit(this.state.name, this.state.type);

  render() {
    //return this.props.isSuccess ? null : 
    return (
      <Modal
        close={() => { }}
        title="Select a root directory"
        isValid={true}
        submit={this.submit}
        submitText="Select"
      >
        <div className="TextArea group"></div>
        <div className="group-content">

          <input id="myFile" type="text" onChange={(event) => { this.setState({ dirPath: event.target.value }) }} />
          {this.props.dirResponse && <p className="error">{this.props.dirResponse}</p>}
        </div>

      </Modal>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelectDirModal);

