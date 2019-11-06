import { action } from 'typesafe-actions';
import { AppActions } from './action-names';
import {
  IJupyterProject,
} from '../types';

export function viewProject(project: IJupyterProject) {
  return action(AppActions.VIEW_PROJECT, project.id);
}
