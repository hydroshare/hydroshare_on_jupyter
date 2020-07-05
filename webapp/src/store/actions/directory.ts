import { action } from 'typesafe-actions';
import {
  DirectoryActions,
} from './action-names';

export function notifyDirectoryResponse(message: string) {
  return action(DirectoryActions.NOTIFY_DIRECTORY_RESPONSE, { message });
}
