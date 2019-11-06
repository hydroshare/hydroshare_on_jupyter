import { action } from 'typesafe-actions';
import {
  ResourceListActions,
} from './action-names';

export function goToFiles(name: string) {
  return action(ResourceListActions.GO_TO_FILES, name);
}
