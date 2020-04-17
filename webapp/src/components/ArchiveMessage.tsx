import * as React from 'react';
import {IconContext} from 'react-icons';
import { MdWarning }  from 'react-icons/md'

import '../styles/ArchiveMessage.scss';

interface IArchiveMessageProps {
  message: string
}

export default class ArchiveMessage extends React.Component<IArchiveMessageProps, never> {

  public render() {
    const hsResourceMeta =
      <div className="permanency-info">
        <IconContext.Provider value={{className: "warning-icon" }}>
          <div className="warning-icon-box">
            <MdWarning size={40}/>
          </div>
        </IconContext.Provider>
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
