import { action } from 'typesafe-actions';

import {
  IFolder,
  IJupyterResource,
} from '../types';
import { ResourcesActions } from './action-names';

export function setResources(resources: IJupyterResource[]) {
  return action(ResourcesActions.SET_RESOURCES, resources);
}

export function setResourceLocalFiles(resourceId: string, rootDir: IFolder) {
  return action(ResourcesActions.SET_RESOURCE_LOCAL_FILES, {
    resourceId,
    rootDir,
  });
}

export function setResourceHydroShareFiles(resourceId: string, rootDir: IFolder) {
  return action(ResourcesActions.SET_RESOURCE_HYDROSHARE_FILES, {
    resourceId,
    rootDir,
  });
}
