import * as React from 'react';

import '../styles/GettingStarted.scss';

export interface IPropTypes {
  promptDeleteLocally: () => any
}

/**
 * Component that displays a getting started message
 */
export default class GettingStarted extends React.Component<IPropTypes, never> {

  public render() {
    // @ts-ignore
    const gettingStartedNotebookPath = window.NOTEBOOK_URL_PATH_PREFIX + '/' + window.GETTING_STARTED_NOTEBOOK_PATH;

    return (
      <div className="GettingStarted content-row tile">
        <div className="meta-container">
          <p className="info-header">For help getting started with using Jupyter notebooks or using HydroShare data, please consult this </p>
          <p><a className="notebook-link" target="_blank" href={gettingStartedNotebookPath}>Helper Notebook</a>.</p>
        </div>
      </div>
      )
  }

}