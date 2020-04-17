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
  IFile,
  IFolder,
  IResource,
  IRootState,
} from '../types';

export function getFilesIfNeeded(resource: IResource): ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IRootState) => {
        const {
          resourceLocalFilesBeingFetched,
          resourceHydroShareFilesBeingFetched,
        } = getState().resources;
        if (resource && !resource.localFiles && !resourceLocalFilesBeingFetched.has(resource.id)) {
            dispatch(getResourceLocalFiles(resource));
        }
        if (resource && !resource.hydroShareFiles && !resourceHydroShareFilesBeingFetched.has(resource.id)) {
            dispatch(getResourceHydroShareFiles(resource));
        }
    };
}

export function notifyGettingResources() {
  return action(ResourcesActions.NOTIFY_GETTING_RESOURCES);
}

export function notifyGettingResourcesFailed() {
  return action(ResourcesActions.NOTIFY_GETTING_RESOURCES_FAILED);
}

export function notifyGettingResourceHydroShareFiles(resource: IResource) {
  return action(ResourcesActions.NOTIFY_GETTING_RESOURCE_HYDROSHARE_FILES, { resourceId: resource.id });
}

export function notifyGettingResourceJupyterHubFiles(resource: IResource) {
  return action(ResourcesActions.NOTIFY_GETTING_RESOURCE_JUPYTERHUB_FILES, { resourceId: resource.id });
}

export function openFileInJupyter(jupyterResource: IResource, file: IFile | IFolder) {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IRootState) => {
        const state = getState();
        if (state.user) {
            const resourceId = jupyterResource.id;
            // Discard the path prefix
            const filePath = file.path.split(':')[1];
            // @ts-ignore
            const url = `${window.NOTEBOOK_URL_PATH_PREFIX}/${resourceId}/${resourceId}/data/contents${filePath}`;
            window.open(url, '_blank');
        }
    };
}

export function setResources(resources: IResource[]) {
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
