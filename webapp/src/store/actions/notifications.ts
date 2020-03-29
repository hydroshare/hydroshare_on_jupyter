import { action } from 'typesafe-actions';

import {
  NotificationsActions,
} from './action-names';

export function dismissNotification(idx: number) {
  return action(NotificationsActions.DISMISS_NOTIFICATION, { idx });
}

export function pushNotification(type: 'error' | 'warning', message: string) {
  return action(NotificationsActions.PUSH_NOTIFICATION, {
    type,
    message,
  });
}
