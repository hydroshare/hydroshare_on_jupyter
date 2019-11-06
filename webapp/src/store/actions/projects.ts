import { action } from 'typesafe-actions';

import {
  IJupyterProject,
} from '../types';
import { ProjectsActions } from './action-names';

export function setProjects(projects: IJupyterProject[]) {
  return action(ProjectsActions.SET_PROJECTS, projects);
}
