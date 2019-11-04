import { action } from 'typesafe-actions';
import { WebSocketMessages } from './action-names';

export function setUserName(name: string) {
  return action(WebSocketMessages.SET_USER_NAME, name);
}
