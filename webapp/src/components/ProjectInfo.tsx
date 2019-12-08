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
      name,
    } = this.props.project;
    const hydroShareUrl = `https://www.hydroshare.org/resource/${id}/`;
    return (
      <div className="ProjectInfo">
        <h1>{name}</h1>
        <a className="locate-in-hs" href={hydroShareUrl} title="Locate in HydroShare" target="_blank">Locate in HydroShare</a>
      </div>
    )
  }

}
