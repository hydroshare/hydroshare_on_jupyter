import { action } from 'typesafe-actions';
import { WebSocketMessages } from '../types';

export function setUserName(name: string) {
  return action(WebSocketMessages.SET_USER_NAME, name);
}
