import { action } from 'typesafe-actions';

import {
  IFileOrFolder,
  IJupyterResource,
} from '../types';
import { ResourcesActions } from './action-names';

export function setResources(resources: IJupyterResource[]) {
  return action(ResourcesActions.SET_RESOURCES, resources);
}

export function setResourceLocalFiles(resourceId: string, files: IFileOrFolder[]) {
  return action(ResourcesActions.SET_RESOURCE_LOCAL_FILES, {
    resourceId,
    files,
  });
}

export function setResourceHydroShareFiles(resourceId: string, files: IFileOrFolder[]) {
  return action(ResourcesActions.SET_RESOURCE_HYDROSHARE_FILES, {
    resourceId,
    files,
  });
}
