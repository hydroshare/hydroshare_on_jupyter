import * as React from 'react';

import '../styles/ArchiveMessage.scss';

interface IArchiveMessageProps {
  message: string
}

export default class ArchiveMessage extends React.Component<IArchiveMessageProps, never> {

  public render() {
    const WarningIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="warning-icon" fill="orange" width="30" height="30" viewBox="0 0 100 100">
        <path d="M49.447.014a11.715 13.054 0 00-9.593 6.513L1.57 80.418A11.715 13.054 0 0011.715 100h76.57A11.715 13.054 0 0098.43 80.418L60.146 6.528A11.715 13.054 0 0049.447.013zm-4.523 35.304h10.119l-1.117 33.15H46.04l-1.117-33.15zm5.06 38.342c1.6 0 2.88.472 3.844 1.414.986.942 1.479 2.146 1.479 3.614 0 1.445-.493 2.64-1.479 3.582-.964.942-2.245 1.412-3.844 1.412-1.577 0-2.86-.47-3.845-1.412-.964-.942-1.446-2.137-1.446-3.582 0-1.446.482-2.64 1.446-3.583.985-.963 2.268-1.445 3.845-1.445z"/>
      </svg>
    );
    const hsResourceMeta =
      <div className="permanency-info">
        <div className="warning-icon-box">
          {WarningIcon}
        </div>
        <div className="info-title">
            <div>{this.props.message}</div>
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
