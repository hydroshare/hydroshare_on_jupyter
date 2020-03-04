import { action } from 'typesafe-actions';
import {
  ThunkAction,
  ThunkDispatch,
} from "redux-thunk";
import { AnyAction } from "redux";

import { ResourcesActions } from './action-names';
import {
  getResourceHydroShareFiles,
  getResourceLocalFiles,
} from "../async-actions";

import {
  IFolder,
  IJupyterResource,
} from '../types';

export function getFilesIfNeeded(resource: IJupyterResource): ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
        if (resource && !resource.jupyterHubFiles) {
            dispatch(getResourceLocalFiles(resource.id));
        }
        if (resource && resource.hydroShareResource && !resource.hydroShareResource.files) {
            dispatch(getResourceHydroShareFiles(resource.id));
        }
    };
}

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
