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

interface IDirectorySelectState {
  dirPath: string,
  choice: string,
  showDirectorySelector: boolean,

}

/**
 * Modal to prompt user to select a directory to download their hydroshare data into their workspace
 */

class SelectDirModal extends React.Component<ReduxType, IDirectorySelectState> {

  state = {
    dirPath: '',
    choice: 'No',
    showDirectorySelector: false
  };
  public directoryChoice = (event: any) => {
    event.target.value === "Yes" ? this.setState({ showDirectorySelector: true, choice: "Yes" }) : this.setState({ showDirectorySelector: false, choice: "No" });
  }
  submit = () => {
    this.props.uploadNewDir(this.state.dirPath, this.state.choice);

  }
  render() {
    const showDirectorySelector: boolean = this.state.showDirectorySelector;
    const { directoryChoice } = this;
    return (
      <Modal
        close={() => { }}
        title="Configure Hydroshare directory"
        isValid={true}
        submit={this.submit}
        submitText="Select"
      >

        <label>Where do you want to save your hydroshare data?</label>
        <br />
        <div onChange={directoryChoice}>
          <input id="Yes" type="radio" name="dirselect" value="Yes" />Use custom directory
        <br />
          <input id="No" type="radio" name="dirselect" value="No" />Use default directory
        </div>
        <br />
        {showDirectorySelector && <div>
          <label>Enter your custom directory path</label><br />
          <input id="myFile" type="text" width="100%" onChange={(event) => { this.setState({ dirPath: event.target.value }) }} />
        </div>
        }
        {this.props.dirResponse && <p className="error">{this.props.dirResponse}</p>}

      </Modal>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelectDirModal);
