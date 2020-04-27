import * as React from 'react';
import {
  IResource,
} from '../store/types';

import '../styles/ResourceMetadata.scss';

export interface IPropTypes {
  resource: IResource
  promptEditPrivacy: () => any
  promptDeleteLocally: () => any
  username: string
}

export default class ResourceMetadata extends React.Component<IPropTypes, never> {

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

    const welcomeNotebookLink = `https://jupyter.cuahsi.org/user/${this.props.username}/notebooks/notebooks/Welcome.ipynb`

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
                      <a className="info-link" href={welcomeNotebookLink}>Starter notebook</a>
                    </p>
                </div>
                <button className="archive-resource"
                  onClick={this.props.promptDeleteLocally}>
                  <span>Remove from workspace</span>
                </button>
            </div>
            <div className="info-group">
                <span className="info-header">Abstract</span>
                <p>{abstract || "No abstract yet"}</p>
            </div>
        </div>
        </div>
      </div>
    )
  }

}