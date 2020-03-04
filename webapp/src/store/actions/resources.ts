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
  IRootState,
} from '../types';

export function getFilesIfNeeded(resource: IJupyterResource): ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IRootState) => {
        const {
          resourceLocalFilesBeingFetched,
          resourceHydroShareFilesBeingFetched,
        } = getState().resources;
        if (resource && !resource.jupyterHubFiles && !resourceLocalFilesBeingFetched.has(resource.id)) {
            dispatch(getResourceLocalFiles(resource));
        }
        if (resource && resource.hydroShareResource && !resource.hydroShareResource.files && !resourceHydroShareFilesBeingFetched.has(resource.id)) {
            dispatch(getResourceHydroShareFiles(resource));
        }
    };
}

export function notifyGettingResourceHydroShareFiles(resource: IJupyterResource) {
  return action(ResourcesActions.NOTIFY_GETTING_RESOURCE_HYDROSHARE_FILES, { resourceId: resource.id });
}

export function notifyGettingResourceJupyterHubFiles(resource: IJupyterResource) {
  return action(ResourcesActions.NOTIFY_GETTING_RESOURCE_JUPYTERHUB_FILES, { resourceId: resource.id });
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
