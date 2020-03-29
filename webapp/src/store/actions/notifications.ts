import { action } from 'typesafe-actions';

import {
  NotificationsActions,
} from './action-names';

export function dismissNotification(idx: number) {
  return action(NotificationsActions.DISMISS_NOTIFICATION, { idx });
}
