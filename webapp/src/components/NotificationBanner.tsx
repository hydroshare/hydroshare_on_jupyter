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

  return (
    <div className={notification.type}>
      <div className="content">
        <span className="message">
          {notification.message}
        </span>
        <span className="time">
          {notification.time.toLocaleTimeString()}
        </span>
        <button onClick={() => dismiss()}>
          Dismiss
        </button>
      </div>
    </div>
  )
} ;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationBanner);
