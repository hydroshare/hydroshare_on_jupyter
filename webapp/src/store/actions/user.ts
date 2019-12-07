import { action } from 'typesafe-actions';

import {
    UserInfoActions,
} from './action-names';
import {
  IUserInfo,
} from '../types';

export function setUserInfo(userInfo: IUserInfo) {
  return action(UserInfoActions.SET_USER_INFO, userInfo);
}
