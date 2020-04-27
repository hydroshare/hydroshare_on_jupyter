import * as React from 'react';
import {
  IResource,
} from '../store/types';

import '../styles/ResourceMetadata.scss';

import Tooltip from '@material-ui/core/Tooltip';
import { Theme, withStyles } from '@material-ui/core/styles';

import ArchiveResourceConfirmationModal from './modals/ArchiveResourceConfirmationModal';

export interface IPropTypes {
  resource: IResource
  promptEditPrivacy: () => any
  deleteResourcesLocally: (resources: IResource[]) => any
}

interface IStateTypes {
  modal: any
}

const BigToolTip = withStyles((theme: Theme) => ({
  tooltip: {
    fontSize: 16,
    maxWidth: 400,
  },
}))(Tooltip);

export default class ResourceMetadata extends React.Component<IPropTypes, IStateTypes> {

  state = {
    modal: MODAL_TYPES.NONE,
  };

  public render() {
    const {
      abstract,
      authors,
      creator,
      created,
      lastUpdated,
      public: is_public,
      title,
    } = this.props.resource;

    const showConfirmArchiveResourceModal = () => this.setState({ modal: MODAL_TYPES.CONFIRM_ARCHIVE_RESOURCE });

    const deleteSelectedResourceLocally = () => {
      this.props.deleteResourcesLocally(Array(this.props.resource));
      this.setState({modal: MODAL_TYPES.NONE});
    };

    const closeModal = () => this.setState({ modal: MODAL_TYPES.NONE });

    

    let modal;
      switch (this.state.modal) {
        case MODAL_TYPES.CONFIRM_ARCHIVE_RESOURCE:
          const selectedArchResources = Array(this.props.resource);
          modal = <ArchiveResourceConfirmationModal
            close={closeModal}
            resources={selectedArchResources}
            submit={deleteSelectedResourceLocally}
          />
          break;
      }
    const archiveText = " This will delete a resource from your workspace but save it in HydroShare. Please manually transfer from your workspace any remaining files you'd like to save to HydroShare before archiving as all of your files in your workspace will be lost."
    return (
      
      <div className="ResourceInfo content-row tile">
        <h1 className="title">{title}</h1>
        <div className="resource-meta-container">
          <div className="resource-info">
            <div className="info-wrapping">
                <div className="info-group">
                    <span className="info-header">Creator</span>
                    <p>{creator}</p>
                </div>
                <div className="info-group">
                    <span className="info-header">Authors</span>
                    <p>{authors}</p>
                </div>
                <div className="info-group">
                    <span className="info-header">Created</span>
                    <p>{created.format('MMM D, YYYY')}</p>
                </div>
                <div className="info-group">
                    <span className="info-header">Last Modified</span>
                    <p>{lastUpdated.format('MMM D, YYYY')}</p>
                </div>
                <div className="info-group">
                    <span className="info-header">Sharing Status</span>
                    <div>
                      <p className="info-content">{is_public ? "Public" : "Private"}</p>
                      <p className ="info-edit" onClick={this.props.promptEditPrivacy}>edit</p>
                    </div>
                </div>
                <div className="info-group">
                    <span className="info-header">Getting started</span>
                    <p>
                      <a className="info-link" href="https://www.hydroshare.org/">Starter notebook</a>
                    </p>
                </div>
                <BigToolTip 
                        title={archiveText}>
                  <button className="archive-resource"
                    onClick={showConfirmArchiveResourceModal}>
                    <span>Archive resource</span>
                  </button>
                </BigToolTip>
            </div>
            <div className="info-group">
                <span className="info-header">Abstract</span>
                <p>{abstract || "No abstract yet"}</p>
            </div>
        </div>
        </div>
        {modal}
      </div>
    )
  }

}

enum MODAL_TYPES {
  NONE,
  CONFIRM_ARCHIVE_RESOURCE,
}