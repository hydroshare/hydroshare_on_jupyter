import { action } from 'typesafe-actions';
import { AppActions } from './action-names';

export function viewProject(projectId: string) {
  return action(AppActions.VIEW_PROJECT, projectId);
}
