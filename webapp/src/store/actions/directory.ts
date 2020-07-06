import { action } from 'typesafe-actions';
import {
  DirectoryActions,
} from './action-names';

export function notifyDirectoryResponse(message: string) {
  return action(DirectoryActions.NOTIFY_DIRECTORY_RESPONSE, { message });
}

export function notifyFileSavedResponse(fileresponse: boolean){
  return action(DirectoryActions.NOTIFY_FILE_SAVED_RESPONSE, {fileresponse});
}