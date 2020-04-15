import * as React from 'react';

import '../styles/FilePermanencyInfo.scss';

export default class FilePermanencyInfo extends React.Component<any, never> {

  public render() {
    const hsResourceMeta =
      <div className="permanency-info">
        <div className="info-title">
            <h2>How permanent are your files?</h2>
        </div>
        <div className="info-wrapping">
          <div className="info-group">
            <img className="info-img" src="/assets/CUAHSI-logo.png" alt="CUAHSI logo"></img>
            <p className="info-header">CUAHSI JupyterHub</p>
          </div>
          <div className="info-group">
            <img className="info-img" src="/assets/Binder-logo.png" alt="Binder logo"></img>
            <p className="info-header">Binder JupyterHub</p>
          </div>
          <div className="info-group">
            <span className="info-header">Resource Type</span>
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