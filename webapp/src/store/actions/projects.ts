import { action } from 'typesafe-actions';

import {
  IFileOrFolder,
  IJupyterProject,
} from '../types';
import { ProjectsActions } from './action-names';

export function setProjects(projects: IJupyterProject[]) {
  return action(ProjectsActions.SET_PROJECTS, projects);
}

export function setProjectLocalFiles(resourceId: string, files: IFileOrFolder[]) {
  return action(ProjectsActions.SET_PROJECT_LOCAL_FILES, {
    resourceId,
    files,
  });
}

export function setProjectHydroShareFiles(resourceId: string, files: IFileOrFolder[]) {
  return action(ProjectsActions.SET_PROJECT_HYDROSHARE_FILES, {
    resourceId,
    files,
  });
}
