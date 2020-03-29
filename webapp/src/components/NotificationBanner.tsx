import * as React from 'react';
import { connect } from "react-redux";
import {
  Dispatch,
} from "redux";

import * as NotificationsActions from "../store/actions/notifications";
import {
  INotification,
  IRootState,
} from "../store/types";

import '../styles/NotificationBanner.scss';

const mapStateToProps = ({ notifications }: IRootState) => {
  return {
    ...notifications,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    dismissNotification: (idx: number) => dispatch(NotificationsActions.dismissNotification(idx)),
  }
};

type NotificationBannerProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const NotificationBanner: React.FC<NotificationBannerProps> = (props: NotificationBannerProps) => {
  return (
    <div className="NotificationBanner">
      {props.current.map((notification, idx) => (
        <Notification
          key={notification.time + notification.message}
          dismiss={() => props.dismissNotification(idx)}
          notification={notification}
        />
      ))}
    </div>
  )
};

type NotificationProps = {
  dismiss: () => any
  notification: INotification
}

const Notification: React.FC<NotificationProps> = (props: NotificationProps) => {
  const {
    dismiss,
    notification,
  } = props;

  let icon;
  switch (notification.type) {
    case 'error':
      icon = ErrorIcon;
      break;
    case 'warning':
      icon = WarningIcon;
      break;
  }

  return (
    <div className={'notification ' + notification.type}>
      <div className="content">
        {icon}
        <span className="message">
          {notification.message}
        </span>
        <span className="time">
          {notification.time.toLocaleTimeString()}
        </span>
        <div onClick={() => dismiss()} className="dismiss-button">
          <span>
            Dismiss
          </span>
        </div>
      </div>
    </div>
  )
};

const ErrorIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon error" width="10" height="10" viewBox="0 0 10 10">
    <path d="M5 0a5 5 0 00-5 5 5 5 0 005 5 5 5 0 005-5 5 5 0 00-5-5zm-.603 2.125H5.6l-.133 3.941h-.938l-.132-3.941zm.601 4.559c.19 0 .342.056.457.168a.568.568 0 01.176.43.564.564 0 01-.176.425.625.625 0 01-.457.168.635.635 0 01-.457-.168.57.57 0 01-.172-.426.57.57 0 01.172-.426.627.627 0 01.457-.171z"/>
  </svg>
);

const WarningIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon warning" width="10" height="10" viewBox="0 0 100 100">
    <path d="M49.447.014a11.715 13.054 0 00-9.593 6.513L1.57 80.418A11.715 13.054 0 0011.715 100h76.57A11.715 13.054 0 0098.43 80.418L60.146 6.528A11.715 13.054 0 0049.447.013zm-4.523 35.304h10.119l-1.117 33.15H46.04l-1.117-33.15zm5.06 38.342c1.6 0 2.88.472 3.844 1.414.986.942 1.479 2.146 1.479 3.614 0 1.445-.493 2.64-1.479 3.582-.964.942-2.245 1.412-3.844 1.412-1.577 0-2.86-.47-3.845-1.412-.964-.942-1.446-2.137-1.446-3.582 0-1.446.482-2.64 1.446-3.583.985-.963 2.268-1.445 3.845-1.445z"/>
  </svg>
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationBanner);
