import * as React from 'react';
import {
  IJupyterProject,
} from '../store/types';

import '../styles/css/ProjectInfo.css';

export interface IPropTypes {
  project: IJupyterProject
}

export default class ProjectInfo extends React.Component<IPropTypes, never> {

  public render() {
    const {
      id,
      title,
      hydroShareResource,
    } = this.props.project;
    const hydroShareUrl = `https://www.hydroshare.org/resource/${id}/`;
    const hsResourceMeta = hydroShareResource ? (
        <div className="resource-info">
            <div className="info-wrapping">
                <div className="info-group">
                    <span className="info-header">Author</span>
                    <p>{hydroShareResource.author}</p>
                </div>
                <div className="info-group">
                    <span className="info-header">Last Modified</span>
                    <p>{hydroShareResource.date_last_updated}</p>
                </div>
            </div>
            <div className="info-group">
                <span className="info-header">Abstract</span>
                <p>{hydroShareResource.abstract}</p>
            </div>
        </div>
    ) : null;
    return (
      <div className="ProjectInfo">
        <h1 className="title">{title}</h1>
        <div className="resource-meta-container">
          {hsResourceMeta}
          <a className="btn btn-info" href={hydroShareUrl} title="Open the page for this resource in HydroShare" target="_blank">Locate in HydroShare</a>
        </div>
      </div>
    )
  }

}
