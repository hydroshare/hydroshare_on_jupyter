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

export function notifyAttemptingHydroShareLogin() {
  return action(UserInfoActions.NOTIFY_ATTEMPTING_HYDROSHARE_LOGIN);
}

export function notifyHydroShareCredentialsInvalid() {
  return action(UserInfoActions.NOTIFY_HYDROSHARE_AUTHENTICATION_FAILED);
}

export function notifyReceivedHydroShareLoginResponse(loginSuccess: boolean) {
  return action(UserInfoActions.NOTIFY_RECEIVED_HYDROSHARE_LOGIN_RESPONSE, { loginSuccess });
}
export function checkDirectorySavedResonse(isFile: boolean){
  return action(UserInfoActions.CHECK_DIRECTORY_SAVED_RESPONSE, {isFile})
}
// new function for logout
export function removeUserInfo(loginSuccess: boolean){
  return action(UserInfoActions.LOGOUT)
 }