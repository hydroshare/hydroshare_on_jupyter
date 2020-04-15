import * as React from 'react';

import '../styles/FilePermanencyInfo.scss';

export default class FilePermanencyInfo extends React.Component<any, never> {

  public render() {
    const hsResourceMeta =
      <div className="permanency-info">
        <div className="info-title">
            <h2>When should you archive this project?</h2>
        </div>
        <div className="info-wrapping">
          <div className="info-group selected">
            <img className="info-img" src="/assets/CUAHSI-logo.png" alt="CUAHSI logo"></img>
            <p className="info-header">CUAHSI JupyterHub</p>
            <p className="info-content">Archive your project when you're done working on it</p>
          </div>
          <div className="info-group">
            <img className="info-img" src="/assets/Binder-logo.png" alt="Binder logo"></img>
            <p className="info-header">Binder JupyterHub</p>
            <p className="info-content">Archive your project before you close your Binder instance</p>
          </div>
          <div className="info-group">
            <img className="info-img" src="/assets/Desktop-logo.png" alt="Binder logo"></img>
            <p className="info-header">Local JupyterHub</p>
            <p className="info-content">Archive your project whenever you want</p>
          </div>
        </div>
      </div>
    return (
      <div className="PermanencyInfo content-row tile">
        <div className="permanency-info-container">
          {hsResourceMeta}
        </div>
      </div>
    )
  }

}