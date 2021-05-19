import * as React from 'react';
import Modal, {
} from "./Modal";
//import Modal, {TextInput} from "../components/modals/Modal";
//import Modal from '../../components/modals/Modal';
import { IRootState } from '../../store/types';
import { ThunkDispatch } from 'redux-thunk';
import { connect } from 'react-redux';
import { uploadNewDir } from '../../store/async-actions';

interface IUploadFileModalProps {
  close: () => any
  submit: (name: string, type: string) => any
  onFileChange: (file: any) => any
}

const mapStateToProps = ({ directory, user }: IRootState) => {
  return {
    dirResponse: directory.dirResponse,
    dirErrorResponse: directory.dirErrorResponse,
    //fileSavedResponse: directory.fileSavedResponse,
    dirSavedResponse: user.checkingFile
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>) => {
  return {
    uploadNewDir: (dirPath: string, choice: string) => dispatch(uploadNewDir(dirPath, choice))
  }
};

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

interface IDirectorySelectState {
  dirPath: string,
  choice: string,
  showDirectorySelector: boolean,
  isShown: boolean,
  //close: () => any,
}

/**
 * Modal to prompt user to select a directory to download their hydroshare data into their workspace
 */

class SelectDirModal extends React.Component<ReduxType, IDirectorySelectState, IUploadFileModalProps> {

  state = {
    dirPath: '',
    choice: 'No',
    showDirectorySelector: false,
    isShown: true,

  };
  public directoryChoice = (event: any) => {
    event.target.value === "Yes" ? this.setState({ showDirectorySelector: true, choice: "Yes" }) : this.setState({ showDirectorySelector: false, choice: "No" });

  }
  submit = () => {
    {
        this.props.uploadNewDir(this.state.dirPath, this.state.choice);
        this.setState({ isShown: false })
        this.props.dirErrorResponse == "";
    }
  }
  isShown: any;
  render() {
    const homedir = require('os').homedir();
    const showDirectorySelector: boolean = this.state.showDirectorySelector;
    const { directoryChoice } = this;
    if (!this.state.isShown && this.props.dirErrorResponse == "") {
      return null;
    }
    return (

      <Modal
        close={() => { return null }}
        title="Configure Hydroshare directory"
        isValid={this.state.isShown || this.props.dirErrorResponse !== ''}
        submit={this.submit}
        submitText="Select Directory"
        cancelText = "Cancel"
        isCancelDisabled = {true}
        isCloseDisabled = {true}
      >

        <label>Where do you want to save your hydroshare data?</label>
        <br />
        <div onChange={directoryChoice}>
          <input id="Yes" type="radio" name="dirselect" value="Yes" />Use custom directory
        <br />
          <input id="No" type="radio" name="dirselect" value="No" />Use default directory <i>(&lt;path-to-home-dir&gt;/hydroshare</i>
        </div>
        <br />
        {showDirectorySelector && <div>
          <label>Enter your custom directory path</label><br />
          <input id="myFile" type="text" onChange={(event) => { this.setState({ dirPath: event.target.value }) }} />
        </div>
        }
        {this.props.dirErrorResponse && <p className="error">{this.props.dirErrorResponse}</p>}

      </Modal>

    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelectDirModal);

//isValid={true}